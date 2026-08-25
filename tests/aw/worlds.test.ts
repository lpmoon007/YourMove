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
