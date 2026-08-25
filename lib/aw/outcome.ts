// ITEMS 24, 25, 26 — Outcome Evaluation, the Reveal Screen, and the Causal Debrief.
//
// Outcome is multi-axis, never a score. Every axis must be able to move independently:
// if two always move together they are one axis (Part 4).
//
// The reveal is the ONLY place canonical truth is ever rendered, and it is gated on the
// run being over. The debrief is reconstructed from stored causal links — a query over
// the spine, not a post-hoc inference (L7).

import { evalPred } from './predicate';
import type { KnowledgeStatus, WorldEvent } from './types';
import type { World } from './world';

export interface OutcomeAxisResult {
  key: string;
  label: string;
  /** What this axis measures, in the player's words. */
  question: string;
  /** The ceiling for this axis, so a caller can talk about a strong result. */
  max: number;
  points: number;
  band: string;
  notes: string[];
}

export interface RunOutcome {
  ended: boolean;
  reason: string;
  world_time: number;
  axes: OutcomeAxisResult[];
  /** A sentence, not a grade. Composed from the axes that actually moved. */
  headline: string;
}

export function scoreOutcome(world: World): RunOutcome {
  const ctx = world.predContext();
  const axes: OutcomeAxisResult[] = world.pkg.outcome_dimensions.map((d) => {
    let points = 0;
    const notes: string[] = [];
    for (const rule of d.scoring) {
      if (!evalPred(rule.when, ctx)) continue;
      points += rule.points;
      notes.push(rule.note);
    }
    // An axis where nothing scored still has to say something. A band with no reason
    // under it renders as a label and a dash, which reads as a bug rather than a verdict.
    if (!notes.length) notes.push(`nothing on this went your way: ${d.question.replace(/\.$/, '').toLowerCase()}`);
    points = Math.max(d.min, Math.min(d.max, points));
    const band =
      [...d.bands].sort((a, b) => b.at_least - a.at_least).find((b) => points >= b.at_least)?.label ??
      d.bands[d.bands.length - 1]?.label ??
      '—';
    return { key: d.key, label: d.label, question: d.question, max: d.max, points, band, notes };
  });

  const best = [...axes].sort((a, b) => b.points - a.points)[0];
  const worst = [...axes].sort((a, b) => a.points - b.points)[0];
  const headline =
    best && worst && best.key !== worst.key
      ? `${best.label.replace(/^The /, '')}: ${best.band}. ${worst.label.replace(/^The /, '')}: ${worst.band}.`
      : (best?.band ?? 'It ended.');

  return {
    ended: Boolean(world.ended),
    reason: world.ended?.label ?? 'in progress',
    world_time: world.clock,
    axes,
    headline,
  };
}

// ---------------------------------------------------------------------------
// ITEM 25 — the reveal. What was true. What you never found. Who lied and why.
// ---------------------------------------------------------------------------

export interface RevealFact {
  fact: string;
  statement: string;
  canonical_value: string | null;
  canonical_display: string;
  player_status: KnowledgeStatus;
  player_believed: string | null;
  correct: boolean | null;
}

export interface RevealLie {
  fact: string;
  /** What the wrong answer was ABOUT. "Dez said an unmarked police car" is meaningless
   *  without the question it was answering. */
  about: string;
  liar: string;
  liar_display: string;
  told_you: string | null;
  actually: string | null;
  /** Why it was wrong, in the player's terms. A sincere mistake is not a motive. */
  why: string;
  sincere: boolean;
}

export interface Reveal {
  truth: RevealFact[];
  never_found: { fact: string; statement: string; paths: string[] }[];
  lied_to: RevealLie[];
}

export class RunNotOverError extends Error {
  constructor() {
    super('the reveal is only available after the run ends — truth is never rendered during play');
    this.name = 'RunNotOverError';
  }
}

export function buildReveal(world: World): Reveal {
  if (!world.ended) throw new RunNotOverError();

  const truth: RevealFact[] = world.pkg.facts.map((f) => {
    const canonical = world.truth.read(f.id) ?? null;
    const rec = world.knowledge.get(world.playerId, f.id);
    return {
      fact: f.id,
      statement: f.statement.replace('{value}', canonical ? world.displayName(canonical) : '—'),
      canonical_value: canonical,
      canonical_display: canonical ? world.displayName(canonical) : '—',
      player_status: rec.status,
      player_believed: rec.value,
      correct: rec.status === 'unknown' ? null : rec.value === canonical,
    };
  });

  const never_found = world.pkg.facts
    .filter((f) => !world.knowledge.hasHeard(world.playerId, f.id))
    .map((f) => ({
      fact: f.id,
      // The question form, never the statement with the value swapped for "something".
      statement: f.question,
      paths: world.pkg.discovery_paths
        .filter((p) => f.discoverable_via.includes(p.id))
        .map((p) => p.description),
    }));

  const lied_to: RevealLie[] = [];
  for (const e of world.spine.byVerb('fact_disclosed')) {
    const factId = String(e.payload.fact ?? '');
    const told = (e.payload.value as string | null) ?? null;
    const canonical = world.truth.read(factId) ?? null;
    if (told === null || told === canonical) continue;
    const teller = world.character(e.actor_id);
    // A sincerely mistaken character is not a liar: they passed on what they hold.
    const sincere = teller?.reliability === 'mistaken' || world.knowledge.get(e.actor_id, factId).value === told;
    lied_to.push({
      fact: factId,
      about: world.pkg.facts.find((f) => f.id === factId)?.question ?? factId,
      liar: e.actor_id,
      liar_display: world.displayName(e.actor_id),
      told_you: world.displayName(told),
      actually: canonical ? world.displayName(canonical) : null,
      why: sincere
        ? 'They were not lying to you. They believed it, and they were wrong.'
        : 'They knew better, and told you anyway.',
      sincere,
    });
  }

  return { truth, never_found, lied_to };
}

// ---------------------------------------------------------------------------
// ITEM 26 — the causal debrief. A query, not an inference.
// ---------------------------------------------------------------------------

export interface CausalStep {
  event_id: string;
  world_time: number;
  actor: string;
  actor_type: string;
  verb: string;
  line: string;
  player_caused: boolean;
}

export interface CausalChain {
  trigger: CausalStep;
  consequences: CausalStep[];
}

/** Events that exist for the machine, not for the reader. */
const INTERNAL_VERBS = new Set(['narration', 'witnessed', 'unclear', 'world_created']);

export function causalDebrief(world: World): {
  chains: CausalChain[];
  unprompted_events: number;
  turns: number;
} {
  const spine = world.spine;
  const playerActions = spine.all().filter((e) => e.actor_type === 'player' && e.verb !== 'unclear');
  const chains: CausalChain[] = playerActions
    .map((a) => ({
      trigger: step(world, a),
      consequences: spine
        .chainFrom(a.id)
        .filter((e) => !INTERNAL_VERBS.has(e.verb))
        .map((e) => step(world, e)),
    }))
    .filter((c) => c.consequences.length > 0);

  const all = spine.all();
  // Counted for the player as "things you did not set in motion". The Director is an
  // engine concept and is never named on a player-facing screen.
  const notYours = all.filter(
    (e) => (e.actor_type === 'director' || e.actor_type === 'world_process') && !INTERNAL_VERBS.has(e.verb),
  ).length;

  return {
    chains,
    unprompted_events: notYours,
    turns: world.counters.turns,
  };
}

/** One readable line per event. Never an event verb, never an actor id. */
function step(world: World, e: WorldEvent): CausalStep {
  let line = String(e.payload.public_line ?? '');
  if (e.actor_type === 'player') {
    // What they typed, not the engine's summary of how it went.
    line = String(e.payload.raw_text ?? line);
  } else if (e.verb === 'fact_disclosed') {
    const from = String(e.payload.value ?? '');
    const fact = world.pkg.facts.find((f) => f.id === String(e.payload.fact ?? ''));
    const who = e.actor_id === 'observation' ? 'You saw for yourself' : `${world.displayName(e.actor_id)} told you`;
    line = fact ? `${who}: ${fact.statement.replace('{value}', world.displayName(from))}` : line;
  }
  return {
    event_id: e.id,
    world_time: e.world_time,
    actor: world.displayName(e.actor_id),
    actor_type: e.actor_type,
    verb: e.verb,
    line: line || 'something shifted in the room',
    player_caused: e.actor_type === 'player',
  };
}
