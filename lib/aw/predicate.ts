// The predicate language (item 2: "MUST NOT permit executable logic inside a package").
//
// Scenario packages need conditions — inject preconditions, override matches, process
// triggers, outcome scoring. Conditions are DATA in this tiny declarative language, so
// a package stays inert content and L12 (content and engine never mix) holds.
//
// Pure. Evaluated by the engine against state + knowledge + (engine-only) truth.

import type { KnowledgeStatus, KnowledgeStore, WorldState } from './types';

export type Pred =
  | { all: Pred[] }
  | { any: Pred[] }
  | { not: Pred }
  | { flag: string; eq?: string | number | boolean; gte?: number; lt?: number; set?: boolean }
  | { clock: { gte?: number; lt?: number } }
  | { turns: { gte?: number; lt?: number } }
  | { knows: { actor: string; fact: string; status?: KnowledgeStatus[]; correct?: boolean } }
  | { present: string }
  | { alive: string }
  | { object: { id: string; is: string } }
  | { resource: { id: string; holder: string; gte?: number; lt?: number } }
  | { disposition: { actor: string; axis: string; gte?: number; lt?: number } }
  | { truth: { fact: string; eq: string } }
  | { fired: string }
  | { never_fired: string }
  | { pressure: { gte?: number; lt?: number } }
  | { always: true };

/** Everything a predicate may read. Truth is included because the ENGINE evaluates
 *  predicates — no model and no projection ever sees this context (item 4). */
export interface PredContext {
  state: WorldState;
  knowledge: KnowledgeStore;
  truth: Readonly<Record<string, string>>;
  turns: number;
  fired: ReadonlySet<string>;
  /** 0..1 — how much trouble the player is in. Director input (item 19). */
  pressure: number;
  /** Where the player is, for `present` checks. */
  playerLocation: string;
}

const num = (v: unknown): number => (typeof v === 'number' ? v : Number.NaN);

export function evalPred(p: Pred | undefined | null, ctx: PredContext): boolean {
  if (!p) return true;
  if ('always' in p) return true;
  if ('all' in p) return p.all.every((q) => evalPred(q, ctx));
  if ('any' in p) return p.any.some((q) => evalPred(q, ctx));
  if ('not' in p) return !evalPred(p.not, ctx);

  if ('flag' in p) {
    const v = ctx.state.flags[p.flag];
    if (p.set !== undefined) return p.set ? v !== undefined : v === undefined;
    if (p.eq !== undefined) return v === p.eq;
    if (p.gte !== undefined) return num(v) >= p.gte;
    if (p.lt !== undefined) return num(v) < p.lt;
    return v !== undefined;
  }
  if ('clock' in p) {
    const c = ctx.state.clock;
    return (p.clock.gte === undefined || c >= p.clock.gte) && (p.clock.lt === undefined || c < p.clock.lt);
  }
  if ('turns' in p) {
    const t = ctx.turns;
    return (p.turns.gte === undefined || t >= p.turns.gte) && (p.turns.lt === undefined || t < p.turns.lt);
  }
  if ('knows' in p) {
    const rec = ctx.knowledge[p.knows.actor]?.[p.knows.fact];
    if (!rec || rec.status === 'unknown') return false;
    if (p.knows.status && !p.knows.status.includes(rec.status)) return false;
    // Whether what they hold is actually TRUE. Scoring on how firmly somebody believes
    // something says a player "decided without knowing" on the same screen that tells
    // them they had it right, because a partial answer downgrades what it discloses.
    // Engine-side only: this reads canonical truth, which no projection ever carries.
    if (p.knows.correct !== undefined) {
      const matches = rec.value !== null && rec.value === ctx.truth[p.knows.fact];
      if (matches !== p.knows.correct) return false;
    }
    return true;
  }
  if ('present' in p) return ctx.state.positions[p.present] === ctx.playerLocation;
  if ('alive' in p) return ctx.state.alive[p.alive] !== false;
  if ('object' in p) return ctx.state.objects[p.object.id] === p.object.is;
  if ('resource' in p) {
    const amt = ctx.state.resources[p.resource.id]?.[p.resource.holder] ?? 0;
    return (
      (p.resource.gte === undefined || amt >= p.resource.gte) &&
      (p.resource.lt === undefined || amt < p.resource.lt)
    );
  }
  if ('disposition' in p) {
    const v = ctx.state.dispositions[p.disposition.actor]?.[p.disposition.axis] ?? 0;
    return (
      (p.disposition.gte === undefined || v >= p.disposition.gte) &&
      (p.disposition.lt === undefined || v < p.disposition.lt)
    );
  }
  if ('truth' in p) return ctx.truth[p.truth.fact] === p.truth.eq;
  if ('fired' in p) return ctx.fired.has(p.fired);
  if ('never_fired' in p) return !ctx.fired.has(p.never_fired);
  if ('pressure' in p) {
    return (
      (p.pressure.gte === undefined || ctx.pressure >= p.pressure.gte) &&
      (p.pressure.lt === undefined || ctx.pressure < p.pressure.lt)
    );
  }
  return false;
}

/** Every entity / actor / fact id a predicate references. Used by the package lint. */
export function predRefs(p: Pred | undefined | null, out: Set<string> = new Set()): Set<string> {
  if (!p) return out;
  if ('all' in p) p.all.forEach((q) => predRefs(q, out));
  else if ('any' in p) p.any.forEach((q) => predRefs(q, out));
  else if ('not' in p) predRefs(p.not, out);
  else if ('knows' in p) { out.add(p.knows.actor); out.add(p.knows.fact); }
  else if ('present' in p) out.add(p.present);
  else if ('alive' in p) out.add(p.alive);
  else if ('object' in p) out.add(p.object.id);
  else if ('truth' in p) out.add(p.truth.fact);
  else if ('disposition' in p) out.add(p.disposition.actor);
  return out;
}
