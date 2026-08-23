// ITEM 19 — the Director. Bounded pacing intelligence. Not a storyteller.
//
// MAY: surface existing tension, adjust pacing, accelerate or decelerate legitimate
// processes within authored bounds, reveal information already available through a
// legitimate channel, trigger authored recovery opportunities, select among injects
// whose preconditions are met, decide when to interrupt.
//
// MAY NOT: invent canonical truth, invent resources or entities, change the culprit or
// any fact, fabricate punishment, manufacture impossible obstacles, withhold information
// the player has legitimately earned, or rescue the player from consequences they earned.
//
// It selects ONLY from the scenario's inject library, verifies preconditions against
// state before firing, records every intervention as an event with actor type director
// so the debrief can separate player-caused from Director-introduced, and spends from a
// tracked rescue budget. Frequent rescues mean the scenario is broken, not that the
// Director is working.

import type { InjectDef } from './package';
import type { WorldEvent } from './types';
import type { World } from './world';

export interface DirectorDecision {
  fired: string | null;
  considered: string[];
  held: { id: string; reason: string }[];
  event: WorldEvent | null;
  line: string | null;
  rescue: boolean;
}

export function tickDirector(world: World, causedBy: string | null): DirectorDecision {
  const view = world.projectDirector();
  const considered = view.legal_injects;
  const held: { id: string; reason: string }[] = [];

  // pacing: do not bury the player. One intervention per N turns unless nothing has
  // happened for a long time.
  const gap = world.pkg.director.min_turns_between_injects;
  const lastFireTurn = Math.max(
    0,
    ...Object.entries(world.counters.fired_at_turn)
      .filter(([k]) => k.startsWith('inject:'))
      .map(([, v]) => v),
  );
  if (world.counters.turns - lastFireTurn < gap && lastFireTurn > 0) {
    return { fired: null, considered, held: considered.map((id) => ({ id, reason: 'pacing' })), event: null, line: null, rescue: false };
  }

  const candidates = considered
    .map((id) => world.pkg.injects.find((i) => i.id === id)!)
    .filter(Boolean)
    .filter((i) => {
      if (i.is_rescue && view.rescue_budget_left <= 0) {
        held.push({ id: i.id, reason: 'rescue budget spent' });
        return false;
      }
      return true;
    });
  if (!candidates.length) return { fired: null, considered, held, event: null, line: null, rescue: false };

  const chosen = choose(world, candidates, view.player_pressure);
  for (const c of candidates) if (c.id !== chosen.id) held.push({ id: c.id, reason: 'not selected this tick' });

  const { event, result } = world.commit(chosen.effects, {
    actor_id: chosen.actor,
    actor_type: 'director',
    verb: `inject:${chosen.id}`,
    targets: [],
    visibility: ['*'],
    causality: { caused_by: causedBy ? [causedBy] : [] },
    payload: {
      inject: chosen.id,
      kind: chosen.kind,
      is_rescue: Boolean(chosen.is_rescue),
      pressure: Math.round(view.player_pressure * 100) / 100,
      summary: chosen.summary,
      public_line: chosen.line,
    },
  });
  if (!result.ok) {
    held.push({ id: chosen.id, reason: `rejected by invariants: ${result.violations.map((v) => v.invariant).join(',')}` });
    return { fired: null, considered, held, event: null, line: null, rescue: false };
  }

  world.counters.fired.push(chosen.id);
  world.counters.fired_at_turn[`inject:${chosen.id}`] = world.counters.turns;
  world.counters.fired_at_turn[chosen.id] = world.counters.turns;
  world.counters.director_interventions += 1;
  if (chosen.is_rescue) world.counters.rescues_used += 1;
  if (chosen.kind === 'reveal') world.counters.last_reveal_turn = world.counters.turns;

  return { fired: chosen.id, considered, held, event, line: chosen.line, rescue: Boolean(chosen.is_rescue) };
}

/**
 * Selection is deterministic given the seed. Under pressure the Director reaches for
 * recovery and reveal; in a slack world it reaches for pressure. It never invents — the
 * whole decision is WHICH authored beat, and WHETHER now.
 */
function choose(world: World, candidates: InjectDef[], pressure: number): InjectDef {
  const weight = (i: InjectDef): number => {
    switch (i.kind) {
      case 'recovery':
        return pressure > 0.6 ? 4 : 0.5;
      case 'reveal':
        return world.counters.turns - world.counters.last_reveal_turn >= 3 ? 3 : 1;
      case 'reversal':
        return world.counters.turns >= 4 ? 2 : 0.25;
      case 'pressure':
        return pressure < 0.5 ? 3 : 1;
    }
  };
  const weights = candidates.map(weight);
  return world.rng.pick(`director:${world.counters.turns}`, candidates, weights);
}

/** Reported every run. A high number means the scenario is broken (item 19). */
export function rescueRate(world: World): { used: number; budget: number; per_turn: number } {
  return {
    used: world.counters.rescues_used,
    budget: world.pkg.director.rescue_budget,
    per_turn: world.counters.turns ? world.counters.rescues_used / world.counters.turns : 0,
  };
}
