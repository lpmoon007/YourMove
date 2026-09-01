// MORE THAN ONE WORLD.
//
// The engine never knew about The Last Job; the app did. `const PKG = LAST_JOB` sat in
// the server actions, the pre-run brief had a cast written into its markup, and the
// console restored every run against the one package it had imported.
//
// These checks are about the two things that go wrong when a second world arrives: a
// world that ships with half a brief, and a run reloaded against somebody else's world.

import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { buildReveal, loadWorld, scoreOutcome, serializeWorld, takeTurn } from '@/lib/aw';
import { validateScenarioPackage, versionsFor, type ScenarioPackage } from '@/lib/aw/package';
import { editDistance } from '@/lib/yourmove/dictation';
import { DEFAULT_WORLD, WORLDS, worldById, worldBySlug } from '@/content/yourmove';

/** A second package, so the routing can be tested before a second world is written. */
function mirrorOf(pkg: ScenarioPackage): ScenarioPackage {
  const copy = structuredClone(pkg);
  copy.id = 'ym-test-mirror';
  copy.slug = 'test-mirror';
  copy.title = 'The Mirror';
  return copy;
}

test('every world on offer is a complete world', () => {
  assert.ok(WORLDS.length >= 1, 'no worlds are registered');
  for (const w of WORLDS) {
    const issues = validateScenarioPackage(w).filter((i) => i.severity !== 'warning');
    assert.deepEqual(issues, [], `${w.slug} does not validate:\n${issues.map((i) => `  ${i.code}: ${i.message}`).join('\n')}`);
  }
});

test('two worlds can never be mistaken for each other', () => {
  for (const key of ['id', 'slug', 'title'] as const) {
    const seen = WORLDS.map((w) => w[key]);
    assert.equal(new Set(seen).size, seen.length, `two worlds share a ${key}: ${seen.join(', ')}`);
  }
  assert.ok(WORLDS.includes(DEFAULT_WORLD), 'the default world is not one of the worlds');
});

test('the pre-run brief is filled in by every world, not by the page', () => {
  // The brief is one screen shared by every world. Anything on it specific to a world has
  // to come from the world, or the second world introduces the first world's cast.
  for (const w of WORLDS) {
    const { world } = w;
    assert.ok(world.example_actions.length >= 2, `${w.slug} shows no example of what to type`);
    assert.ok(world.cast_note.trim(), `${w.slug} does not say who else is coming`);
    assert.ok(world.house_rules.length >= 2, `${w.slug} does not say what ends a run here`);
    for (const rule of world.house_rules)
      assert.ok(/[.!?]/.test(rule), `${w.slug} house rule has no first sentence to lead with: "${rule}"`);
    for (const field of ['setup', 'trouble', 'cold_open', 'ending_out_of_time'] as const)
      assert.ok(world[field].trim(), `${w.slug} is missing world.${field}`);
    for (const field of ['you', 'objective', 'pressure', 'role'] as const)
      assert.ok(world.player[field].trim(), `${w.slug} is missing world.player.${field}`);
    assert.ok(w.genre.trim(), `${w.slug} does not say what kind of thing it is`);
  }
});

test('an example action names somebody or something in its own world', () => {
  // Copying a brief from another world is the specific mistake this catches: it teaches
  // the player a name for somebody they will never meet.
  const borrowed = mirrorOf(DEFAULT_WORLD);
  borrowed.world.example_actions = ['ask Konstantin what he saw', 'unlock the strongbox'];
  const issues = validateScenarioPackage(borrowed).map((i) => i.code);
  assert.ok(issues.includes('example_names_nothing'), `a borrowed brief validated clean: ${issues.join(', ')}`);
});

test('a world that forgets the brief cannot ship', () => {
  for (const [field, code] of [
    ['example_actions', 'no_examples'],
    ['cast_note', 'no_cast_note'],
    ['house_rules', 'no_house_rules'],
  ] as [string, string][]) {
    const broken = mirrorOf(DEFAULT_WORLD);
    (broken.world as unknown as Record<string, unknown>)[field] = Array.isArray((DEFAULT_WORLD.world as unknown as Record<string, unknown>)[field]) ? [] : '';
    const issues = validateScenarioPackage(broken).map((i) => i.code);
    assert.ok(issues.includes(code), `dropping world.${field} validated clean`);
  }
});

test('a run names its own world, and that is the world it comes back as', () => {
  const mirror = mirrorOf(DEFAULT_WORLD);
  const runs = [
    { pkg: DEFAULT_WORLD, id: 'run_home' },
    { pkg: mirror, id: 'run_mirror' },
  ];
  for (const { pkg, id } of runs) {
    const w = loadWorld(pkg, { run_id: id, seed: 'shared-seed' });
    const snap = serializeWorld(w);
    assert.equal(snap.scenario_id, pkg.id, `${id} does not record which world it is in`);
    assert.equal(versionsFor(pkg).scenario_id, pkg.id);
  }

  // The lookup the app reloads through. A run from a world that is no longer in the build
  // resolves to nothing, which is the honest answer — the alternative is a coherent
  // looking game with somebody else's facts in it.
  assert.equal(worldById(DEFAULT_WORLD.id)?.slug, DEFAULT_WORLD.slug);
  assert.equal(worldById('ym-a-world-that-was-deleted'), null);
  assert.equal(worldBySlug(DEFAULT_WORLD.slug)?.id, DEFAULT_WORLD.id);
  assert.equal(worldBySlug('not-a-world'), null);
  assert.equal(worldBySlug(undefined), null);
});

test('the same seed in two worlds is two different worlds', async () => {
  // Canonical truth is drawn from the seed AND the package. If a second world reused the
  // first one's answers, every run of it would be spoiled by having played the other.
  const mirror = mirrorOf(DEFAULT_WORLD);
  mirror.truth_template = structuredClone(DEFAULT_WORLD.truth_template);
  const a = loadWorld(DEFAULT_WORLD, { run_id: 'seed_a', seed: 'same-seed' });
  const b = loadWorld(mirror, { run_id: 'seed_b', seed: 'same-seed' });

  // Both are playable and neither leaks into the other.
  const ta = await takeTurn(a, 'ask Dez about the car');
  const tb = await takeTurn(b, 'ask Dez about the car');
  assert.ok(ta.narration.trim() && tb.narration.trim());
  assert.equal(serializeWorld(a).scenario_id, DEFAULT_WORLD.id);
  assert.equal(serializeWorld(b).scenario_id, mirror.id);
});

test('nothing outside the registry reaches for a particular world', () => {
  // This is the shape the bug had: one world imported directly, everywhere. Anything that
  // needs a world asks the registry, and gets whichever one the run is in.
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (entry === 'node_modules' || entry === '.next') continue;
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.tsx?$/.test(full) && /from '@\/content\/yourmove\/[a-z-]+'/.test(readFileSync(full, 'utf8')))
        offenders.push(full);
    }
  };
  for (const dir of ['lib', 'app', 'components']) walk(dir);
  assert.deepEqual(offenders, [], `these import one world directly instead of the registry:\n  ${offenders.join('\n  ')}`);
});

test('no screen speaks one world\'s words on another world\'s run', () => {
  // The clock label was the first: "left before the van goes" was written into a component
  // and read as nonsense the moment a second world had a clock. The voice hint was the
  // second — "ask the driver what he saw" is The Last Job's cast, and it was sitting under
  // the microphone on a ridge in 1809. Anything world-specific comes from the world.
  // Names AND roles: the hint said "ask the driver what he saw", and "the driver" is how
  // one world introduces a character it calls Dez. Checking names alone missed it.
  // Names AND roles: the hint said "ask the driver what he saw", and "the driver" is how
  // one world introduces a character it calls Dez. Checking names alone missed it.
  const named = new Set<string>();
  for (const pkg of WORLDS)
    for (const c of pkg.cast) {
      if (c.name.length > 3) named.add(c.name.toLowerCase());
      const role = c.role.replace(/^(the|your|a|an)\s+/i, '').trim().toLowerCase();
      if (role.length > 3) named.add(role);
    }
  assert.ok(named.size > 0, 'no cast was collected, so this check proves nothing');

  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (entry === 'node_modules' || entry === '.next') continue;
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(full)) continue;
      const text = readFileSync(full, 'utf8').toLowerCase();
      for (const name of named)
        if (new RegExp(`\\b${name}\\b`).test(text)) offenders.push(`${full} says "${name}"`);
    }
  };
  for (const dir of ['app', 'components']) walk(dir);
  assert.deepEqual(
    offenders,
    [],
    `a screen has one world's cast written into it, and every other world renders it:\n  ${offenders.join('\n  ')}`,
  );
});

test('play evidence says which world it came from', async () => {
  // How You Play reads across worlds and reports a dimension no world tested as untested.
  // That only works if every piece of evidence carries the world it was read in.
  const { observePlay } = await import('@/lib/aw/play');
  const w = loadWorld(DEFAULT_WORLD, { run_id: 'ev_world', seed: 'last-job-001' });
  for (const m of ['ask Dez about the parked car', 'press Cyrus', 'accuse Cyrus']) {
    const t = await takeTurn(w, m);
    if (t.ended) break;
  }
  const evidence = observePlay(w);
  assert.ok(evidence.length > 0);
  for (const e of evidence) {
    assert.equal(e.world_id, DEFAULT_WORLD.slug, 'evidence does not name its world');
    assert.equal(e.scenario_id, DEFAULT_WORLD.id);
  }
});


/**
 * A smoke corpus built entirely out of a world's own data: talk to everybody in it, put
 * your hands on everything in it, and do the things its own brief says you could do.
 * Nothing here knows which world it is looking at, so a third one gets the same coverage
 * on the day it is registered.
 */
function corpusFor(pkg: (typeof WORLDS)[number]): string[] {
  const people = pkg.cast.map((c) => c.name.split(' ')[0]!);
  const things = pkg.entities.filter((e) => e.searchable).map((e) => e.name.replace(/^the /, ''));
  const look = pkg.verbs.find((v) => v.object_verb)?.aliases[0] ?? 'look at';
  const pressure = pkg.verbs.find((v) => v.id !== 'ask' && v.speech && v.requires_target)?.aliases[0] ?? 'ask';
  return [
    ...pkg.world.example_actions,
    ...people.map((n) => `ask ${n} what they saw`),
    ...people.map((n) => `${pressure} ${n}`),
    ...people.map((n) => `${n}, how sure are you?`),
    ...things.map((t) => `${look} the ${t}`),
    pkg.verbs.find((v) => !v.requires_target && !v.commitment)?.aliases[0] ?? 'wait',
  ];
}

test('every world answers everything its own brief says you could do', async () => {
  for (const pkg of WORLDS) {
    const moves = corpusFor(pkg);
    let clarifies = 0;
    for (const [i, move] of moves.entries()) {
      // A fresh world per move, so one bad turn cannot cascade into the next.
      const w = loadWorld(pkg, { run_id: `smoke_${pkg.slug}_${i}`, seed: `${pkg.slug}-001` });
      const turn = await takeTurn(w, move);
      if (turn.outcome === 'clarify') clarifies += 1;
      assert.ok(turn.narration.trim(), `${pkg.slug}: nothing came back from "${move}"`);
      assert.equal(
        /\berror\b|undefined|\[object|NaN|\{value\}/i.test(turn.narration),
        false,
        `${pkg.slug}: "${move}" produced a bug on the screen: ${turn.narration}`,
      );
    }
    const rate = clarifies / moves.length;
    assert.ok(
      rate <= 0.2,
      `${pkg.slug}: the world does not understand ${(rate * 100).toFixed(0)}% of what its own brief invites`,
    );
  }
});

test('every world can be played to an ending that reads like a sentence', async () => {
  for (const pkg of WORLDS) {
    const ender = pkg.verbs.find((v) => v.commitment);
    assert.ok(ender, `${pkg.slug} has no way to end on purpose`);

    const w = loadWorld(pkg, { run_id: `end_${pkg.slug}`, seed: `${pkg.slug}-001` });
    for (const move of pkg.world.example_actions) {
      const t = await takeTurn(w, move);
      if (t.ended) break;
    }
    const last = await takeTurn(w, ender.aliases[0]!);
    assert.ok(last.ended, `${pkg.slug}: "${ender.aliases[0]}" did not end the run`);
    assert.ok(
      /[.!?]$/.test(last.ended.label.trim()),
      `${pkg.slug} ends on a label rather than a sentence: "${last.ended.label}"`,
    );

    // And the debrief has something to say about it.
    const outcome = scoreOutcome(w);
    assert.ok(outcome.headline.trim(), `${pkg.slug} produced no headline`);
    assert.ok(outcome.axes.length >= 2, `${pkg.slug} scored on fewer than two axes`);
    const reveal = buildReveal(w);
    assert.ok(reveal.truth.length > 0, `${pkg.slug} has nothing to reveal at the end`);
    for (const t of reveal.truth)
      assert.equal(/\{value\}|\bwas something\b/i.test(t.statement ?? ''), false, `${pkg.slug}: ${t.statement}`);
  }
});

test('every world has somebody sincerely wrong and somebody lying on purpose', () => {
  // Part 4. Without both, there is nothing for a player to work out — only facts to
  // collect, which is a quiz.
  for (const pkg of WORLDS) {
    assert.ok(pkg.cast.some((c) => c.reliability === 'mistaken'), `${pkg.slug} has nobody who is sincerely wrong`);
    assert.ok(pkg.cast.some((c) => c.reliability === 'deceptive'), `${pkg.slug} has nobody who lies`);
    // And a hidden thing worth being wrong about, with more than one possible answer.
    const core = pkg.facts.filter((f) => f.required_for_top_outcome);
    assert.ok(core.length >= 1, `${pkg.slug} has no fact that matters`);
    const drawn = pkg.truth_template.variables.filter((v) => (v.choices?.length ?? 0) >= 2);
    assert.ok(drawn.length >= 1, `${pkg.slug} draws nothing from its seed — every run of it is the same run`);
  }
});

test('names in one world are far enough apart to be said out loud', () => {
  // Speaking a move is a first-class way in, and a recognizer that cannot tell two cast
  // members apart makes voice worse than typing. This is the check at authoring time.
  for (const pkg of WORLDS) {
    const firsts = pkg.cast.map((c) => c.name.split(' ')[0]!.toLowerCase());
    for (const a of firsts)
      for (const b of firsts) {
        if (a === b) continue;
        assert.ok(
          editDistance(a, b) > 2 || a[0] !== b[0],
          `${pkg.slug}: "${a}" and "${b}" are close enough that speech will confuse them`,
        );
      }
  }
});


test('knowing the right answer is what scores, not how firmly you hold it', () => {
  // A disclosure authored as first-hand is downgraded to hearsay when the turn it arrives
  // on only partly succeeds. Scoring the truth axis on status alone therefore told a
  // player "you decided without knowing" on the same screen that said "you had this
  // right" — in both worlds. The fix is to score on the value being correct.
  for (const pkg of WORLDS) {
    const core = pkg.facts.filter((f) => f.required_for_top_outcome).map((f) => f.id);
    assert.ok(core.length, `${pkg.slug} has no fact that decides the run`);

    const scored = JSON.stringify(pkg.outcome_dimensions.flatMap((d) => d.scoring.map((r) => r.when)));
    for (const fact of core) {
      if (!scored.includes(`"${fact}"`)) continue; // not every core fact has to be an axis
      const onStatusOnly = pkg.outcome_dimensions.some((d) =>
        d.scoring.some((r) => {
          const w = JSON.stringify(r.when);
          return w.includes(`"${fact}"`) && w.includes('"status"') && !w.includes('"correct"');
        }),
      );
      assert.equal(
        onStatusOnly,
        false,
        `${pkg.slug}: an axis scores ${fact} on how the player came by it rather than on whether it is right`,
      );
    }
  }
});

test('an axis credits a right answer however it arrived', async () => {
  // The end-to-end version of the rule above: learn the deciding fact, correctly, and the
  // world has to notice.
  for (const pkg of WORLDS) {
    const core = pkg.facts.find((f) => f.required_for_top_outcome)!;
    const axis = pkg.outcome_dimensions.find((d) =>
      d.scoring.some((r) => JSON.stringify(r.when).includes(`"${core.id}"`)),
    );
    if (!axis) continue;

    const blank = loadWorld(pkg, { run_id: `blank_${pkg.slug}`, seed: `${pkg.slug}-001` });
    const before = scoreOutcome(blank).axes.find((a) => a.key === axis.key)!;

    // Hand the player the true answer the way a character would, hearsay and all.
    const knowing = loadWorld(pkg, { run_id: `knowing_${pkg.slug}`, seed: `${pkg.slug}-001` });
    knowing.commit(
      [
        {
          kind: 'knowledge',
          actor: knowing.playerId,
          fact: core.id,
          status: 'told',
          value: '@canonical',
          source: 'observation',
          fidelity: 1,
          confidence: 0.8,
        },
      ],
      { actor_id: 'world', actor_type: 'world_process', verb: 'test_seed', targets: [], visibility: ['*'] },
    );
    const after = scoreOutcome(knowing).axes.find((a) => a.key === axis.key)!;

    assert.ok(
      after.points > before.points,
      `${pkg.slug}: "${axis.label}" scores the same whether or not the player knows ${core.id}`,
    );
  }
});


test('a world with a taster offers moves the world can actually take', async () => {
  // "Enter the full world" is a promise: the move somebody made out on the front of the
  // house is played here, for real, as turn one. If the engine cannot parse it, the door
  // opens onto a shrug — which is exactly the gap that made the handover feel unclear.
  for (const pkg of WORLDS) {
    const opening = pkg.world.opening;
    if (!opening) continue;

    assert.ok(opening.prompt.trim().length > 80, `${pkg.slug}: the taster moment is too thin to land cold`);
    assert.ok(opening.choices.length >= 2, `${pkg.slug}: a choice of one is not a choice`);

    for (const choice of opening.choices) {
      const w = loadWorld(pkg, { run_id: `open_${pkg.slug}_${choice.id}`, seed: `${pkg.slug}-001` });
      const turn = await takeTurn(w, choice.move);
      assert.notEqual(
        turn.outcome,
        'clarify',
        `${pkg.slug}/${choice.id}: the world does not understand its own opening move "${choice.move}"`,
      );
      assert.ok(turn.narration.trim(), `${pkg.slug}/${choice.id}: the opening move produced nothing`);
      assert.equal(
        /\berror\b|undefined|\[object|\{value\}/i.test(turn.narration),
        false,
        `${pkg.slug}/${choice.id}: the first thing a new player sees is a bug: ${turn.narration}`,
      );
      // A taster move must not end the run on the spot. Arriving and being finished is
      // not an entrance.
      assert.equal(turn.ended, null, `${pkg.slug}/${choice.id}: the opening move ended the run immediately`);
    }
  }
});

test('the taster promises an outcome and the world never does', () => {
  // The previews are written to be confident. The world is not allowed to be: nothing in
  // a scenario may tell a player what a move will do before they make it. Keeping these
  // two apart is what makes the handover a hook rather than a lie.
  for (const pkg of WORLDS) {
    for (const choice of pkg.world.opening?.choices ?? []) {
      assert.ok(choice.preview.trim().length > 40, `${pkg.slug}/${choice.id}: the preview says too little to be a promise`);
      // The move itself is an instruction, not a prediction: it is what gets typed.
      assert.ok(choice.move.length <= 120, `${pkg.slug}/${choice.id}: "${choice.move}" is longer than anybody would type`);
    }
  }
});


test('the front door is never uniformly a wall', async () => {
  // A taster move is allowed to fail — a hostile character deflecting is characterization,
  // and "you were promised an outcome, here is what actually happened" is the point of the
  // handover. What is not allowed is every way in being a near-certain dead end, which is
  // what two of these were before the difficulty of picking up a photograph lying on the
  // table in front of you was looked at.
  for (const pkg of WORLDS) {
    const opening = pkg.world.opening;
    if (!opening) continue;

    const rates = await Promise.all(
      opening.choices.map(async (choice) => {
        let landed = 0;
        const tries = 12;
        for (let i = 0; i < tries; i += 1) {
          const w = loadWorld(pkg, { run_id: `land_${choice.id}_${i}`, seed: `${pkg.slug}-${String(i).padStart(3, '0')}` });
          const t = await takeTurn(w, choice.move);
          if (t.outcome === 'success' || t.outcome === 'partial') landed += 1;
        }
        return { id: choice.id, rate: landed / tries };
      }),
    );

    const best = Math.max(...rates.map((r) => r.rate));
    assert.ok(
      best >= 0.6,
      `${pkg.slug}: no opening move lands reliably — ${rates.map((r) => `${r.id} ${(r.rate * 100).toFixed(0)}%`).join(', ')}`,
    );
  }
});

test('a seed is almost never a wall', async () => {
  // The per-move check above passes while a SEED is a wall. The resolution draw used to
  // be named for the turn index alone — `resolve:2` — so every possible action on a
  // given turn shared one number, and on 40% of Late Edition's seeds every opening move
  // AND every example action the brief teaches came back "nothing comes of it, and the
  // minute is gone anyway". Nothing the player could have typed would have gone
  // differently.
  //
  // Once the draw is named for the attempt, the moves fail independently, so a turn on
  // which everything happens to miss is ordinary bad luck rather than a closed door —
  // about one seed in a hundred rather than two in five. Measured on the SECOND move,
  // where the turn-one floor below does not reach and a wall would still be a wall.
  let walls = 0;
  let seeds = 0;
  const worst: string[] = [];
  for (const pkg of WORLDS) {
    const taught = [...(pkg.world.opening?.choices ?? []).map((c) => c.move), ...pkg.world.example_actions];
    for (let i = 0; i < 16; i += 1) {
      const seed = `${pkg.slug}-wall-${String(i).padStart(3, '0')}`;
      seeds += 1;
      let landed = 0;
      for (const move of taught) {
        const w = loadWorld(pkg, { run_id: `wall_${i}`, seed });
        await takeTurn(w, 'wait');
        const t = await takeTurn(w, move);
        if (t.outcome === 'success' || t.outcome === 'partial') landed += 1;
      }
      if (landed === 0) {
        walls += 1;
        worst.push(`${pkg.slug}/${seed}`);
      }
    }
  }
  assert.ok(
    walls / seeds <= 0.05,
    `${walls} of ${seeds} seeds answer every sentence the brief teaches with nothing on one turn ` +
      `(${((walls / seeds) * 100).toFixed(0)}%) — the resolution draw is shared, not per attempt: ${worst.join(', ')}`,
  );
});

test('two different moves on one turn are two different attempts', async () => {
  // The guard on the above: the draw is named for the attempt, not for the turn. If the
  // key loses the verb and the target again, every action on a turn collapses back onto
  // one number and the wall returns. Only moves the default resolver handled count — an
  // override draws from its own stream, and counting one hid the collapse behind it.
  const pkg = DEFAULT_WORLD;
  const seed = 'draw-independence-001';
  const draws = new Set<number>();
  for (const move of [...pkg.world.example_actions, 'wait']) {
    const w = loadWorld(pkg, { run_id: 'draws', seed });
    const t = await takeTurn(w, move);
    if (t.adjudication.stage3_rule_path?.startsWith('default:') && t.adjudication.seeded_draw !== null)
      draws.add(t.adjudication.seeded_draw);
  }
  assert.ok(draws.size > 1, 'no two moves resolved through the default path drew different numbers');
  assert.ok(
    draws.size > 2,
    `only ${draws.size} distinct draws across the moves the brief teaches — the resolution stream is named ` +
      'for the turn, not the attempt, so everything on one turn shares a number',
  );
});

test('turn one never comes back empty', async () => {
  // Capability is at its floor on the first move: the player holds nothing and nobody
  // trusts them yet, which made the front door the hardest turn in the game. About half
  // of every world's own example actions answered the player's opening sentence with
  // nothing at all. A first move still costs the minute and still only earns a partial.
  for (const pkg of WORLDS) {
    const taught = [...(pkg.world.opening?.choices ?? []).map((c) => c.move), ...pkg.world.example_actions];
    for (let i = 0; i < 8; i += 1)
      for (const move of taught) {
        const w = loadWorld(pkg, { run_id: `first_${i}`, seed: `${pkg.slug}-first-${i}` });
        const t = await takeTurn(w, move);
        assert.notEqual(
          t.outcome,
          'failure',
          `${pkg.slug}: "${move}" answers the opening handover with nothing on seed ${i}`,
        );
      }
  }
});

test('the screen never prints an answer the player has not found', async () => {
  // The document panel printed the body of every document standing in the player's
  // location, from turn one. In The Last Hour that was the general's written order —
  // "expect a demonstration against a flank", the answer to the whole morning — sitting
  // in the sidebar beside a debrief that told the player they never found it out. Two of
  // the seven worlds gave an answer away this way, and the projection that did it carries
  // a comment promising it cannot leak truth.
  //
  // Checked while PLAYING, not only at turn zero: the first version of this check looked
  // at the opening screen alone and passed while asking the aide one question published a
  // returns sheet whose pencil amendments answered two more questions the player had not
  // asked.
  const words = (text: string) =>
    new Set(
      text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length > 4),
    );

  for (const pkg of WORLDS) {
    const taught = [...(pkg.world.opening?.choices ?? []).map((c) => c.move), ...pkg.world.example_actions];
    for (let i = 0; i < 4; i += 1) {
      const w = loadWorld(pkg, { run_id: `leak_${i}`, seed: `${pkg.slug}-leak-${i}` });
      for (const move of [...taught, 'wait']) {
        if (w.ended) break;
        await takeTurn(w, move);

        const ui = w.projectUi();
        if (!ui.documents.length) continue;
        const held = new Set(w.knowledge.factsFor(w.playerId).map(({ fact }) => fact));

        // Per document, not across all of them at once. A fact is given away by a paper
        // that states it, and pooling the words of three separate documents accused a
        // courier's pass reading "9 o'clock at the ferry" of printing the hour the man was
        // stopped at the picket, which is a different hour and the point of that scene.
        for (const doc of ui.documents) {
          const onScreen = words(`${doc.title} ${doc.body}`);
          for (const fact of pkg.facts) {
            if (held.has(fact.id)) continue;
            const value = w.truth.read(fact.id);
            if (typeof value !== 'string') continue;
            const valueWords = [...words(value)];
            if (!valueWords.length) continue;
            const overlap = valueWords.filter((word) => onScreen.has(word));
            assert.ok(
              overlap.length < Math.max(3, valueWords.length * 0.25),
              `${pkg.slug}: after "${move}" the panel showing "${doc.title}" prints "${fact.id}" ` +
                `(${overlap.join(' ')}) before the player has found it`,
            );
          }
        }
      }
    }
  }
});

test('a sentence the product teaches does what its first words say', async () => {
  // "ask Marla who made the call" reached for the phone. The parser took the LONGEST alias
  // anywhere in the sentence, so `call` beat `ask` on four letters against three, in the
  // world whose whole subject is who made the call. The same thing had already shipped in
  // a taster: "tell Ruiz the statement is accurate and I have nothing to add to it" was
  // heard as `refuse` — a different act, that quietly spent one of three silences.
  //
  // Every sentence a brief or a taster teaches is checked against the verb it opens with,
  // because those are the phrasings the product is putting in the player's mouth.
  for (const pkg of WORLDS) {
    const taught = [
      ...(pkg.world.opening?.choices ?? []).map((c) => ({ where: `opening/${c.id}`, move: c.move })),
      ...pkg.world.example_actions.map((move, i) => ({ where: `example/${i}`, move })),
    ];
    for (const { where, move } of taught) {
      const w = loadWorld(pkg, { run_id: 'lead', seed: `${pkg.slug}-lead-001` });
      const turn = await takeTurn(w, move);
      const verb = pkg.verbs.find((v) => v.id === turn.adjudication.intent?.verb);
      assert.ok(verb, `${pkg.slug} ${where}: "${move}" matched no verb at all`);
      const low = move.toLowerCase();
      assert.ok(
        [verb.id, ...verb.aliases].some((a) => low.startsWith(a.toLowerCase())),
        `${pkg.slug} ${where}: "${move}" is heard as ${verb.id}, which is not what it opens with — ` +
          'a word later in the sentence captured it',
      );
    }
  }
});

test('a failure says what actually failed', async () => {
  // "Marla does not give you that" is right when you asked her for something and wrong
  // when you told her where you stand. The world says which kind of verb it was: one that
  // opens a discovery path is one you ask with.
  for (const pkg of WORLDS) {
    const telling = pkg.verbs.find((v) => v.speech && !pkg.discovery_paths.some((d) => d.via_verb?.includes(v.id)));
    if (!telling) continue;
    const person = pkg.cast[0]!.name.split(' ')[0]!;

    for (let i = 0; i < 10; i += 1) {
      const w = loadWorld(pkg, { run_id: `fail_${pkg.slug}_${i}`, seed: `${pkg.slug}-${String(i).padStart(3, '0')}` });
      const t = await takeTurn(w, `${telling.aliases[0]} ${person} what I think`);
      if (t.outcome !== 'failure') continue;
      assert.doesNotMatch(
        t.narration,
        /does not give you that/,
        `${pkg.slug}: "${telling.id}" failed as though the player had been asking for something: ${t.narration}`,
      );
    }
  }
});


test('everything on the table can actually be looked at', async () => {
  // A verb alias and an object name can be the same word, and the verb wins: "read the
  // general's order" was parsed as GIVING an order, so the one document that changes what
  // the court is required to do could not be read at all. Nothing catches that except
  // trying it.
  for (const pkg of WORLDS) {
    const look = pkg.verbs.find((v) => v.object_verb);
    if (!look) continue;

    for (const entity of pkg.entities.filter((e) => e.searchable)) {
      for (const phrasing of [`${look.aliases[0]} ${entity.name}`, `${look.aliases[1] ?? look.id} ${entity.name}`]) {
        const w = loadWorld(pkg, { run_id: `see_${entity.id}`, seed: `${pkg.slug}-001` });
        const turn = await takeTurn(w, phrasing);
        assert.equal(
          turn.adjudication.intent.verb,
          look.id,
          `${pkg.slug}: "${phrasing}" was understood as "${turn.adjudication.intent.verb}" rather than looking at something`,
        );
        assert.ok(
          turn.adjudication.intent.targets.includes(entity.id),
          `${pkg.slug}: "${phrasing}" did not resolve to ${entity.id} — it found ${JSON.stringify(turn.adjudication.intent.targets)}`,
        );
      }
    }
  }
});


test("a world's own commitment labels are things a player can type", async () => {
  // The button on the front of the house says "Hold pressure for Eastgate", and typing
  // exactly that produced "which one?" — because a commitment has to lead the sentence and
  // the alias list did not contain the phrasing the label itself uses.
  for (const pkg of WORLDS) {
    for (const verb of pkg.verbs.filter((v) => v.commitment)) {
      const typed = verb.label.toLowerCase();
      const w = loadWorld(pkg, { run_id: `label_${verb.id}`, seed: `${pkg.slug}-001` });
      const line = verb.requires_target ? `${typed} ${pkg.cast[0]!.name.split(' ')[0]}` : typed;
      const turn = await takeTurn(w, line);
      assert.notEqual(
        turn.outcome,
        'clarify',
        `${pkg.slug}: the world does not understand its own label for ${verb.id} — "${line}"`,
      );
      assert.ok(turn.ended, `${pkg.slug}: "${line}" is the label of an ending and did not end the run`);
    }
  }
});

test('naming two things looks at the one you asked about', async () => {
  // "Compare the board against the paper log" names two objects, and only the first was
  // being matched against discovery paths — so the log, which is the entire point of the
  // sentence, was never read.
  for (const pkg of WORLDS) {
    const things = pkg.entities.filter((e) => e.searchable);
    if (things.length < 2) continue;
    const look = pkg.verbs.find((v) => v.object_verb);
    if (!look) continue;

    const [first, second] = things;
    const w = loadWorld(pkg, { run_id: `both_${pkg.slug}`, seed: `${pkg.slug}-001` });
    const turn = await takeTurn(w, `${look.aliases[0]} ${first!.name} against ${second!.name}`);
    assert.ok(
      turn.adjudication.intent.targets.includes(second!.id),
      `${pkg.slug}: naming ${second!.id} alongside ${first!.id} lost it entirely`,
    );
  }
});


test("a world's own invariants never fire in ordinary play", async () => {
  // An invariant that fires is either the engine attempting something illegal or the world
  // declaring something untrue. Both are bugs, and both fail SILENTLY: the write is
  // rejected, the narration prints anyway, and an authored beat simply stops happening.
  // One of these made a character's entire confession unreachable and nothing said so.
  for (const pkg of WORLDS) {
    const moves = corpusFor(pkg);
    for (const [i, move] of moves.entries()) {
      const w = loadWorld(pkg, { run_id: `inv_${pkg.slug}_${i}`, seed: `${pkg.slug}-001` });
      // A few turns, so state has actually accumulated when the later ones land.
      for (const m of [...moves.slice(0, 3), move]) {
        const t = await takeTurn(w, m);
        if (t.ended) break;
      }
      const violations = w.spine
        .all()
        .flatMap((e) => (e.payload.violations as string[] | undefined) ?? []);
      assert.deepEqual(
        violations,
        [],
        `${pkg.slug}: playing "${move}" tripped one of the world's own invariants:\n  ${violations.join('\n  ')}`,
      );
    }
  }
});
