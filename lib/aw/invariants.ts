// ITEM 6 — the State Invariant Engine. The rules the world cannot violate.
//
// Checked on EVERY write without exception, including engine-internal writes (L3).
// There is no back door: not for the Director, not for admin tools, not for tests.
//
// Why it exists: the Narrator will eventually produce a sentence implying a state the
// engine did not authorize. Without invariants that drift becomes state. With them it
// is caught at the boundary.

import type { ScenarioPackage } from './package';
import { evalPred, type PredContext } from './predicate';
import type { TruthLayer } from './truth';
import type { Effect, KnowledgeStore, WorldState } from './types';

export type InvariantClass =
  | 'existence'
  | 'conservation'
  | 'knowledge'
  | 'temporal'
  | 'exclusivity'
  | 'capability'
  | 'truth';

export interface Violation {
  invariant: InvariantClass;
  message: string;
  effect: Effect | null;
}

export interface InvariantContext {
  pkg: ScenarioPackage;
  before: WorldState;
  knowledge: KnowledgeStore;
  truth: TruthLayer;
  turns: number;
  fired: ReadonlySet<string>;
  playerLocation: string;
}

/**
 * Validate a candidate write. Returns every violation found — the caller rejects the
 * WHOLE effect set on any violation and never partially applies (item 6).
 */
export function checkInvariants(
  effects: readonly Effect[],
  after: WorldState,
  afterKnowledge: KnowledgeStore,
  ctx: InvariantContext,
): Violation[] {
  const v: Violation[] = [];
  const { before, pkg, truth } = ctx;
  const destroyed = new Set(before.destroyed);
  const push = (invariant: InvariantClass, message: string, effect: Effect | null = null) =>
    v.push({ invariant, message, effect });

  // --- Truth: canonical values unchanged since load (L2). Checked first and always. ---
  if (!truth.verifyUnchanged()) {
    push('truth', 'canonical truth changed since load — this is never legal');
  }

  for (const e of effects) {
    switch (e.kind) {
      // --- Existence: destroyed things stay destroyed, dead actors stay dead ---
      case 'position':
        if (destroyed.has(e.entity)) push('existence', `${e.entity} is destroyed and cannot move`, e);
        if (before.alive[e.entity] === false) push('existence', `${e.entity} is dead and cannot move`, e);
        if (!(e.location in indexLocations(pkg))) push('existence', `unknown location ${e.location}`, e);
        break;
      case 'object':
        if (destroyed.has(e.id)) push('existence', `${e.id} is destroyed and cannot change state`, e);
        break;
      case 'existence':
        if (e.op === 'destroy' && destroyed.has(e.id)) push('existence', `${e.id} is already destroyed`, e);
        if (e.op === 'kill' && before.alive[e.id] === false) push('existence', `${e.id} is already dead`, e);
        break;

      // --- Conservation: transfers balance, holdings never go negative ---
      case 'resource': {
        if (!(e.id in pkg.world.resources)) push('conservation', `unknown resource ${e.id}`, e);
        if (e.amount < 0) push('conservation', `negative transfer of ${e.id} (${e.amount})`, e);
        if (e.from === e.to) push('conservation', `transfer of ${e.id} from ${e.from} to itself`, e);
        const held = before.resources[e.id]?.[e.from] ?? 0;
        if (e.from !== 'world' && e.amount > held)
          push('conservation', `${e.from} holds ${held} ${e.id}, cannot move ${e.amount}`, e);
        break;
      }

      // --- Knowledge: nothing enters a knowledge state implicitly; a source must know ---
      case 'knowledge': {
        if (!pkg.facts.some((f) => f.id === e.fact)) push('knowledge', `unknown fact ${e.fact}`, e);
        const src = e.source;
        if (src && src !== 'world' && src !== 'observation') {
          const srcRec = ctx.knowledge[src]?.[e.fact];
          const srcKnows = srcRec && srcRec.status !== 'unknown';
          if (!srcKnows) push('knowledge', `${src} cannot disclose ${e.fact}: not in their knowledge state (L6)`, e);
        }
        break;
      }

      // --- Temporal: durations cannot be skipped, effects cannot precede causes ---
      case 'clock':
        if (e.minutes < 0) push('temporal', `time cannot run backwards (${e.minutes})`, e);
        break;
      case 'timer':
        if (e.op === 'start' && (e.in_minutes ?? 0) < 0) push('temporal', `timer ${e.id} would fire in the past`, e);
        break;

      // --- Capability: an actor cannot exercise access it does not have ---
      case 'disposition':
        if (!(e.actor in before.dispositions)) push('capability', `unknown actor ${e.actor}`, e);
        break;
      case 'flag':
        break;
    }
  }

  // --- Temporal: travel time cannot be skipped ---
  for (const e of effects) {
    if (e.kind !== 'position') continue;
    const from = before.positions[e.entity];
    if (!from || from === e.location) continue;
    const cost = pkg.locations.find((l) => l.id === from)?.travel_minutes[e.location];
    if (cost === undefined) {
      push('temporal', `no route from ${from} to ${e.location}`, e);
      continue;
    }
    const advanced = effects.reduce((n, x) => (x.kind === 'clock' ? n + x.minutes : n), 0);
    if (advanced < cost) push('temporal', `${e.entity} cannot reach ${e.location} in ${advanced}m; it takes ${cost}m`, e);
  }

  // --- Conservation (post-state): no negative holdings anywhere ---
  for (const [rid, holders] of Object.entries(after.resources))
    for (const [holder, amt] of Object.entries(holders))
      if (amt < 0) push('conservation', `${holder} holds ${amt} ${rid} after the write`);

  // --- Exclusivity: an object cannot be in two places (single-valued by construction),
  //     plus the scenario's own declared exclusivities. ---
  for (const g of ctx.pkg.invariants?.exclusive_flags ?? []) {
    const set = g.flags.filter((f) => after.flags[f] === true);
    if (set.length > 1) push('exclusivity', `${g.message} (${set.join(' + ')})`);
  }

  // --- Scenario-declared forbidden states (item 6: extensible without engine changes) ---
  const pctx: PredContext = {
    state: after,
    knowledge: afterKnowledge,
    truth: truth.entries(),
    turns: ctx.turns,
    fired: ctx.fired,
    pressure: 0,
    playerLocation: ctx.playerLocation,
  };
  for (const f of ctx.pkg.invariants?.forbidden ?? [])
    if (evalPred(f.when, pctx)) push('exclusivity', `${f.id}: ${f.message}`);

  return v;
}

let locationIndex: WeakMap<ScenarioPackage, Record<string, true>> = new WeakMap();
function indexLocations(pkg: ScenarioPackage): Record<string, true> {
  let idx = locationIndex.get(pkg);
  if (!idx) {
    idx = Object.fromEntries(pkg.locations.map((l) => [l.id, true as const]));
    locationIndex.set(pkg, idx);
  }
  return idx;
}

/** Every rejection is logged with the invariant, the attempted write, and its origin. */
export interface RejectionLogEntry {
  world_time: number;
  origin_event_id: string | null;
  actor_id: string;
  violations: Violation[];
  attempted: readonly Effect[];
}
