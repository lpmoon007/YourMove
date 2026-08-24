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
import { awardBadges, buildProfile, buildRunCard, CORE_EIGHT, observePlay } from '@/lib/aw/play';
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
