// THE COLD-READ SUITE.
//
// The behavioral and integrity suites prove the world cannot be broken. They cannot tell
// you that a screen is incomprehensible to someone reading it once. Three rounds of the
// same feedback happened because nothing here existed.
//
// Every check is the mechanical form of a question a first-time player asks.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildReveal, causalDebrief, loadWorld, scoreOutcome, takeTurn } from '@/lib/aw';
import { fixture, PKG } from './_harness';

/** Words that only mean something if you have read the codebase. */
const ENGINE_JARGON =
  /\b(director|inject|world_process|actor_type|adjudicat\w*|invariant|projection|canonical|seq|event_id|payload|verb:|rule_path|fact_id|null|undefined|NaN|\[object)\b/i;

/** Substitution that did not happen, or a value that never arrived. */
const BROKEN_TEXT = /\{value\}|\{name\}|\{verb\}|\bwas something\b|\bto something\b|\bat something\b|\bon something\b/i;

async function finishedRun() {
  const w = fixture();
  for (const m of [
    'ask Dez about the parked car',
    'read the call log',
    'ask Marla about the cameras',
    'press Marla about who called',
    'accuse Marla',
  ]) {
    const t = await takeTurn(w, m);
    if (t.ended) break;
  }
  return w;
}

test('the ending is a sentence, not a state label', async () => {
  const w = await finishedRun();
  const label = w.ended!.label;
  assert.ok(!/^committed:|^hard_fail|_/.test(label), `the run ended with "${label}"`);
  assert.ok(label.split(' ').length >= 6, `the ending is too terse to read as prose: "${label}"`);
});

test('nothing on the debrief needs the codebase to make sense', async () => {
  const w = await finishedRun();
  const reveal = buildReveal(w);
  const outcome = scoreOutcome(w);
  const causal = causalDebrief(w);

  const lines: [string, string][] = [
    ['ending', outcome.reason],
    ...outcome.axes.flatMap((a): [string, string][] => [
      [`axis ${a.key} band`, a.band],
      [`axis ${a.key} question`, a.question],
      ...a.notes.map((n): [string, string] => [`axis ${a.key} note`, n]),
    ]),
    ...reveal.truth.map((t): [string, string] => [`truth ${t.fact}`, t.statement]),
    ...reveal.never_found.flatMap((n): [string, string][] => [
      [`missed ${n.fact}`, n.statement],
      ...n.paths.map((p): [string, string] => [`hint ${n.fact}`, p]),
    ]),
    ...reveal.lied_to.flatMap((l): [string, string][] => [
      [`wrong ${l.fact} about`, l.about],
      [`wrong ${l.fact} why`, l.why],
    ]),
    ...causal.chains.flatMap((c): [string, string][] => [
      ['chain trigger', c.trigger.line],
      ...c.consequences.map((s): [string, string] => ['chain step', s.line]),
    ]),
  ];

  for (const [where, line] of lines) {
    assert.ok(line && line.trim().length > 0, `${where} is empty`);
    assert.equal(ENGINE_JARGON.test(line), false, `${where} uses engine vocabulary: "${line}"`);
    assert.equal(BROKEN_TEXT.test(line), false, `${where} reads like a bug: "${line}"`);
  }
});

test('a hint never contains the answer it is hinting at', async () => {
  const w = await finishedRun();
  for (const n of buildReveal(w).never_found) {
    const answer = w.truth.read(n.fact);
    if (!answer || answer.length <= 3) continue;
    for (const path of n.paths)
      assert.equal(
        path.toLowerCase().includes(answer.toLowerCase()),
        false,
        `the hint for ${n.fact} gives away "${answer}": "${path}"`,
      );
  }
});

test('a wrong answer is attached to the question it answered', async () => {
  const w = await finishedRun();
  for (const l of buildReveal(w).lied_to) {
    assert.ok(l.about.length > 5, `"${l.liar_display} said ${l.told_you}" does not say what it was about`);
    // A sincere mistake is not a motive, and a private motive is never printed.
    const teller = PKG.cast.find((c) => c.id === l.liar)!;
    assert.equal(l.why.includes(teller.motive.slice(0, 20)), false, 'the reveal printed a private motive verbatim');
  }
});

test('the causal debrief shows what the player typed, not what the engine called it', async () => {
  const w = await finishedRun();
  const chains = causalDebrief(w).chains;
  assert.ok(chains.length > 0, 'nothing the player did was traced');
  const typed = new Set(
    w.spine
      .all()
      .filter((e) => e.actor_type === 'player')
      .map((e) => String(e.payload.raw_text ?? '')),
  );
  for (const c of chains)
    assert.ok(typed.has(c.trigger.line), `a move was labeled "${c.trigger.line}" instead of what was typed`);
});

test('every scenario string a player can see is free of engine vocabulary', () => {
  const authored: [string, string][] = [
    ['genre', PKG.genre],
    ['tagline', PKG.tagline],
    ['setup', PKG.world.setup],
    ['trouble', PKG.world.trouble],
    ['cold open', PKG.world.cold_open],
    ['out-of-time ending', PKG.world.ending_out_of_time],
    ['you', PKG.world.player.you],
    ['objective', PKG.world.player.objective],
    ['pressure', PKG.world.player.pressure],
    ...PKG.cast.map((c): [string, string] => [`${c.id} intro`, c.intro]),
    ...PKG.facts.flatMap((f): [string, string][] => [
      [`${f.id} statement`, f.statement],
      [`${f.id} question`, f.question],
    ]),
    ...PKG.discovery_paths.map((p): [string, string] => [`${p.id} hint`, p.description]),
    ...PKG.injects.map((i): [string, string] => [`${i.id} line`, i.line]),
    ...Object.entries(PKG.narrator_fallbacks),
    ...PKG.outcome_dimensions.flatMap((d): [string, string][] => [
      [`${d.key} question`, d.question],
      ...d.scoring.map((r): [string, string] => [`${d.key} note`, r.note]),
    ]),
  ];
  for (const [where, line] of authored) {
    assert.ok(line?.trim().length, `${where} is empty`);
    assert.equal(ENGINE_JARGON.test(line), false, `${where} uses engine vocabulary: "${line}"`);
  }
});

test('a commitment verb ends the run with an authored sentence', () => {
  for (const v of PKG.verbs.filter((x) => x.commitment)) {
    assert.ok(v.commitment_line, `${v.id} ends the run with no sentence`);
    assert.ok(v.commitment_line!.split(' ').length >= 6, `${v.id}'s ending is too terse: "${v.commitment_line}"`);
  }
});
