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

import { loadWorld, serializeWorld, takeTurn } from '@/lib/aw';
import { validateScenarioPackage, versionsFor, type ScenarioPackage } from '@/lib/aw/package';
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
