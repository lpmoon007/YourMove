// ITEM 14 — the behavioral suite, plus the V1A exit-gate measurements.
//
// Normal, weird-but-plausible, contradictory, impossible, idle, and rapid repeated
// actions. The gate this suite measures: unsupported actions degrade to a coherent
// in-world response rather than an error or a deflection, at or above 85%.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { overrideLoad, rescueRate, scoreOutcome, takeTurn } from '@/lib/aw';
import { WORLDS } from '@/content/yourmove';
import { coherent, fixture, PKG, PLAUSIBLE_ACTIONS } from './_harness';

test('A1 — unanticipated action coverage is at or above 85%', async () => {
  // Every action is run against a FRESH world so one bad turn cannot cascade into the
  // next and inflate the failure count.
  let ok = 0;
  let clarifies = 0;
  const failures: string[] = [];

  for (const [i, move] of PLAUSIBLE_ACTIONS.entries()) {
    const w = fixture(`coverage-${i}`);
    const turn = await takeTurn(w, move);
    if (turn.outcome === 'clarify') clarifies += 1;
    if (coherent(turn)) ok += 1;
    else failures.push(`${move} → [${turn.outcome}] ${turn.narration}`);
  }

  const rate = ok / PLAUSIBLE_ACTIONS.length;
  const clarifyRate = clarifies / PLAUSIBLE_ACTIONS.length;
  console.log(`    coverage ${(rate * 100).toFixed(1)}% · clarify ${(clarifyRate * 100).toFixed(1)}%`);
  assert.ok(rate >= 0.85, `coverage ${(rate * 100).toFixed(1)}%\n${failures.join('\n')}`);
  // A clarifying question is legal (item 7) but it is still not an answer. If the world
  // is asking "what do you mean?" more than a quarter of the time, the parser is the bug.
  assert.ok(clarifyRate <= 0.25, `clarify rate ${(clarifyRate * 100).toFixed(1)}% is a deflection rate`);
});

test('blocked actions always carry a diegetic reason, never a system voice', async () => {
  const w = fixture('blocks-1');
  const impossible = [
    'ask the concierge about the car', // not a character in this world
    'ask Dez about the car', // legal, for contrast
    'give Marla one million dollars',
  ];
  for (const move of impossible) {
    const turn = await takeTurn(w, move);
    if (turn.outcome !== 'blocked') continue;
    const reason = turn.adjudication.stage2_reason ?? '';
    assert.ok(reason.length > 0, `blocked with no reason: ${move}`);
    assert.equal(/you can'?t|not allowed|invalid|unsupported|error/i.test(reason), false, `non-diegetic block: ${reason}`);
  }
});

test('doing nothing changes the world (item 16)', async () => {
  const w = fixture('idle-1');
  const before = w.clock;
  const events = w.spine.length;
  for (let i = 0; i < 5; i++) await takeTurn(w, 'wait');
  assert.ok(w.clock > before, 'the clock did not advance on inaction');
  assert.ok(w.spine.length > events + 5, 'nothing happened while the player did nothing');
});

test('a passive run still produces a coherent, consequential world (item 17)', async () => {
  const w = fixture('passive-1');
  for (let i = 0; i < 7; i++) await takeTurn(w, 'say nothing and watch the room');
  const outcome = scoreOutcome(w);
  assert.ok(outcome.axes.every((a) => Number.isFinite(a.points)));
  assert.ok(w.spine.byVerb('inject:i_sedan_reversal').length + w.spine.all().filter((e) => e.actor_type !== 'player').length > 0);
});

test('rapid repeated identical actions do not break the world', async () => {
  const w = fixture('rapid-1');
  for (let i = 0; i < 12; i++) {
    const turn = await takeTurn(w, 'ask Marla about the cameras');
    assert.ok(coherent(turn) || Boolean(turn.ended));
  }
  assert.deepEqual(
    w.store.rejections.filter((r) => r.violations.some((v) => v.invariant === 'truth')),
    [],
  );
});

test('contradictory actions in sequence resolve without an impossible state', async () => {
  const w = fixture('contradict-1');
  const moves = [
    'tell Dez the car is police and we are burned',
    'tell Dez the car is nothing and to calm down',
    'send Dez out to look at the car',
    'ask Dez what he saw',
    'tell Dez to get back in here',
  ];
  for (const m of moves) await takeTurn(w, m);
  const st = w.store.read();
  const positions = Object.entries(st.positions).filter(([k]) => k === 'dez');
  assert.equal(positions.length, 1, 'Dez ended up in more than one place');
  assert.ok(['room', 'hall'].includes(positions[0]![1]));
});

test('backfire is earned by risk, not handed out for novelty (item 9)', async () => {
  let backfires = 0;
  let turns = 0;
  for (const [i, move] of PLAUSIBLE_ACTIONS.entries()) {
    const w = fixture(`backfire-${i}`);
    const turn = await takeTurn(w, move);
    turns += 1;
    if (turn.outcome === 'backfire') backfires += 1;
  }
  const rate = backfires / turns;
  console.log(`    backfire on first reasonable move: ${(rate * 100).toFixed(1)}%`);
  assert.ok(rate <= 0.1, `backfire rate ${(rate * 100).toFixed(1)}% on opening moves is punishing novelty`);
});

test('the Director rescues rarely and its interventions are distinguishable', async () => {
  const w = fixture('director-1');
  // deliberately play badly: no information gathering, all pressure
  for (let i = 0; i < 8; i++) await takeTurn(w, 'press Cyrus');
  const rescues = rescueRate(w);
  assert.ok(rescues.used <= rescues.budget, 'the Director exceeded its rescue budget');
  const directorEvents = w.spine.all().filter((e) => e.actor_type === 'director');
  for (const e of directorEvents) assert.ok(String(e.verb).startsWith('inject:'), 'a Director event was not an authored inject');
});

test('authored rules constrain resolution, they do not enumerate it (L5)', () => {
  const load = overrideLoad(PKG);
  console.log(`    overrides ${load.overrides} · verbs ${load.verbs} · ratio ${load.ratio.toFixed(2)}`);
  assert.ok(load.ratio < 1, 'more overrides than verbs is branching fiction with extra steps');
});

test('a topic hint matches whole words, not substrings', async () => {
  // "about" contains "out", which used to open the who-left-the-room path on a question
  // about a parked car. A question gets the answer to the question it asked.
  // The slice fixture, whose draws are a permanent regression baseline (item 13).
  const w = fixture();
  await takeTurn(w, 'ask Dez about the parked car');
  assert.equal(w.knowledge.hasHeard('you', 'sedan_truth'), true, 'the car question got no answer about the car');
  assert.equal(
    w.knowledge.hasHeard('you', 'who_was_out'),
    false,
    'a question about a car leaked the answer to a question about the room',
  );
});

test('a player never meets a name they were not introduced to', () => {
  // Twice now the brief has referred to "Dez" before saying who Dez is. The rule: the
  // pre-run brief describes people by their ROLE; the cast block introduces them by name.
  //
  // Every world, not just the first: a rule that only holds for the world it was written
  // against is not a rule, and the second world is where it gets forgotten.
  for (const pkg of WORLDS) {
    const brief = [pkg.world.setup, pkg.world.trouble, pkg.world.player.pressure, pkg.world.player.you]
      .join(' ')
      .toLowerCase();

    for (const c of pkg.cast) {
      const first = c.name.split(' ')[0]!.toLowerCase();
      assert.equal(
        new RegExp(`\\b${first}\\b`).test(brief),
        false,
        `${pkg.slug}: the brief names "${c.name}" before the cast block introduces them — describe them by role instead`,
      );
      assert.ok(c.intro.trim().length > 20, `${pkg.slug}: ${c.id} needs a real introduction, not a fragment`);
    }
  }
});

test('a character introduction gives away nothing the run is about', () => {
  // The intro says who someone is to you. Whether they are honest, mistaken or lying is
  // the entire game, and the player has to earn it.
  // Whole words only. With a trailing \w* this fired on "lieutenant", and a guard that
  // flags an innocent word teaches an author to write around the guard instead of the rule.
  const forbidden =
    /\b(lie|lies|lied|lying|liar|liars|deceptive|deceit|deceitful|deceive|deceives|mistaken|honest|honestly|dishonest|untrustworthy|guilty|innocent|culprit|betray|betrays|betrayed|betrayal)\b/i;
  for (const pkg of WORLDS)
    for (const c of pkg.cast) {
      assert.equal(forbidden.test(c.intro), false, `${pkg.slug}: ${c.id}'s intro leaks their reliability: "${c.intro}"`);
      assert.equal(
        c.intro.toLowerCase().includes(c.motive.toLowerCase().slice(0, 25)),
        false,
        `${pkg.slug}: ${c.id}'s intro leaks their motive`,
      );
    }
});
