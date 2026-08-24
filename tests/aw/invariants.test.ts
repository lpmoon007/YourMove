// ITEM 6 — every invariant class has an automated test that attempts a violation and
// confirms rejection PLUS a clean log entry. There is no back door, including for tests:
// each attempt goes through the same World.commit every other caller uses.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Effect } from '@/lib/aw';
import { fixture } from './_harness';

function attempt(seed: string, effects: Effect[]) {
  const w = fixture(seed);
  const before = JSON.stringify(w.store.serialize());
  const { result } = w.commit(effects, {
    actor_id: 'system',
    actor_type: 'system',
    verb: 'test_violation',
    targets: [],
  });
  return { w, result, unchanged: JSON.stringify(w.store.serialize()) === before };
}

test('existence — a destroyed thing stays destroyed', () => {
  const w = fixture('inv-existence');
  w.commit([{ kind: 'existence', id: 'ledger', op: 'destroy' }], {
    actor_id: 'system',
    actor_type: 'system',
    verb: 'burn',
    targets: ['ledger'],
  });
  const before = JSON.stringify(w.store.serialize());
  const { result } = w.commit([{ kind: 'object', id: 'ledger', state: 'unread' }], {
    actor_id: 'system',
    actor_type: 'system',
    verb: 'test_violation',
    targets: ['ledger'],
  });
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.invariant === 'existence'));
  assert.equal(JSON.stringify(w.store.serialize()), before);
});

test('conservation — you cannot move money you do not hold', () => {
  const { result, unchanged } = attempt('inv-conservation', [
    { kind: 'resource', id: 'cash', from: 'you', to: 'marla', amount: 500000 },
  ]);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.invariant === 'conservation'));
  assert.ok(unchanged);
});

test('knowledge — a source cannot disclose what it does not hold (L6)', () => {
  const { result, unchanged } = attempt('inv-knowledge', [
    { kind: 'knowledge', actor: 'you', fact: 'call_time', status: 'told', value: '11:04', source: 'dez' },
  ]);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.invariant === 'knowledge'));
  assert.ok(unchanged);
});

test('temporal — travel time cannot be skipped', () => {
  const { result, unchanged } = attempt('inv-temporal', [{ kind: 'position', entity: 'dez', location: 'hall' }]);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.invariant === 'temporal'));
  assert.ok(unchanged);

  // the same move WITH the minute it costs is legal
  const w = fixture('inv-temporal-ok');
  const { result: ok } = w.commit(
    [
      { kind: 'clock', minutes: 1 },
      { kind: 'position', entity: 'dez', location: 'hall' },
    ],
    { actor_id: 'dez', actor_type: 'character', verb: 'step_out', targets: [] },
  );
  assert.equal(ok.ok, true);
});

test('temporal — time cannot run backwards', () => {
  const { result } = attempt('inv-backwards', [{ kind: 'clock', minutes: -10 }]);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.invariant === 'temporal'));
});

test('exclusivity — a scenario-declared contradiction is refused', () => {
  const { result, unchanged } = attempt('inv-exclusive', [
    { kind: 'flag', id: 'named_right', value: true },
    { kind: 'flag', id: 'named_wrong', value: true },
  ]);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.invariant === 'exclusivity'));
  assert.ok(unchanged);
});

test('exclusivity — a scenario-declared forbidden state is refused', () => {
  const { result } = attempt('inv-forbidden', [{ kind: 'flag', id: 'marla_paid', value: true }]);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.message.includes('paid_without_paying')));
});

test('capability — a disposition cannot be written for someone who is not in the world', () => {
  const { result } = attempt('inv-capability', [{ kind: 'disposition', actor: 'nobody_at_all', axis: 'trust', delta: 50 }]);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.invariant === 'capability'));
});

test('truth — the layer refuses mutation and reports its own fingerprint', () => {
  const w = fixture('inv-truth');
  const before = w.truth.fingerprint();
  // the object is frozen: an assignment throws in strict mode rather than silently failing
  assert.throws(() => {
    (w.truth as unknown as { values: Record<string, string> }).values = { leak_source: 'cyrus' };
  });
  assert.equal(w.truth.fingerprint(), before);
  assert.ok(w.truth.verifyUnchanged());
});

test('every rejection is logged with invariant, attempted write, and origin (item 6)', () => {
  const { w } = attempt('inv-log', [{ kind: 'clock', minutes: -1 }]);
  assert.equal(w.store.rejections.length, 1);
  const r = w.store.rejections[0]!;
  assert.equal(r.actor_id, 'system');
  assert.equal(r.attempted.length, 1);
  assert.ok(r.violations[0]!.invariant);
  assert.ok(r.violations[0]!.message.length > 0);
});

test('an effect set is applied whole or not at all', () => {
  const w = fixture('inv-atomic');
  const cashBefore = w.store.read().resources.cash!.you;
  const { result } = w.commit(
    [
      { kind: 'resource', id: 'cash', from: 'you', to: 'marla', amount: 1000 }, // legal
      { kind: 'clock', minutes: -5 }, // illegal
    ],
    { actor_id: 'you', actor_type: 'player', verb: 'test_violation', targets: [] },
  );
  assert.equal(result.ok, false);
  assert.equal(w.store.read().resources.cash!.you, cashBefore, 'the legal half of an illegal set was applied');
});
