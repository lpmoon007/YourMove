// ITEM 5 — the Immutable Event Spine. The only history that exists.
//
// Append-only (L8). Causal fields written at creation, never inferred afterward (L7).
// Prose is a RENDERING of an event, never the record of it — narration is stored on
// the event as payload for replay, but the event's meaning lives in verb/targets/payload.

import type { ActorType, Causality, Json, WorldEvent } from './types';

export interface AppendInput {
  actor_id: string;
  actor_type: ActorType;
  verb: string;
  targets?: string[];
  payload?: Record<string, Json>;
  visibility?: string[];
  causality?: Partial<Causality>;
}

const EMPTY_CAUSALITY: Causality = {
  caused_by: [],
  enabled_by: [],
  blocked_by: [],
  amplified_by: [],
  revealed_by: [],
};

export class EventSpine {
  private events: WorldEvent[] = [];
  private readonly runId: string;
  /** Supplied by the caller so the core stays pure and replay is reproducible. */
  private readonly now: () => string;

  constructor(runId: string, now: () => string = () => new Date(0).toISOString()) {
    this.runId = runId;
    this.now = now;
  }

  append(input: AppendInput, worldTime: number): WorldEvent {
    const seq = this.events.length + 1;
    const event: WorldEvent = Object.freeze({
      id: `${this.runId}:${seq}`,
      run_id: this.runId,
      seq,
      world_time: worldTime,
      wall_time: this.now(),
      actor_id: input.actor_id,
      actor_type: input.actor_type,
      verb: input.verb,
      targets: Object.freeze([...(input.targets ?? [])]) as string[],
      payload: Object.freeze({ ...(input.payload ?? {}) }) as Record<string, Json>,
      visibility: Object.freeze([...(input.visibility ?? ['*'])]) as string[],
      causality: Object.freeze({ ...EMPTY_CAUSALITY, ...(input.causality ?? {}) }) as Causality,
    });
    this.events.push(event);
    return event;
  }

  /** Read-only. There is no update and no delete — corrections are new events. */
  all(): readonly WorldEvent[] {
    return this.events;
  }

  get length(): number {
    return this.events.length;
  }

  byId(id: string): WorldEvent | undefined {
    return this.events.find((e) => e.id === id);
  }

  byVerb(...verbs: string[]): WorldEvent[] {
    return this.events.filter((e) => verbs.includes(e.verb));
  }

  /** What this actor could perceive. Used to build character context (L6). */
  visibleTo(actorId: string): WorldEvent[] {
    return this.events.filter((e) => e.visibility.includes('*') || e.visibility.includes(actorId));
  }

  /** ITEM 26 — the causal debrief is a QUERY, not an inference. Walks caused_by back. */
  chainTo(eventId: string, depth = 8): WorldEvent[] {
    const out: WorldEvent[] = [];
    const seen = new Set<string>();
    const walk = (id: string, d: number) => {
      if (d < 0 || seen.has(id)) return;
      seen.add(id);
      const e = this.byId(id);
      if (!e) return;
      out.push(e);
      for (const c of e.causality.caused_by) walk(c, d - 1);
      for (const c of e.causality.enabled_by) walk(c, d - 1);
    };
    walk(eventId, depth);
    return out.reverse();
  }

  /** Everything this event went on to cause, transitively. */
  chainFrom(eventId: string): WorldEvent[] {
    const out: WorldEvent[] = [];
    const front = [eventId];
    while (front.length) {
      const id = front.shift()!;
      for (const e of this.events) {
        if (e.causality.caused_by.includes(id) && !out.some((o) => o.id === e.id)) {
          out.push(e);
          front.push(e.id);
        }
      }
    }
    return out;
  }

  serialize(): WorldEvent[] {
    return this.events.map((e) => ({ ...e }));
  }

  static restore(runId: string, events: WorldEvent[], now?: () => string): EventSpine {
    const s = new EventSpine(runId, now);
    s.events = events.map((e) => Object.freeze({ ...e }));
    return s;
  }
}
