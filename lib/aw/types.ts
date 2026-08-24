// ADAPTIVE WORLDS — core glossary, expressed as types (Engine Design Rules, Part 1).
//
// Every name here means exactly one thing. If a word in Part 1 has no type in this
// file, it is either a runtime object (World, Run) or a rule (the Laws), not a datum.
//
// This module is PURE. No I/O, no `server-only`, no Supabase, no model calls — it is
// imported by the test harness, the store adapters, and the app alike.

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

// ---------------------------------------------------------------------------
// Actors and events (item 5)
// ---------------------------------------------------------------------------

/** Part 1 — "Actor: anything that takes action." */
export type ActorType = 'player' | 'character' | 'world_process' | 'director' | 'system';

/** Causal fields (item 5). Every array holds event IDs, written AT CREATION (L7). */
export interface Causality {
  caused_by: string[];
  enabled_by: string[];
  blocked_by: string[];
  amplified_by: string[];
  revealed_by: string[];
}

/** An immutable record of something that happened. The only history that exists (L8). */
export interface WorldEvent {
  id: string;
  run_id: string;
  seq: number;
  world_time: number; // world minutes since world start
  wall_time: string; // ISO — supplied by the caller so the core stays pure
  actor_id: string;
  actor_type: ActorType;
  verb: string;
  targets: string[];
  payload: Record<string, Json>;
  /** Which actors may perceive this event. '*' means public. */
  visibility: string[];
  causality: Causality;
}

// ---------------------------------------------------------------------------
// Knowledge (item 11)
// ---------------------------------------------------------------------------

export type KnowledgeStatus = 'unknown' | 'told' | 'observed' | 'inferred' | 'believed_false';

export interface KnowledgeRecord {
  status: KnowledgeStatus;
  /** What the holder takes the fact's value to be. May be WRONG (believed_false). */
  value: string | null;
  source_actor: string | null;
  acquired_at: number | null; // world time
  fidelity: number; // 0..1 — how intact the content arrived
  distortion: string | null; // what changed in transit, if anything
  confidence: number; // 0..1 — how much the holder credits it
  contradicted: boolean;
  provenance: string[]; // event IDs, oldest → newest
}

/** actor id → fact id → record. Never merged with canonical truth (item 11). */
export type KnowledgeStore = Record<string, Record<string, KnowledgeRecord>>;

// ---------------------------------------------------------------------------
// World state (item 1) — what is currently true and changeable.
// Holds no canonical truth (item 4), no knowledge (item 11), no history (item 5).
// ---------------------------------------------------------------------------

export interface Timer {
  fires_at: number; // world time
  payload: Record<string, Json>;
}

export interface WorldState {
  clock: number; // world minutes elapsed
  flags: Record<string, string | number | boolean>;
  positions: Record<string, string>; // entity id → location id
  objects: Record<string, string>; // object id → object state
  destroyed: string[]; // existence invariant: destroyed things stay destroyed
  alive: Record<string, boolean>; // actor id → alive
  /** resource id → holder id → amount. Conservation is checked over this map. */
  resources: Record<string, Record<string, number>>;
  timers: Record<string, Timer>;
  /** actor id → axis → value (−100..100). Disposition moves; motive does not (item 15). */
  dispositions: Record<string, Record<string, number>>;
}

// ---------------------------------------------------------------------------
// Effects (item 9 returns them, item 10 applies them, item 6 validates them)
// ---------------------------------------------------------------------------

export type Effect =
  | { kind: 'flag'; id: string; value: string | number | boolean }
  | { kind: 'position'; entity: string; location: string }
  | { kind: 'object'; id: string; state: string }
  | { kind: 'existence'; id: string; op: 'destroy' | 'kill'; origin?: string }
  | { kind: 'resource'; id: string; from: string; to: string; amount: number }
  | {
      kind: 'knowledge';
      actor: string;
      fact: string;
      status: KnowledgeStatus;
      value?: string | null;
      source?: string | null;
      fidelity?: number;
      distortion?: string | null;
      confidence?: number;
    }
  | { kind: 'clock'; minutes: number }
  | { kind: 'timer'; op: 'start' | 'cancel'; id: string; in_minutes?: number; payload?: Record<string, Json> }
  | { kind: 'disposition'; actor: string; axis: string; delta: number };

export type EffectKind = Effect['kind'];

// ---------------------------------------------------------------------------
// Intent (item 7)
// ---------------------------------------------------------------------------

export interface Intent {
  verb: string; // scenario vocabulary, or 'other'
  targets: string[];
  method: string | null;
  instrument: string | null;
  resources: { id: string; amount: number }[];
  goal: string | null;
  secrecy: 'open' | 'discreet' | 'covert';
  addressee: string | null;
  confidence: number; // 0..1 — low means ask, never guess (item 7)
  raw: string;
  /** Present when verb === 'other': the natural-language description carried forward. */
  description?: string;
}

// ---------------------------------------------------------------------------
// Capability (item 8) — five results, not two
// ---------------------------------------------------------------------------

export type CapabilityClass =
  | 'permitted'
  | 'permitted_with_cost'
  | 'permitted_with_constraint'
  | 'attempted_with_uncertainty'
  | 'impossible';

export interface CapabilityVerdict {
  result: CapabilityClass;
  /** Diegetic on every non-permitted result (item 8, L10). Never "you can't do that". */
  reason: string | null;
  /** Who or what delivers the reason in world. */
  voiced_by: string | null;
  cost: Effect[]; // paid whether or not the action then succeeds
  constraint: string | null;
  /** Added to the failure side of the resolver draw. */
  uncertainty: number; // 0..1
  /** World minutes this attempt consumes, after constraints and costs. */
  minutes: number;
  /** Resource commitments, resolved against what the actor actually holds. */
  commits: { id: string; amount: number }[];
  checks: { check: string; passed: boolean; note?: string }[];
}

// ---------------------------------------------------------------------------
// Resolution (item 9)
// ---------------------------------------------------------------------------

export type OutcomeClass = 'success' | 'partial' | 'failure' | 'backfire';

export interface Resolution {
  outcome: OutcomeClass;
  effects: Effect[];
  uncertainty: number;
  /** Which path produced this: the default resolver, or a named authored override. */
  rule_path: string;
  draw: number; // the seeded draw, recorded so replay reproduces it
  capability_score: number;
  opposition_score: number;
  /** Facts this resolution makes available to the player, with how they arrive. */
  reveals: { fact: string; to: string; status: KnowledgeStatus; via: string }[];
  /** Short, factual summary of what happened — the Narrator renders THIS, not truth. */
  summary: string;
}

// ---------------------------------------------------------------------------
// Projections (item 1, L4) — permissioned read-only views
// ---------------------------------------------------------------------------

export interface UiProjection {
  /** Who the player is and what they are trying to do. Constant for the run, rendered
   *  everywhere, because "what am I even doing here" is not the interesting question. */
  you: { name: string; role: string; description: string; objective: string };
  clock: number;
  minutes_remaining: number | null;
  location: { id: string; name: string; description: string } | null;
  present: { id: string; name: string; role: string; disposition_read: string }[];
  resources: { id: string; label: string; amount: number }[];
  flags_visible: Record<string, string | number | boolean>;
  documents: { id: string; title: string; body: string }[];
  known_facts: { id: string; statement: string; status: KnowledgeStatus; confidence: number }[];
  /** Actions the world will recognise right now. Scaffolding only — typing beats chips (item 21). */
  verb_chips: { id: string; label: string }[];
}

export interface CharacterProjection {
  actor: string;
  name: string;
  role: string;
  voice: string;
  motive: string;
  reliability: ReliabilityProfile;
  clock: number;
  location: string;
  present: string[];
  /** ONLY this character's knowledge (L6). Constructed, not instructed. */
  knows: { fact: string; statement: string; status: KnowledgeStatus; confidence: number }[];
  disposition: Record<string, number>;
  recent: { world_time: number; line: string }[];
}

export interface DirectorProjection {
  clock: number;
  minutes_remaining: number | null;
  turns_taken: number;
  turns_since_reveal: number;
  player_pressure: number; // 0..1
  legal_injects: string[]; // inject ids whose preconditions hold NOW
  rescue_budget_left: number;
}

export interface NarratorProjection {
  clock: number;
  location: { id: string; name: string; description: string } | null;
  present: { id: string; name: string }[];
  /** The entity/actor names the Narrator is permitted to use. Anything else is drift. */
  permitted_entities: string[];
  public_flags: Record<string, string | number | boolean>;
  player_resources: { id: string; label: string; amount: number }[];
}

export interface TelemetryProjection {
  run_id: string;
  clock: number;
  turns: number;
  outcome_counts: Record<OutcomeClass, number>;
  blocked: number;
  director_interventions: number;
  rescues_used: number;
}

// ---------------------------------------------------------------------------
// Characters (item 15)
// ---------------------------------------------------------------------------

export type ReliabilityProfile = 'honest' | 'evasive' | 'mistaken' | 'self_serving' | 'deceptive';

export interface CharacterDef {
  id: string;
  name: string;
  role: string;
  voice: string; // how they talk — the Narrator's dialogue direction
  motive: string; // stable within a run (item 15)
  reliability: ReliabilityProfile;
  competence: number; // 0..1
  start_location: string;
  leverage: string; // what they hold that the player needs, or must protect
  starting_disposition: Record<string, number>;
  /** Fact IDs this character holds at load, before any seeded assignment. */
  knows: string[];
  /** Authored fallback lines by situation key — used when the model refuses (item 12). */
  fallback_lines: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Run versioning (item 2) — a seed alone is not a reproducible world
// ---------------------------------------------------------------------------

export interface RunVersions {
  scenario_id: string;
  schema_version: string;
  content_version: string;
  engine_ruleset_version: string;
}

export interface RunConfig {
  /** V1A: fixed. The dial exists so V1C can vary it without a migration. */
  difficulty: 'standard';
  /** The twelve-measurement LFS overlay is OFF unless a console explicitly asks (see lens/lfs12). */
  lfs12_overlay: boolean;
}
