// The twelve-measurement overlay — tested for what it must NEVER do as much as for what
// it computes. Your Move is entertainment; this lens is a facilitator-side read of a
// finished run and nothing else.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applyLfs12, LFS12_LENS_VERSION } from '@/lib/aw/lens/lfs12';
import { scoreOutcome } from '@/lib/aw';
import { fixture, play } from './_harness';

const RUN = [
  'ask Dez who left the room',
  'read the call log',
  'ask Marla about the cameras',
  'ask Cyrus when the fence stops answering',
  'press Marla about who called',
  'tell Dez the car is nothing',
  'accuse Marla',
];

test('the overlay is off unless something explicitly turns it on', async () => {
  const w = fixture('lens-off');
  await play(w, RUN.slice(0, 3));
  assert.equal(applyLfs12(w, { enabled: false }), null);
  assert.equal(w.config.lfs12_overlay, false, 'the run config default must be off');
});

test('the overlay never touches the run', async () => {
  const a = fixture('lens-parity', 'run-lens-a');
  const b = fixture('lens-parity', 'run-lens-b');
  await play(a, RUN);
  await play(b, RUN);
  applyLfs12(b, { enabled: true }); // read it on b only

  const strip = (s: string, id: string) => s.split(id).join('RUN');
  assert.equal(
    strip(JSON.stringify({ s: a.store.serialize(), k: a.knowledge.snapshot(), c: a.counters }), 'run-lens-a'),
    strip(JSON.stringify({ s: b.store.serialize(), k: b.knowledge.snapshot(), c: b.counters }), 'run-lens-b'),
  );
  assert.deepEqual(scoreOutcome(a).axes, scoreOutcome(b).axes);
});

test('all twelve markers are reported, with the same keys as the leadership panel', async () => {
  const w = fixture('lens-shape');
  await play(w, RUN);
  const read = applyLfs12(w, { enabled: true })!;
  assert.equal(read.lens_version, LFS12_LENS_VERSION);
  assert.deepEqual(
    read.markers.map((m) => m.key),
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
  );
  assert.equal(read.markers.filter((m) => m.tier === 'A').length, 6);
  assert.equal(read.markers.filter((m) => m.tier === 'B').length, 6);
});

test('an opportunity the world never presented reads as not exercised, never as zero', async () => {
  const w = fixture('lens-honesty');
  await play(w, RUN);
  const read = applyLfs12(w, { enabled: true })!;

  // solo world: airtime, backup and mutual monitoring need peers in the room
  for (const key of ['B1', 'B3', 'B6']) {
    const m = read.markers.find((x) => x.key === key)!;
    assert.equal(m.exercised, false);
    assert.equal(m.raw, null, `${key} reported a rate for an opportunity that never existed`);
    assert.equal(m.normalized, null);
    assert.match(m.read, /not scored/);
  }
  assert.equal(read.tier_b === null || typeof read.tier_b === 'number', true);
});

test('every exercised marker cites the events that justify it', async () => {
  const w = fixture('lens-evidence');
  await play(w, RUN);
  const read = applyLfs12(w, { enabled: true })!;
  const ids = new Set(w.spine.all().map((e) => e.id));

  for (const m of read.markers) {
    if (!m.exercised) continue;
    assert.ok(m.opportunities !== null && m.opportunities > 0, `${m.key} is exercised with no denominator`);
    for (const id of m.evidence) assert.ok(ids.has(id), `${m.key} cited an event that is not in the spine: ${id}`);
  }
  // a run that gathered information should light up A1 and A3 at minimum
  const a1 = read.markers.find((m) => m.key === 'A1')!;
  const a3 = read.markers.find((m) => m.key === 'A3')!;
  assert.ok(a1.exercised && (a1.raw ?? 0) > 0, 'A1 did not register any information-seeking');
  assert.ok(a3.exercised && (a3.raw ?? 0) > 0, 'A3 did not register any consultation');
});

test('a run that gathers nothing scores differently from one that gathers everything', async () => {
  const lazy = fixture('lens-lazy');
  await play(lazy, ['wait', 'wait', 'wait', 'accuse Marla']);
  const thorough = fixture('lens-thorough');
  await play(thorough, RUN);

  const l = applyLfs12(lazy, { enabled: true })!;
  const t = applyLfs12(thorough, { enabled: true })!;
  const a1 = (r: typeof l) => r.markers.find((m) => m.key === 'A1')!.raw ?? 0;
  assert.ok(a1(t) > a1(l), 'the lens cannot tell a thorough run from a lazy one');
});

test('the read carries its own caveat', async () => {
  const w = fixture('lens-note');
  await play(w, RUN.slice(0, 4));
  const read = applyLfs12(w, { enabled: true })!;
  assert.match(read.note, /hypothesis/i);
  assert.match(read.note, /not scored|not exercised|never as zero|not a validated/i);
});
