// HOW YOU PLAY — the language guardrail, and the architectural rule.
//
// THE KEY RULE: measure observable play behavior, never personality. The system says
// "this is how you tended to play in these worlds"; it never says "this is who you are".
//
// These tests exist because that rule is easy to state and easy to violate one adjective
// at a time.

import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { takeTurn } from '@/lib/aw';
import { awardBadges, buildProfile, buildRunCard, CORE_EIGHT, observePlay, worldDimensions } from '@/lib/aw/play';
import { loadWorld } from '@/lib/aw';
import { WORLDS } from '@/content/yourmove';
import { fixture, PKG } from './_harness';

/** Vocabulary that turns a play pattern into a claim about a person. */
const BANNED =
  /\b(personality|psychologic\w*|psychometric|diagnos\w*|assessment|leadership style|emotional intelligence|behavioral type|risk personality|character trait|your traits?)\b/i;

/** "You are X" is the sentence this whole layer exists not to write. */
const IS_CLAIM = /\byou are (?:an?|the|very|quite|highly|naturally|fundamentally)\s+\w+/i;

async function playedRun(moves: string[], id = 'play-1') {
  const w = fixture('last-job-001', id);
  for (const m of moves) {
    const t = await takeTurn(w, m);
    if (t.ended) break;
  }
  return w;
}

const TALKER = ['ask Dez about the parked car', 'read the call log', 'offer Marla ten thousand', 'ask Marla who called the police', 'accuse Marla'];
const BRUISER = ['search the call log', 'press Dez', 'press Cyrus', 'accuse Cyrus'];

test('one moment produces at most one reading per dimension', async () => {
  // The evidence table is unique on (run_id, opportunity_id, dimension). If two readings
  // of the same moment ever reach it, the database keeps one and the profile the player
  // sees stops matching the run they just played. Merging happens in observePlay; this is
  // the check that it kept up with new signals.
  for (const [label, moves] of [
    ['talker', TALKER],
    ['bruiser', BRUISER],
    ['spender', ['offer Marla ten thousand', 'pay Cyrus to make the call', 'give Dez ten grand and tell him to drive', 'walk out with the bag']],
    ['looker', ['read the call log', 'search the tablet', 'look out the window at the car', 'open the duffel and count it', 'wait']],
    ['quiet', ['quietly ask Cyrus about Marla', 'pull Dez aside and ask who left the room', 'say nothing and watch Marla', 'accuse Marla']],
  ] as [string, string[]][]) {
    const world = await playedRun(moves, `dup-${label}`);
    const seen = new Set<string>();
    for (const e of observePlay(world)) {
      const key = `${e.run_id}|${e.opportunity_id}|${e.dimension}`;
      assert.equal(seen.has(key), false, `${label}: two readings of ${e.dimension} for one moment (${key})`);
      seen.add(key);
    }
  }
});

test('no dimension copy describes a person', () => {
  for (const d of CORE_EIGHT) {
    for (const [where, line] of [
      ['measures', d.measures],
      ['left', d.copy_left],
      ['right', d.copy_right],
      ['mixed', d.copy_mixed],
    ] as const) {
      assert.equal(BANNED.test(line), false, `${d.id} ${where} uses assessment language: "${line}"`);
      assert.equal(IS_CLAIM.test(line), false, `${d.id} ${where} says what someone IS: "${line}"`);
      assert.match(line, /\byou\b/i, `${d.id} ${where} should address the player directly`);
    }
    // Both ends have to be sayable without judgment.
    assert.equal(/\b(better|worse|should|failure|weak|poor|strong point)\b/i.test(d.copy_left + d.copy_right), false, `${d.id} ranks one end above the other`);
  }
});

test('nothing generated for a player describes a person', async () => {
  const w = await playedRun(TALKER);
  const evidence = observePlay(w);
  const profile = buildProfile(evidence);
  const lines = [
    profile.note,
    ...profile.contradictions,
    ...(profile.title ? [profile.title.name, profile.title.because] : []),
    ...profile.reads.flatMap((r) => [r.read, r.confidence_note, r.measures]),
    ...evidence.map((e) => e.context),
    ...awardBadges(w, evidence).flatMap((b) => [b.name, b.earned_for]),
    buildRunCard(evidence).sentence,
  ];
  for (const line of lines) {
    assert.equal(BANNED.test(line), false, `generated copy uses assessment language: "${line}"`);
    assert.equal(IS_CLAIM.test(line), false, `generated copy says what someone IS: "${line}"`);
  }
});

test('the simulation never reads the play layer (the architectural rule)', () => {
  // simulation runtime → event spine → pattern engine → How You Play.
  // Not: the runtime deciding somebody is diplomatic.
  //
  // `store/` is excluded because it is the sink at the end of that arrow: it persists
  // evidence after a run. It is held to a narrower rule below — types only, no behavior.
  const runtimeFiles: string[] = [];
  const storeFiles: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry !== 'play') walk(full);
      } else if (full.endsWith('.ts')) {
        (full.includes('/store/') ? storeFiles : runtimeFiles).push(full);
      }
    }
  };
  walk('lib/aw');
  assert.ok(runtimeFiles.length > 15 && storeFiles.length >= 3, 'the file sweep found nothing to check');

  for (const file of runtimeFiles) {
    const src = readFileSync(file, 'utf8');
    assert.equal(
      /from '\.{1,2}\/play\/|from '@\/lib\/aw\/play/.test(src),
      false,
      `${file} imports the play layer — the runtime must never see it`,
    );
    assert.equal(
      /PlayEvidence|buildProfile|observePlay|CORE_EIGHT|PlayProfile/.test(src),
      false,
      `${file} references the play layer`,
    );
  }

  // The store may carry evidence to a table. It may not compute or interpret any of it.
  for (const file of storeFiles) {
    const src = readFileSync(file, 'utf8');
    for (const line of src.split('\n')) {
      if (!/\/play\//.test(line)) continue;
      assert.match(line, /^import type /, `${file} imports behavior from the play layer: ${line.trim()}`);
    }
    assert.equal(
      /buildProfile|observePlay|awardBadges|CORE_EIGHT/.test(src),
      false,
      `${file} computes a play read; it should only store one`,
    );
  }
});

test('a How You Play write can never stop somebody playing', () => {
  // The architectural rule has a runtime half: the play layer is downstream, so a failure
  // writing evidence, a badge or a run's owner must not reach the player. This shipped
  // broken once — a database missing the How You Play migration made "Start the clock"
  // fail at the front door, because bookkeeping threw and took the run with it.
  const src = readFileSync('lib/yourmove/actions.ts', 'utf8');
  const guarded = /withoutBreakingPlay\(/;
  for (const call of ['claimRun', 'savePlayEvidence', 'saveBadges']) {
    for (const line of src.split('\n')) {
      if (!line.includes(`${call}(`) || line.trimStart().startsWith('*')) continue;
      assert.match(line, guarded, `${call} is called unguarded — a failed write would break play: ${line.trim()}`);
    }
  }
  // And the guard has to actually swallow, not rethrow.
  assert.match(src, /async function withoutBreakingPlay[\s\S]*?catch \(err\)[\s\S]*?console\.error/);
  const body = src.slice(src.indexOf('async function withoutBreakingPlay'));
  assert.equal(/catch \(err\) \{[\s\S]*?throw/.test(body.slice(0, 500)), false, 'the guard rethrows');
});

test('evidence cites a real event, a real world, and what was typed', async () => {
  const w = await playedRun(TALKER);
  const ids = new Set(w.spine.all().map((e) => e.id));
  const evidence = observePlay(w);
  assert.ok(evidence.length >= 6, 'a five-move run produced almost no evidence');

  for (const e of evidence) {
    assert.ok(ids.has(e.opportunity_id), `evidence cites an event not in the spine: ${e.opportunity_id}`);
    assert.equal(e.world_id, PKG.slug);
    assert.ok(e.direction >= -1 && e.direction <= 1, 'direction out of range');
    assert.ok(e.strength > 0 && e.strength <= 1, 'strength out of range');
    assert.ok(e.context.trim().length > 10, `evidence has no readable reason: "${e.context}"`);
  }
});

test('a dimension no world tested reads as untested, never as neutral', async () => {
  const w = await playedRun(['wait', 'wait']);
  const profile = buildProfile(observePlay(w));
  const untested = profile.reads.filter((r) => r.opportunities === 0);
  assert.ok(untested.length > 0, 'a two-move run somehow exercised all eight');
  for (const r of untested) {
    assert.equal(r.position, null, `${r.dimension} reported a position with no evidence`);
    assert.equal(r.slider, null);
    assert.equal(r.confidence, null);
    assert.match(r.read, /^No world has put you in this situation yet\.$/);
    assert.match(r.confidence_note, /yet/i);
  }
});

test('opposite runs read as context-dependent, not as a confident middle', async () => {
  const a = observePlay(await playedRun(TALKER, 'run-talker'));
  const b = observePlay(await playedRun(BRUISER, 'run-bruiser'));
  const profile = buildProfile([...a, ...b], { runOrder: ['run-talker', 'run-bruiser'] });
  const fd = profile.reads.find((r) => r.dimension === 'force_diplomacy')!;

  assert.equal(fd.confidence, 'context-dependent', `negotiating in one run and escalating in the next read as "${fd.confidence}"`);
  assert.ok(fd.variation && fd.variation.length >= 2, 'the variation behind a context-dependent read is not shown');
  assert.ok(fd.evidence.length > 0 && fd.counter_evidence.length > 0, 'both sides of a split read should be visible');
});

test('a title is earned from a pattern, and never from one thin run', async () => {
  const thin = buildProfile(observePlay(await playedRun(['wait'])));
  assert.equal(thin.title, null, 'one move was enough to earn a title');

  const a = observePlay(await playedRun(TALKER, 'r1'));
  const b = observePlay(await playedRun(TALKER, 'r2'));
  const profile = buildProfile([...a, ...b], { runOrder: ['r1', 'r2'] });
  if (profile.title) {
    assert.ok(profile.title.because.length > 10, 'a title should say what earned it');
    assert.equal(IS_CLAIM.test(profile.title.because), false);
  }
});

test('play evidence cannot change what happens in a world', async () => {
  // The same seed and the same moves must produce the same run whether or not anybody
  // ever looks at the play layer.
  const clean = await playedRun(TALKER, 'clean');
  const watched = await playedRun(TALKER, 'watched');
  observePlay(watched);
  awardBadges(watched, observePlay(watched));
  buildProfile(observePlay(watched));

  const strip = (s: string, id: string) => s.split(id).join('RUN');
  assert.equal(
    strip(JSON.stringify({ s: clean.store.serialize(), k: clean.knowledge.snapshot(), c: clean.counters }), 'clean'),
    strip(JSON.stringify({ s: watched.store.serialize(), k: watched.knowledge.snapshot(), c: watched.counters }), 'watched'),
  );
});

test('every badge is earned for something that happened', async () => {
  const w = await playedRun(TALKER);
  for (const b of awardBadges(w, observePlay(w))) {
    assert.ok(b.earned_for.length > 15, `${b.id} does not say what earned it`);
    assert.equal(IS_CLAIM.test(b.earned_for), false, `${b.id} describes a person: "${b.earned_for}"`);
    assert.equal(b.run_id, w.run_id);
  }
});

test("every world's own two questions get asked, and get words", async () => {
  // A world declares two dimensions no other world has. They were declared in all eleven
  // and fed by none: nothing emitted a signal for one, nothing passed them to the profile,
  // and the shapes did not even match — worlds write label_left, a dimension wants left —
  // so a run card had nothing of its own to say and would have rendered blank if it had.
  const seen = new Map<string, number>();

  for (const pkg of WORLDS) {
    const own = worldDimensions(pkg);
    assert.equal(own.length, (pkg.world_specific_dimensions ?? []).length, `${pkg.slug}: dimensions lost in translation`);
    for (const d of own) {
      // By name, not by whatever keys happen to be present: the raw world declaration has
      // id/label_left/label_right/measures and passes an "every value is a string" check
      // while having none of the fields a read is built from.
      for (const field of ['left', 'right', 'measures', 'copy_left', 'copy_right', 'copy_mixed'] as const)
        assert.ok(
          typeof d[field] === 'string' && d[field].trim(),
          `${pkg.slug}/${d.id}: ${field} is missing or empty — this renders as a blank line to a player`,
        );
      // The copy is generated from the label, so a Title Case label must not survive into
      // the middle of a sentence: "you tended to wait For Certainty" is not English.
      for (const copy of [d.copy_left, d.copy_right, d.copy_mixed])
        assert.doesNotMatch(copy.slice(copy.indexOf(' ') + 1), /\s[A-Z][a-z]/, `${pkg.slug}/${d.id}: Title Case leaked into "${copy}"`);
    }

    // And they have to actually come out of play, not just exist.
    const moves = [
      ...(pkg.world.opening?.choices ?? []).map((c) => c.move),
      ...pkg.world.example_actions,
      pkg.verbs.find((v) => v.commitment)!.label.toLowerCase(),
    ];
    const w = loadWorld(pkg, { run_id: 'own', seed: `${pkg.slug}-own-dims` });
    for (const m of moves) {
      const t = await takeTurn(w, m);
      if (t.ended) break;
    }
    const card = buildRunCard(observePlay(w), own);
    seen.set(pkg.slug, card.world_reads.length);
    for (const r of card.world_reads)
      assert.ok(r.read.trim() && !/undefined/.test(r.read), `${pkg.slug}/${r.dimension}: read is "${r.read}"`);
  }

  const silent = [...seen.entries()].filter(([, n]) => n === 0).map(([slug]) => slug);
  assert.deepEqual(silent, [], `these worlds said nothing of their own after a full run: ${silent.join(', ')}`);
});

// ---------------------------------------------------------------------------
// The engine and the play layer may not name one world's content.
//
// badges.ts shipped keyed on the fact ids `leak_source` and `sedan_truth`, the flags
// `named_right` / `named_wrong`, and a resource called `cash`. All five belong to The
// Last Job and to nothing else, so six of eleven badges were unearnable in ten of the
// eleven worlds — and every badge test passed, because they all played The Last Job.
// This is the class, not the instance: anything under lib/ that names a thing only one
// world declares is content that has escaped into shared code.
// ---------------------------------------------------------------------------

/** Every id a package declares, from the structured places rather than by reading source. */
function declaredIds(pkg: (typeof WORLDS)[number]): Set<string> {
  const ids = new Set<string>();
  for (const f of pkg.facts) ids.add(f.id);
  for (const id of Object.keys(pkg.world.resources)) ids.add(id);
  for (const e of pkg.entities) ids.add(e.id);
  for (const c of pkg.cast) ids.add(c.id);
  // Flags are set by effects and read by predicates; both are plain objects in the data.
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    const o = node as Record<string, unknown>;
    if (o.kind === 'flag' && typeof o.id === 'string') ids.add(o.id);
    if (typeof o.flag === 'string') ids.add(o.flag);
    Object.values(o).forEach(walk);
  };
  walk(pkg as unknown);
  return ids;
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

test('no shared module names content that only one world declares', () => {
  const owners = new Map<string, Set<string>>();
  for (const pkg of WORLDS)
    for (const id of declaredIds(pkg)) {
      const set = owners.get(id) ?? new Set<string>();
      set.add(pkg.slug);
      owners.set(id, set);
    }
  // Ids only one world uses. Short ones are excluded: a two- or three-letter id collides
  // with ordinary English and would report the word rather than the reference.
  const soleOwned = [...owners].filter(([id, w]) => w.size === 1 && id.length >= 4);
  assert.ok(soleOwned.length > 50, 'expected the worlds to declare plenty of their own ids');

  const offenders: string[] = [];
  for (const file of sourceFiles(join(process.cwd(), 'lib'))) {
    const src = readFileSync(file, 'utf8');
    for (const [id, worlds] of soleOwned)
      if (src.includes(`'${id}'`) || src.includes(`"${id}"`))
        offenders.push(`${file.replace(process.cwd() + '/', '')} names '${id}', declared only by ${[...worlds][0]}`);
  }
  assert.deepEqual(offenders, [], `shared code is keyed on one world's content:\n  ${offenders.join('\n  ')}`);
});

test('no badge is awarded on every finished run', async () => {
  // "Nothing Blew Up" was awarded on 264 of 264 runs across all eleven worlds, at a
  // rarity that sat it beside things almost nobody earns. A badge everybody always gets
  // is a certificate of attendance. Rates are measured properly by npm run audit:badges;
  // this only fails the build on the degenerate case.
  const finished: string[][] = [];
  for (const pkg of WORLDS.slice(0, 5)) {
    const people = pkg.cast.map((c) => c.name.split(' ')[0]!);
    const things = pkg.entities.filter((e) => e.searchable).map((e) => e.name.replace(/^the /, ''));
    const look = pkg.verbs.find((v) => v.object_verb)?.aliases[0] ?? 'look at';
    const ends = pkg.verbs.filter((v) => v.commitment);
    const shapes = [
      [...things.map((t) => `${look} the ${t}`), ...people.map((n) => `ask ${n} what they saw`)],
      [...people.map((n) => `ask ${n} what they saw`), ...ends.map((e) => `${e.label.toLowerCase()} ${people[0]}`)],
      [...ends.map((e) => `${e.label.toLowerCase()} ${people[0]}`)],
    ];
    for (const moves of shapes) {
      const world = loadWorld(pkg, { run_id: `rate-${pkg.slug}-${moves.length}`, seed: `${pkg.slug}-rate` });
      for (const m of moves) {
        if (world.ended) break;
        await takeTurn(world, m);
      }
      let guard = 0;
      while (!world.ended && guard++ < 40) await takeTurn(world, 'wait');
      if (world.ended) finished.push(awardBadges(world, observePlay(world)).map((b) => b.id));
    }
  }
  assert.ok(finished.length >= 8, `expected several finished runs, got ${finished.length}`);
  const everywhere = finished[0]!.filter((id) => finished.every((run) => run.includes(id)));
  assert.deepEqual(everywhere, [], `awarded on every single run: ${everywhere.join(', ')}`);
});

test('nothing a player reads on the profile is built out of an id', () => {
  // The profile page printed "It reads differently depending on the world: inbound Caution
  // · the-nod Boldness · high-water Boldness" and "You play caution in inbound and boldness
  // in last-job". Nobody who spent an hour in The Last Job has ever seen the word
  // "last-job": a slug on the screen is the page admitting it was assembled by a program.
  // Run ids are worse — they are UUIDs.
  const worlds = ['last-job', 'inbound', 'the-nod'];
  const titles = { 'last-job': 'The Last Job', inbound: 'Inbound', 'the-nod': 'The Nod' };
  const runs = ['9f3c1e22-0000-4aaa-8bbb-000000000001', '9f3c1e22-0000-4aaa-8bbb-000000000002'];
  // The same dimension played opposite ways in different worlds, which is what makes a
  // read context-dependent and puts the variation copy on the screen.
  const evidence = [0, 1, 2, 3, 4, 5].map((i) => ({
    run_id: runs[i % 2]!,
    world_id: worlds[i % 3]!,
    opportunity_id: `op-${i}`,
    dimension: 'caution_boldness',
    direction: worlds[i % 3] === 'last-job' ? -0.9 : 0.9,
    strength: 1,
    confidence: 1,
    context: 'You committed.',
    quote: 'go',
    taxonomy: 'play-v0.1',
  }));
  const profile = buildProfile(evidence as never, { worldTitles: titles });
  const read = profile.reads.find((r) => r.dimension === 'caution_boldness')!;
  assert.equal(read.confidence, 'context-dependent', 'the fixture should split by world');

  const onScreen = [read.read, read.variation_note ?? '', ...profile.contradictions, profile.note].join(' \n ');
  for (const slug of worlds)
    assert.ok(!onScreen.includes(slug), `the profile prints the world id "${slug}":\n${onScreen}`);
  for (const id of runs) assert.ok(!onScreen.includes(id), 'the profile prints a run id');
  assert.ok(onScreen.includes('The Last Job') && onScreen.includes('Inbound'), 'it should name the worlds');
  // And every world in the evidence resolves, so nothing rendering from this hits a blank.
  for (const slug of worlds) assert.ok(profile.world_titles[slug], `no title for ${slug}`);
});
