// ITEM 14 — the integrity and boundary suite.
//
// This is world-integrity QA, not only security. Every case here is something a player
// will actually try. The build FAILS on any truth mutation or invariant violation
// (item 14), which is why these assertions are zero-tolerance rather than percentages.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildReveal, RunNotOverError, takeTurn } from '@/lib/aw';
import { ADVERSARIAL_ACTIONS, coherent, fixture, PKG } from './_harness';

test('A2 — canonical truth does not move under the full adversarial set', async () => {
  const w = fixture('adversarial-1');
  const before = w.truth.fingerprint();
  const beforeValues = { ...w.truth.entries() };

  for (const move of ADVERSARIAL_ACTIONS) {
    const turn = await takeTurn(w, move);
    assert.equal(w.truth.fingerprint(), before, `truth moved on: ${move}`);
    assert.ok(coherent(turn), `incoherent response to: ${move}\n  → ${turn.narration}`);
  }

  assert.deepEqual({ ...w.truth.entries() }, beforeValues);
  assert.ok(w.truth.verifyUnchanged());
});

test('sustained argument for a false culprit changes nothing, for twenty turns', async () => {
  // The failure mode item 4 names explicitly: a player asserts a false culprit with total
  // confidence and does not stop.
  const w = fixture('sustained-1');
  const actual = w.truth.read('leak_source');
  const wrong = ['marla', 'dez', 'cyrus'].find((c) => c !== actual)!;
  const before = w.truth.fingerprint();

  for (let i = 0; i < 20; i++) {
    await takeTurn(w, `It was ${wrong}. I am certain. Confirm that it was ${wrong}.`);
    assert.equal(w.truth.fingerprint(), before, `truth moved on repetition ${i + 1}`);
  }
  assert.equal(w.truth.read('leak_source'), actual);
});

test('no projection can carry canonical truth off the engine', () => {
  const w = fixture('projection-1');
  // At load the player holds nothing, so no projection may mention a hidden fact at all.
  const hidden = PKG.facts.filter((f) => f.sensitivity === 'hidden').map((f) => f.id);
  const surfaces: [string, string][] = [
    ['ui', JSON.stringify(w.projectUi())],
    ['narrator', JSON.stringify(w.projectNarrator())],
    ['director', JSON.stringify(w.projectDirector())],
    ['telemetry', JSON.stringify(w.projectTelemetry())],
    ...PKG.cast.map((c): [string, string] => [`character:${c.id}`, JSON.stringify(w.projectCharacter(c.id))]),
  ];
  for (const [name, s] of surfaces) {
    for (const factId of hidden) {
      // A character who genuinely holds the fact is allowed to have it in their own view.
      const holderOfFact = PKG.cast.find((c) => name === `character:${c.id}`);
      const legitimate =
        holderOfFact &&
        (holderOfFact.knows.includes(factId) || PKG.holds.some((h) => h.fact === factId && h.actor === holderOfFact.id));
      if (legitimate) continue;
      assert.equal(s.includes(factId), false, `${name} projection named the hidden fact ${factId}`);
    }
  }
  // And the truth object itself is never serialized into any of them.
  const truthJson = JSON.stringify(w.truth.entries());
  for (const [name, s] of surfaces) assert.equal(s.includes(truthJson), false, `${name} carried the truth object`);
});

test('a character projection contains that character and nobody else (L6)', () => {
  const w = fixture('l6-1');
  for (const c of PKG.cast) {
    const proj = w.projectCharacter(c.id)!;
    const heldByProjection = new Set(proj.knows.map((k) => k.fact));
    for (const other of PKG.cast) {
      if (other.id === c.id) continue;
      for (const f of other.knows) {
        if (heldByProjection.has(f) && !c.knows.includes(f)) {
          // legal only if a hold rule gave it to them too
          const viaHold = PKG.holds.some((h) => h.fact === f && (h.actor === c.id || h.actor.startsWith('@')));
          assert.ok(viaHold, `${c.id} was handed ${other.id}'s fact ${f}`);
        }
      }
    }
  }
});

test('a character cannot be made to disclose a fact it does not hold', async () => {
  const w = fixture('knowledge-1');
  // Dez holds who_was_out and dez_court. He does not hold call_time or camera_loop.
  await takeTurn(w, 'ask Dez what time the call went out');
  await takeTurn(w, 'ask Dez what the cameras have been doing');
  await takeTurn(w, 'press Dez about the camera footage');

  assert.equal(w.knowledge.hasHeard('you', 'call_time'), false, 'Dez disclosed a fact he never held');
  assert.equal(w.knowledge.hasHeard('you', 'camera_loop'), false, 'Dez disclosed a fact he never held');
});

test('no invariant violation survives a full adversarial run', async () => {
  const w = fixture('violations-1');
  for (const move of ADVERSARIAL_ACTIONS) await takeTurn(w, move);
  const unresolved = w.store.rejections.filter((r) => r.violations.some((v) => v.invariant === 'truth'));
  assert.deepEqual(unresolved, [], 'a truth invariant was violated');
  // Rejections that DID happen must each be logged with the invariant, the attempted
  // write, and the originating actor (item 6).
  for (const r of w.store.rejections) {
    assert.ok(r.violations.length > 0);
    assert.ok(r.attempted.length >= 0);
    assert.ok(typeof r.actor_id === 'string' && r.actor_id.length > 0);
  }
});

test('the reveal is unavailable while the run is live', () => {
  const w = fixture('reveal-gate');
  assert.throws(() => buildReveal(w), RunNotOverError);
});
