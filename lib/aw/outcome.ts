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
    points = Math.max(d.min, Math.min(d.max, points));
    const band =
      [...d.bands].sort((a, b) => b.at_least - a.at_least).find((b) => points >= b.at_least)?.label ??
      d.bands[d.bands.length - 1]?.label ??
      '—';
    return { key: d.key, label: d.label, points, band, notes };
  });

  const best = [...axes].sort((a, b) => b.points - a.points)[0];
  const worst = [...axes].sort((a, b) => a.points - b.points)[0];
  const headline =
    best && worst && best.key !== worst.key
      ? `${best.label}: ${best.band}. ${worst.label}: ${worst.band}.`
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
  liar: string;
  liar_display: string;
  told_you: string | null;
  actually: string | null;
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
      statement: f.statement.replace('{value}', 'something'),
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
    lied_to.push({
      fact: factId,
      liar: e.actor_id,
      liar_display: world.displayName(e.actor_id),
      told_you: world.displayName(told),
      actually: canonical ? world.displayName(canonical) : null,
      why: teller?.motive ?? 'unknown',
      // A sincerely mistaken character is not a liar: they passed on what they hold.
      sincere: teller?.reliability === 'mistaken' || world.knowledge.get(e.actor_id, factId).value === told,
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

export function causalDebrief(world: World): {
  chains: CausalChain[];
  director_share: number;
  turns: number;
} {
  const spine = world.spine;
  const playerActions = spine.all().filter((e) => e.actor_type === 'player' && e.verb !== 'unclear');
  const chains: CausalChain[] = playerActions
    .map((a) => ({
      trigger: step(world, a),
      consequences: spine.chainFrom(a.id).map((e) => step(world, e)),
    }))
    .filter((c) => c.consequences.length > 0);

  const all = spine.all();
  const directorEvents = all.filter((e) => e.actor_type === 'director').length;

  return {
    chains,
    director_share: all.length ? directorEvents / all.length : 0,
    turns: world.counters.turns,
  };
}

function step(world: World, e: WorldEvent): CausalStep {
  return {
    event_id: e.id,
    world_time: e.world_time,
    actor: world.displayName(e.actor_id),
    actor_type: e.actor_type,
    verb: e.verb,
    line: String(e.payload.public_line ?? e.verb),
    player_caused: e.actor_type === 'player',
  };
}
