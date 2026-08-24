// The World — one instantiated scenario in play (Part 1). Composes the five separate
// objects the rules insist stay separate: state (item 1), knowledge (item 11), canonical
// truth (item 4), history (item 5), and the seeded stream (L11).
//
// It also issues the five projections (L4). Consumers receive scoped, frozen views; no
// consumer holds a reference to the raw store, and no projection can expose truth.

import { KnowledgeTracker } from './knowledge';
import type { ScenarioPackage } from './package';
import { evalPred, type PredContext } from './predicate';
import { Rng } from './rng';
import { EventSpine, type AppendInput } from './spine';
import { WorldStateStore, type ApplyResult } from './state';
import { TruthLayer } from './truth';
import type {
  CharacterDef,
  CharacterProjection,
  DirectorProjection,
  Effect,
  NarratorProjection,
  OutcomeClass,
  RunConfig,
  RunVersions,
  TelemetryProjection,
  UiProjection,
  WorldEvent,
  WorldState,
} from './types';

export interface WorldCounters {
  turns: number;
  rescues_used: number;
  director_interventions: number;
  blocked: number;
  outcomes: Record<OutcomeClass, number>;
  fired: string[];
  fired_at_turn: Record<string, number>;
  last_reveal_turn: number;
}

export interface EndState {
  reason: 'clock' | 'commitment' | 'hard_fail' | 'abandoned';
  label: string;
  at_world_time: number;
}

export class World {
  readonly run_id: string;
  readonly pkg: ScenarioPackage;
  readonly versions: RunVersions;
  readonly seed: string;
  readonly config: RunConfig;
  readonly rng: Rng;
  readonly store: WorldStateStore;
  readonly knowledge: KnowledgeTracker;
  readonly truth: TruthLayer;
  readonly spine: EventSpine;
  counters: WorldCounters;
  ended: EndState | null = null;

  constructor(args: {
    run_id: string;
    pkg: ScenarioPackage;
    versions: RunVersions;
    seed: string;
    config: RunConfig;
    rng: Rng;
    state: WorldState;
    knowledge: KnowledgeTracker;
    truth: TruthLayer;
    spine: EventSpine;
    counters?: WorldCounters;
  }) {
    this.run_id = args.run_id;
    this.pkg = args.pkg;
    this.versions = args.versions;
    this.seed = args.seed;
    this.config = args.config;
    this.rng = args.rng;
    this.store = new WorldStateStore(args.pkg, args.state);
    this.knowledge = args.knowledge;
    this.truth = args.truth;
    this.spine = args.spine;
    this.counters = args.counters ?? {
      turns: 0,
      rescues_used: 0,
      director_interventions: 0,
      blocked: 0,
      outcomes: { success: 0, partial: 0, failure: 0, backfire: 0 },
      fired: [],
      fired_at_turn: {},
      last_reveal_turn: 0,
    };
  }

  // -------------------------------------------------------------------------
  // identity helpers
  // -------------------------------------------------------------------------

  get playerId(): string {
    return this.pkg.world.player.id;
  }

  get clock(): number {
    return this.store.clock;
  }

  get minutesRemaining(): number | null {
    return this.pkg.world.duration_minutes === null ? null : Math.max(0, this.pkg.world.duration_minutes - this.clock);
  }

  character(id: string): CharacterDef | undefined {
    return this.pkg.cast.find((c) => c.id === id);
  }

  displayName(id: string): string {
    if (id === this.playerId) return this.pkg.world.player.name;
    return (
      this.character(id)?.name ??
      this.pkg.entities.find((e) => e.id === id)?.name ??
      this.pkg.locations.find((l) => l.id === id)?.name ??
      id
    );
  }

  /** Where the player is. Everything "present" is relative to this. */
  get playerLocation(): string {
    return this.store.read().positions[this.playerId] ?? this.pkg.world.player.start_location;
  }

  presentActors(): string[] {
    const loc = this.playerLocation;
    const st = this.store.read();
    return this.pkg.cast.filter((c) => st.positions[c.id] === loc && st.alive[c.id] !== false).map((c) => c.id);
  }

  /** 0..1 — how much trouble the player is in. Director input, never a hidden score. */
  pressure(): number {
    const rem = this.minutesRemaining;
    const timePressure = rem === null || !this.pkg.world.duration_minutes ? 0 : 1 - rem / this.pkg.world.duration_minutes;
    const bad = this.counters.outcomes.failure + this.counters.outcomes.backfire * 2;
    const total = Math.max(1, this.counters.turns);
    return Math.max(0, Math.min(1, 0.6 * timePressure + 0.4 * (bad / total)));
  }

  predContext(): PredContext {
    return {
      state: this.store.read(),
      knowledge: this.knowledge.snapshot(),
      truth: this.truth.entries(),
      turns: this.counters.turns,
      fired: new Set(this.counters.fired),
      pressure: this.pressure(),
      playerLocation: this.playerLocation,
    };
  }

  // -------------------------------------------------------------------------
  // the write path — every mutation in the engine goes through here (L3)
  // -------------------------------------------------------------------------

  /**
   * Apply an effect set atomically and write the event that caused it, with causality
   * populated at creation (L7). Returns the event and the apply result; on violation
   * NOTHING is applied and a rejection is logged.
   */
  commit(
    effects: readonly Effect[],
    event: AppendInput,
  ): { event: WorldEvent; result: ApplyResult } {
    const bound = this.resolveTokens(effects, { actor: event.actor_id, target: event.targets?.[0] ?? null });
    const knowledgeBefore = this.knowledge.snapshot();
    const knowledgeAfter = this.knowledge.preview(bound, this.clock, null);

    const result = this.store.apply(
      bound,
      knowledgeBefore,
      knowledgeAfter,
      {
        truth: this.truth,
        turns: this.counters.turns,
        fired: new Set(this.counters.fired),
        playerLocation: this.playerLocation,
      },
      { event_id: null, actor_id: event.actor_id },
    );

    const written = this.spine.append(
      {
        ...event,
        payload: {
          ...(event.payload ?? {}),
          effects_applied: result.ok ? bound.length : 0,
          rejected: result.ok ? false : true,
          ...(result.ok ? {} : { violations: result.violations.map((v) => `${v.invariant}: ${v.message}`) }),
        },
      },
      this.clock,
    );

    if (result.ok) {
      // knowledge commits with the same all-or-none discipline, stamped with the event
      this.knowledge.commit(this.knowledge.preview(bound, this.clock, written.id));
    }
    return { event: written, result };
  }

  /**
   * Late-bind the tokens a package may use in effect templates: @player, @actor,
   * @target, @canonical, and any truth binding (@culprit and friends). Packages carry
   * no logic (L12), so this substitution is the whole of their dynamism.
   */
  resolveTokens(effects: readonly Effect[], ctx: { actor?: string | null; target?: string | null }): Effect[] {
    const sub = (id: string): string => {
      if (id === '@player') return this.playerId;
      if (id === '@actor') return ctx.actor ?? this.playerId;
      if (id === '@target') return ctx.target ?? this.playerId;
      if (this.truth.isBinding(id)) return this.truth.bind(id) ?? id;
      return id;
    };
    return effects.map((e): Effect => {
      switch (e.kind) {
        case 'position':
          return { ...e, entity: sub(e.entity), location: sub(e.location) };
        case 'object':
          return { ...e, id: sub(e.id) };
        case 'existence':
          return { ...e, id: sub(e.id) };
        case 'resource':
          return { ...e, from: sub(e.from), to: sub(e.to) };
        case 'knowledge': {
          const actor = sub(e.actor);
          const value = e.value === '@canonical' ? (this.truth.read(e.fact) ?? null) : (e.value ?? null);
          const source = e.source ? sub(e.source) : e.source;
          return { ...e, actor, value, source };
        }
        case 'disposition':
          return { ...e, actor: sub(e.actor) };
        default:
          return e;
      }
    });
  }

  // -------------------------------------------------------------------------
  // projections (item 1, L4) — five scoped views, none of which can leak truth
  // -------------------------------------------------------------------------

  projectUi(): UiProjection {
    const st = this.store.read();
    const loc = this.pkg.locations.find((l) => l.id === this.playerLocation) ?? null;
    const pctx = this.predContext();
    const you = this.pkg.world.player;
    return Object.freeze({
      you: { name: you.name, role: you.role, description: you.you, objective: you.objective },
      clock: st.clock,
      minutes_remaining: this.minutesRemaining,
      location: loc ? { id: loc.id, name: loc.name, description: loc.description } : null,
      present: this.presentActors().map((id) => {
        const c = this.character(id)!;
        return {
          id,
          name: c.name,
          role: c.role,
          intro: c.intro,
          disposition_read: dispositionRead(st.dispositions[id] ?? {}),
        };
      }),
      resources: Object.entries(this.pkg.world.resources).map(([id, r]) => ({
        id,
        label: r.label,
        amount: st.resources[id]?.[this.playerId] ?? 0,
      })),
      flags_visible: Object.fromEntries(Object.entries(st.flags).filter(([k]) => !k.startsWith('_'))),
      documents: this.pkg.entities
        .filter((e) => e.kind === 'document' && e.location === this.playerLocation && st.objects[e.id] !== 'hidden')
        .map((e) => ({ id: e.id, title: e.name, body: e.body ?? e.description })),
      known_facts: this.knowledge.factsFor(this.playerId).map(({ fact, record }) => ({
        id: fact,
        statement: this.renderFact(fact, record.value),
        status: record.status,
        confidence: record.confidence,
      })),
      verb_chips: this.pkg.verbs
        .filter((v) => evalPred(v.chip_when, pctx))
        .map((v) => ({ id: v.id, label: v.label })),
    });
  }

  /** L6 is enforced HERE: the character's context is built from its knowledge alone. */
  projectCharacter(actorId: string): CharacterProjection | null {
    const c = this.character(actorId);
    if (!c) return null;
    const st = this.store.read();
    return Object.freeze({
      actor: c.id,
      name: c.name,
      role: c.role,
      voice: c.voice,
      motive: c.motive,
      reliability: c.reliability,
      clock: st.clock,
      location: st.positions[c.id] ?? '',
      present: this.presentActors().filter((id) => id !== c.id),
      knows: this.knowledge.factsFor(c.id).map(({ fact, record }) => ({
        fact,
        statement: this.renderFact(fact, record.value),
        status: record.status,
        confidence: record.confidence,
      })),
      disposition: { ...(st.dispositions[c.id] ?? {}) },
      recent: this.spine
        .visibleTo(c.id)
        .slice(-6)
        .map((e) => ({ world_time: e.world_time, line: String(e.payload.public_line ?? e.verb) })),
    });
  }

  projectDirector(): DirectorProjection {
    const pctx = this.predContext();
    return Object.freeze({
      clock: this.clock,
      minutes_remaining: this.minutesRemaining,
      turns_taken: this.counters.turns,
      turns_since_reveal: this.counters.turns - this.counters.last_reveal_turn,
      player_pressure: this.pressure(),
      legal_injects: this.pkg.injects
        .filter((i) => this.injectLegal(i.id, pctx))
        .map((i) => i.id),
      rescue_budget_left: Math.max(0, this.pkg.director.rescue_budget - this.counters.rescues_used),
    });
  }

  injectLegal(injectId: string, pctx = this.predContext()): boolean {
    const i = this.pkg.injects.find((x) => x.id === injectId);
    if (!i) return false;
    if (i.once && this.counters.fired.includes(i.id)) return false;
    if (i.min_clock !== undefined && this.clock < i.min_clock) return false;
    if (i.max_clock !== undefined && this.clock > i.max_clock) return false;
    if (i.cooldown_turns !== undefined) {
      const last = this.counters.fired_at_turn[i.id];
      if (last !== undefined && this.counters.turns - last < i.cooldown_turns) return false;
    }
    if (i.is_rescue && this.counters.rescues_used >= this.pkg.director.rescue_budget) return false;
    return evalPred(i.when, pctx);
  }

  /** The Narrator gets resolved effects plus public state. Never truth (item 12). */
  projectNarrator(): NarratorProjection {
    const st = this.store.read();
    const loc = this.pkg.locations.find((l) => l.id === this.playerLocation) ?? null;
    const present = this.presentActors().map((id) => ({ id, name: this.character(id)!.name }));
    return Object.freeze({
      clock: st.clock,
      location: loc ? { id: loc.id, name: loc.name, description: loc.description } : null,
      present,
      permitted_entities: [
        this.pkg.world.player.name,
        ...present.map((p) => p.name),
        ...this.pkg.entities.filter((e) => e.location === this.playerLocation).map((e) => e.name),
        ...(loc ? [loc.name] : []),
      ],
      public_flags: Object.fromEntries(Object.entries(st.flags).filter(([k]) => k.startsWith('public_'))),
      player_resources: Object.entries(this.pkg.world.resources).map(([id, r]) => ({
        id,
        label: r.label,
        amount: st.resources[id]?.[this.playerId] ?? 0,
      })),
    });
  }

  projectTelemetry(): TelemetryProjection {
    return Object.freeze({
      run_id: this.run_id,
      clock: this.clock,
      turns: this.counters.turns,
      outcome_counts: { ...this.counters.outcomes },
      blocked: this.counters.blocked,
      director_interventions: this.counters.director_interventions,
      rescues_used: this.counters.rescues_used,
    });
  }

  /** A fact's player-facing phrasing, with the HOLDER's value substituted — which may
   *  be wrong. The projection renders belief, never truth. */
  renderFact(factId: string, value: string | null): string {
    const def = this.pkg.facts.find((f) => f.id === factId);
    if (!def) return factId;
    const pretty = value ? this.displayName(value) : 'something';
    return def.statement.replace('{value}', pretty);
  }
}

function dispositionRead(axes: Record<string, number>): string {
  const trust = axes.trust ?? 0;
  const fear = axes.fear ?? 0;
  if (fear > 45) return 'rattled';
  if (trust > 35) return 'with you';
  if (trust < -35) return 'closing off';
  if (fear > 20) return 'edgy';
  return 'reading you';
}
