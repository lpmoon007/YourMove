// L11 / A3 — determinism and replay.
//
// Same scenario version, same seed, same action sequence, same recorded model outputs
// produces the same final state. Every time. Deterministic replay is a hard acceptance
// criterion because every later feature depends on it.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { comparable, loadWorld, takeTurn, versionsFor } from '@/lib/aw';
import { fingerprintWorld, fixture, PKG, play } from './_harness';

const SCRIPT = [
  'ask Dez who left the room',
  'read the call log',
  'ask Marla about the car on the corner',
  'offer Marla ten thousand',
  'press Marla about who called',
  'wait',
  'accuse Marla',
];

test('A3 — the same seed and the same actions reproduce an identical world', async () => {
  const a = fixture('determinism-seed', 'run-a');
  const b = fixture('determinism-seed', 'run-b');
  await play(a, SCRIPT);
  await play(b, SCRIPT);

  // run ids differ by design, so normalize them out before comparing
  const norm = (s: string, id: string) => s.split(id).join('RUN');
  assert.equal(norm(fingerprintWorld(a), 'run-a'), norm(fingerprintWorld(b), 'run-b'));
});

test('a different seed produces a materially different world', async () => {
  const seen = new Set<string>();
  for (const seed of ['s-1', 's-2', 's-3', 's-4', 's-5', 's-6', 's-7', 's-8']) {
    const w = loadWorld(PKG, { run_id: `seed-${seed}`, seed });
    seen.add(w.truth.read('leak_source') ?? '');
  }
  assert.ok(seen.size >= 2, `eight seeds produced ${seen.size} distinct culprits — the seed is not doing anything`);
});

test('the event spine is append-only and fully ordered', async () => {
  const w = fixture('spine-1');
  await play(w, SCRIPT.slice(0, 4));
  const events = w.spine.all();
  for (let i = 0; i < events.length; i++) {
    assert.equal(events[i]!.seq, i + 1);
    assert.ok(events[i]!.world_time >= (events[i - 1]?.world_time ?? 0), 'world time went backwards');
  }
  // frozen: no consumer can rewrite history
  assert.throws(() => {
    (events[0] as unknown as { verb: string }).verb = 'tampered';
  });
});

test('causality is written at creation, never inferred (L7)', async () => {
  const w = fixture('causality-1');
  const turns = await play(w, SCRIPT.slice(0, 5));
  const derived = turns.flatMap((t) => t.events).filter((e) => e.actor_type !== 'player' && e.verb !== 'world_created');
  assert.ok(derived.length > 0, 'nothing downstream happened at all');
  for (const e of derived) {
    const hasCause = e.causality.caused_by.length > 0 || e.causality.revealed_by.length > 0;
    assert.ok(hasCause, `${e.verb} has no causal parent`);
  }
  // and the chain is queryable in both directions
  const firstAction = w.spine.all().find((e) => e.actor_type === 'player')!;
  assert.ok(w.spine.chainFrom(firstAction.id).length > 0);
  const last = w.spine.all()[w.spine.length - 1]!;
  assert.ok(w.spine.chainTo(last.id).length > 0);
});

test('runs are only comparable when every version matches (item 2)', () => {
  const v = versionsFor(PKG);
  assert.ok(comparable(v, { ...v }));
  assert.equal(comparable(v, { ...v, content_version: '1.0.1' }), false);
  assert.equal(comparable(v, { ...v, engine_ruleset_version: 'aw-engine-9' }), false);
});

test('the seeded stream is stable per label, so adding a draw elsewhere does not shift it', async () => {
  const a = fixture('stream-1', 'x');
  const first = a.rng.draw('resolve:1');
  const b = fixture('stream-1', 'y');
  b.rng.draw('director:0');
  b.rng.draw('director:1');
  assert.equal(b.rng.draw('resolve:1'), first);
});

test('an unsolvable world is rejected at load, not discovered mid-run (item 3)', async () => {
  const broken = structuredClone(PKG);
  // remove one of the two independent routes to a required fact
  broken.discovery_paths = broken.discovery_paths.filter((p) => p.id !== 'p_time_cyrus');
  broken.facts = broken.facts.map((f) =>
    f.id === 'call_time' ? { ...f, discoverable_via: ['p_time_ledger'] } : f,
  );
  assert.throws(() => loadWorld(broken, { run_id: 'broken', seed: 'x' }), /single_path|unsolvable/);
});
