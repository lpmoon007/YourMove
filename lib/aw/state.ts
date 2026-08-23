// ITEM 1 — the World State Store. The authoritative container for what is currently true.
//
// Holds entities, locations, resources, flags, timers, dispositions, positions, object
// states, clock. Does NOT hold canonical truth (item 4), knowledge states (item 11), or
// history (item 5) — those are separate objects on purpose, so no generic state write
// can reach them.
//
// Mutation is only through `apply`, which runs the invariant engine (L3) and either
// commits the whole effect set or rejects all of it. Consumers never hold a reference to
// the raw store; they receive projections (L4), issued by World (world.ts) because a
// character projection needs the knowledge tracker this store deliberately does not hold.

import { checkInvariants, type InvariantContext, type RejectionLogEntry, type Violation } from './invariants';
import type { ScenarioPackage } from './package';
import type { Effect, KnowledgeStore, WorldState } from './types';

export interface ApplyResult {
  ok: boolean;
  violations: Violation[];
  applied: readonly Effect[];
  /** Facts that changed, for the consequence engine's information propagation. */
  clock_advanced: number;
}

export class WorldStateStore {
  private state: WorldState;
  private readonly pkg: ScenarioPackage;
  readonly rejections: RejectionLogEntry[] = [];

  constructor(pkg: ScenarioPackage, initial: WorldState) {
    this.pkg = pkg;
    this.state = initial;
  }

  /** Read-only view for the engine. Consumers get projections, not this. */
  read(): Readonly<WorldState> {
    return this.state;
  }

  get clock(): number {
    return this.state.clock;
  }

  /**
   * The ONLY write path. Applies to a clone, validates, then commits — so a violation
   * leaves the world exactly as it was (item 6: never partially apply).
   */
  apply(
    effects: readonly Effect[],
    knowledgeBefore: KnowledgeStore,
    knowledgeAfter: KnowledgeStore,
    ctx: Omit<InvariantContext, 'before' | 'knowledge' | 'pkg'>,
    origin: { event_id: string | null; actor_id: string },
  ): ApplyResult {
    const candidate = applyToClone(this.state, effects);
    const full: InvariantContext = { ...ctx, pkg: this.pkg, before: this.state, knowledge: knowledgeBefore };
    const violations = checkInvariants(effects, candidate, knowledgeAfter, full);

    if (violations.length) {
      this.rejections.push({
        world_time: this.state.clock,
        origin_event_id: origin.event_id,
        actor_id: origin.actor_id,
        violations,
        attempted: effects,
      });
      return { ok: false, violations, applied: [], clock_advanced: 0 };
    }

    const advanced = candidate.clock - this.state.clock;
    this.state = candidate;
    return { ok: true, violations: [], applied: effects, clock_advanced: advanced };
  }

  serialize(): WorldState {
    return structuredClone(this.state);
  }
}

/** Pure: state + effects → new state. No validation here; `apply` owns that. */
export function applyToClone(state: WorldState, effects: readonly Effect[]): WorldState {
  const s = structuredClone(state) as WorldState;
  for (const e of effects) {
    switch (e.kind) {
      case 'flag':
        s.flags[e.id] = e.value;
        break;
      case 'position':
        s.positions[e.entity] = e.location;
        break;
      case 'object':
        s.objects[e.id] = e.state;
        break;
      case 'existence':
        if (e.op === 'destroy' && !s.destroyed.includes(e.id)) s.destroyed.push(e.id);
        if (e.op === 'kill') s.alive[e.id] = false;
        break;
      case 'resource': {
        s.resources[e.id] = s.resources[e.id] ?? {};
        const pot = s.resources[e.id]!;
        if (e.from !== 'world') pot[e.from] = (pot[e.from] ?? 0) - e.amount;
        if (e.to !== 'world') pot[e.to] = (pot[e.to] ?? 0) + e.amount;
        break;
      }
      case 'clock':
        s.clock += e.minutes;
        break;
      case 'timer':
        if (e.op === 'start') s.timers[e.id] = { fires_at: s.clock + (e.in_minutes ?? 0), payload: e.payload ?? {} };
        else delete s.timers[e.id];
        break;
      case 'disposition': {
        s.dispositions[e.actor] = s.dispositions[e.actor] ?? {};
        const d = s.dispositions[e.actor]!;
        d[e.axis] = clamp(-100, 100, (d[e.axis] ?? 0) + e.delta);
        break;
      }
      case 'knowledge':
        // knowledge lives in the tracker (item 11), not here — deliberately a no-op
        break;
    }
  }
  return s;
}

const clamp = (lo: number, hi: number, n: number) => Math.max(lo, Math.min(hi, n));
