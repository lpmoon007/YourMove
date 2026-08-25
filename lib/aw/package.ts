// ITEM 2 — Scenario Package and Version Manager.
//
// "Scenario is data, not code." A package is authored content plus declarative rules
// in the predicate language; it contains no engine logic and no executable logic (L12).
// Published packages are immutable: a change is a new content version, and two runs are
// only comparable when scenario id, schema version, content version, and engine ruleset
// version all match.

import type { Pred } from './predicate';
import { predRefs } from './predicate';
import type {
  CharacterDef,
  Effect,
  KnowledgeStatus,
  OutcomeClass,
  PlaySignal,
  RunVersions,
} from './types';

/** Bumped when the SHAPE of a package changes. Packages declare which they were written for. */
export const SCHEMA_VERSION = 'aw-schema-1';
/** Bumped when engine behavior changes in a way that alters resolution. Stamped on runs. */
export const ENGINE_RULESET_VERSION = 'aw-engine-1.0.0';

// ---------------------------------------------------------------------------
// Effect templates — Effects with late-bound tokens the loader/engine substitute.
// Tokens: @player, @target, @actor, @canonical (a fact's true value), and any
// truth binding declared in the truth template (e.g. @culprit).
// ---------------------------------------------------------------------------
export type EffectTemplate = Effect;

export interface LocationDef {
  id: string;
  name: string;
  description: string;
  travel_minutes: Record<string, number>; // destination id → minutes
}

export interface EntityDef {
  id: string;
  name: string;
  kind: 'object' | 'document' | 'fixture';
  description: string;
  initial_state: string;
  location: string;
  searchable?: boolean;
  portable?: boolean;
  /** Documents render in the play interface. */
  body?: string;
}

export interface FactDef {
  id: string;
  /** Player-facing phrasing. "{value}" is substituted with the known value. */
  statement: string;
  /** The same fact as a thing you did not find out, with no value in it. Reads after
   *  "You never found out …", e.g. "who Marla owes money to". Substituting the value
   *  into `statement` when it is unknown produces "Marla owes money to something",
   *  which reads like a bug. */
  question: string;
  category: 'core' | 'supporting' | 'color';
  sensitivity: 'hidden' | 'discoverable' | 'public';
  /** Path ids. Part 4: anything a top outcome needs has at least two. */
  discoverable_via: string[];
  required_for_top_outcome?: boolean;
}

export interface DiscoveryPath {
  id: string;
  fact: string;
  description: string;
  /** What must be true for this path to be walkable. */
  requires?: Pred;
  /** Which actions open it. A path with neither is opened only by an authored override. */
  via_verb?: string[];
  via_target?: string[];
  /** How the fact arrives. '@canonical' is the truth; '@holder_belief' is whatever the
   *  source actor takes it to be (so a sincere mistake propagates as a sincere mistake);
   *  a literal is a lie the author has chosen for this teller. */
  disclosure?: {
    status: KnowledgeStatus;
    value: string;
    fidelity?: number;
    distortion?: string;
    confidence?: number;
    /** Who it comes from. Defaults to the action's target. */
    source?: string;
  };
  /** Words that must appear in what the player actually typed for this path to open.
   *  A targeted question gets the answer; "what's going on" does not. Omit for paths
   *  that are opened by the act itself (searching a drawer needs no keyword). */
  topic_hints?: string[];
  /** Extra world minutes this path costs on top of the verb. */
  cost_minutes?: number;
}

export interface TruthVariable {
  id: string;
  kind: 'choice' | 'int';
  choices?: string[];
  weights?: number[];
  min?: number;
  max?: number;
}

export interface TruthTemplate {
  variables: TruthVariable[];
  /** fact id → where its canonical value comes from. */
  facts: Record<string, { from_variable?: string; value?: string }>;
  /** Token → variable id. `@culprit` resolves to the drawn value of that variable. */
  bindings: Record<string, string>;
}

export interface HoldRule {
  actor: string; // may be a binding token, e.g. '@culprit'
  fact: string;
  status: KnowledgeStatus;
  /** '@canonical' (the truth), or a literal (a sincere mistake / a lie they believe). */
  value: string;
  confidence?: number;
  /** Only apply this hold when the predicate holds at load. */
  when?: Pred;
}

export interface VerbDef {
  id: string;
  label: string;
  aliases: string[];
  description: string;
  default_minutes: number;
  requires_target?: boolean;
  /** Reaches someone who is not in the room (a phone call, a text). */
  remote?: boolean;
  /** The action is directed at an object rather than a person. */
  object_verb?: boolean;
  /** An irreversible commitment that closes options and can end the run (flow step 7). */
  commitment?: boolean;
  /** The sentence shown when this verb ends the run. Required for a commitment verb:
   *  "committed: accuse" is a state machine talking, not an ending. */
  commitment_line?: string;
  /** Shown as a chip in the play interface when this predicate holds. Scaffolding only. */
  chip_when?: Pred;
  /** The verb is addressed to a person and can draw disclosure out of them. */
  speech?: boolean;
  /** The verb a bare question becomes. "how sure are you, Dez?" names no verb, but it is
   *  obviously a question put to somebody, and a world that answers it with "say that
   *  plainly" is broken. At most one verb per package may claim this. */
  question_verb?: boolean;
  /** Per-verb default effects by outcome class. This is the CONSTRAINT layer (L5):
   *  a handful of verbs carry defaults; nothing enumerates an entry per action. */
  effects_by_outcome?: Partial<Record<OutcomeClass, EffectTemplate[]>>;
  /** How hard this verb is on its own, before the world pushes back. 0..1. */
  base_difficulty?: number;
  /** What choosing this verb says about how someone is PLAYING. Read only after the run,
   *  by lib/aw/play — never by the runtime, and never able to change an outcome. */
  play_signals?: PlaySignal[];
}

export interface ResolutionOverride {
  id: string;
  priority: number;
  when: { verb?: string[]; target?: string[]; pred?: Pred };
  /** 'from_truth' compares the intent target against a canonical fact — the accusation case. */
  outcome: OutcomeClass | 'from_truth';
  truth_match?: { fact: string; target_equals_value?: boolean; equals?: string };
  /** Effects for the truth-matched branch (or the only branch for a fixed outcome). */
  effects: EffectTemplate[];
  /** Effects when 'from_truth' does not match. */
  effects_else?: EffectTemplate[];
  summary: string;
  summary_else?: string;
  reveals?: { fact: string; to: string; status: KnowledgeStatus; via: string }[];
  /** What reaching this beat says about how someone is playing (read after the fact). */
  play_signals?: PlaySignal[];
}

export interface InjectDef {
  id: string;
  kind: 'pressure' | 'reveal' | 'recovery' | 'reversal';
  /** Preconditions verified against state before firing (item 19). */
  when: Pred;
  min_clock?: number;
  max_clock?: number;
  once?: boolean;
  cooldown_turns?: number;
  /** Counts against the Director's rescue budget. Frequent rescues = broken scenario. */
  is_rescue?: boolean;
  actor: string;
  actor_type: 'character' | 'world_process' | 'director';
  verb: string;
  /** This beat puts a direct demand to the player. Read by the LFS-12 overlay (B5) as
   *  the denominator for closed-loop responsiveness — never by the engine itself. */
  demands_response?: boolean;
  effects: EffectTemplate[];
  line: string;
  summary: string;
}

export interface WorldProcessDef {
  id: string;
  kind: 'actor' | 'system';
  actor: string;
  trigger: { at_minute?: number; every_minutes?: number; when?: Pred };
  once?: boolean;
  effects: EffectTemplate[];
  line?: string;
  summary: string;
}

export interface OutcomeDimension {
  key: string;
  label: string;
  /** What this axis is measuring, in the player's words. Shown under the label, because
   *  a band on its own ("lighter", "noticed") means nothing to someone reading it once. */
  question: string;
  /** Every dimension must be able to move independently (Part 4). */
  scoring: { when: Pred; points: number; note: string }[];
  min: number;
  max: number;
  bands: { at_least: number; label: string }[];
}

export interface ContentDescriptors {
  depicted: string[];
  discussable: string[];
  player_action_bounds: string[];
  intensity: 'light' | 'moderate' | 'strong';
  estimated_minutes: number;
}

export interface ScenarioPackage {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  format: 'F1' | 'F2' | 'F3';
  /** Plain genre label, shown before anything else. A player deciding whether to press
   *  Play should never have to infer what kind of thing this is. */
  genre: string;
  schema_version: string;
  content_version: string;
  world: {
    premise: string;
    /** What the player is told when the clock runs out. */
    ending_out_of_time: string;
    /** What has ALREADY happened, stated plainly and with zero mystery: who you are with,
     *  what you did, where you are, what is in the room. The mystery in a world is what
     *  the player has to work out DURING it, never the situation they arrived in. */
    setup: string;
    /** The trouble. Why this is a scene and not an anecdote. */
    trouble: string;
    cold_open: string;
    /** What a player could type here, in this world, with these people. Shown on the
     *  brief as the example of how to talk to the game. Required, because the examples
     *  name this world's cast and objects — a generic example teaches nothing, and a
     *  borrowed one names people who are not in the room. */
    example_actions: string[];
    /** One line under the cast, about who is and is not in this world. */
    cast_note: string;
    /** What the clock is counting down to, in three or four words, under the number:
     *  "left before the van goes", "until the presses start". Required for the same
     *  reason the rest of this is: a label written for one world is wrong in the next. */
    clock_label: string;
    /**
     * The 90-second version of this world: one moment, and three moves somebody can make
     * on it without signing up for anything.
     *
     * This is not a demo of the world, it is the FIRST TURN of it. Whichever move gets
     * picked is played here, by the engine, against this world's real rules — which is
     * why the moves live in the package beside the verbs they use rather than being
     * written separately somewhere they can drift out of date.
     *
     * The previews are deliberately confident about what will happen. The world never is.
     * That gap is the point of the handover, not a flaw in it.
     */
    opening?: {
      /** The moment, told to somebody who knows nothing at all about this world. */
      prompt: string;
      choices: {
        id: string;
        /** What the button says. */
        label: string;
        /** What picking it looks like it will do. */
        preview: string;
        /** What is actually typed into the world as turn one. */
        move: string;
      }[];
    };
    /** What a player has to know about how THIS world behaves that they could not guess:
     *  who can be trusted, what ends the run, what the clock means here. Required, and
     *  worded as "Something short. The rest of it." — the first sentence is bolded. */
    house_rules: string[];
    player: {
      id: string;
      name: string;
      role: string;
      start_location: string;
      /** Who you are, in the second person. Two sentences at most — orientation, not
       *  exposition. The rules require a DEFINED ROLE at the cold open. */
      you: string;
      /** What you are trying to achieve. Stated plainly, because a player who does not
       *  know the objective cannot make an interesting choice about it. */
      objective: string;
      /** The one thing pressing on you right now. */
      pressure: string;
    };
    /** Hard stop in world minutes. Null means no clock limit. */
    duration_minutes: number | null;
    /** Resource id → { label, holder → amount }. */
    resources: Record<string, { label: string; holdings: Record<string, number> }>;
    flags: Record<string, string | number | boolean>;
  };
  locations: LocationDef[];
  entities: EntityDef[];
  cast: CharacterDef[];
  facts: FactDef[];
  discovery_paths: DiscoveryPath[];
  truth_template: TruthTemplate;
  /** Information topology — who holds what at load (item 3). */
  holds: HoldRule[];
  verbs: VerbDef[];
  overrides: ResolutionOverride[];
  injects: InjectDef[];
  processes: WorldProcessDef[];
  outcome_dimensions: OutcomeDimension[];
  difficulty: Record<string, { opposition_multiplier: number; cost_multiplier: number }>;
  content_descriptors: ContentDescriptors;
  assets: { audio: { id: string; text: string; voice: string }[] };
  /** Which of the Core Eight this world can meaningfully observe. Empty means all of
   *  them: a world that never offers a delegation opportunity simply produces no
   *  delegation evidence, and the profile reports that honestly. */
  play_dimensions?: string[];
  /** Extra spectrums that only make sense here. They use the same evidence machinery and
   *  are never folded into the cross-world profile. */
  world_specific_dimensions?: {
    id: string;
    label_left: string;
    label_right: string;
    measures: string;
  }[];
  /** Item 6: invariants are extensible PER SCENARIO without engine changes. A custom
   *  invariant is a predicate that must never hold after a write. */
  invariants?: {
    exclusive_flags?: { flags: string[]; message: string }[];
    forbidden?: { id: string; when: Pred; message: string }[];
  };
  /** Authored lines the Narrator degrades to on refusal or validation failure (item 12). */
  narrator_fallbacks: Record<string, string>;
  director: { rescue_budget: number; min_turns_between_injects: number };
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
}

/** Item 2: "MUST validate a package against the schema before load, and refuse to load
 *  on failure." This is that gate, plus the Part-4 authoring rules that can be checked
 *  statically. Errors block the load; warnings are reported and allowed. */
export function validateScenarioPackage(p: ScenarioPackage): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (code: string, message: string) => issues.push({ severity: 'error', code, message });
  const warn = (code: string, message: string) => issues.push({ severity: 'warning', code, message });

  if (p.schema_version !== SCHEMA_VERSION) {
    err('schema_mismatch', `package targets ${p.schema_version}; engine speaks ${SCHEMA_VERSION}`);
  }
  if (!p.content_version) err('no_content_version', 'content_version is required — runs are stamped with it');

  const locIds = new Set(p.locations.map((l) => l.id));
  const castIds = new Set(p.cast.map((c) => c.id));
  const entIds = new Set(p.entities.map((e) => e.id));
  const factIds = new Set(p.facts.map((f) => f.id));
  const pathIds = new Set(p.discovery_paths.map((d) => d.id));
  const verbIds = new Set(p.verbs.map((v) => v.id));
  const actorIds = new Set([...castIds, p.world.player.id]);
  const bindingTokens = new Set(Object.keys(p.truth_template.bindings).map((b) => `@${b}`));
  const knownActor = (id: string) => actorIds.has(id) || bindingTokens.has(id) || id === '@player' || id === 'world';

  if (!locIds.has(p.world.player.start_location)) err('bad_start', 'player start_location is not a location');
  // The cold open must land the player with a defined role and a legible objective.
  // A world that drops someone in without them is not mysterious, it is unplayable.
  if (!p.world.player.you?.trim()) err('no_player_identity', 'world.player.you is required — the player must know who they are');
  if (!p.world.player.objective?.trim()) err('no_objective', 'world.player.objective is required — the player must know what they want');
  if (!p.world.player.pressure?.trim()) err('no_pressure', 'world.player.pressure is required — the cold open needs one immediate pressure');
  if (!p.genre?.trim()) err('no_genre', 'genre is required — a player should never have to guess what kind of thing this is');
  if (!p.world.setup?.trim()) err('no_setup', 'world.setup is required — what already happened is stated plainly, never inferred');
  if (!p.world.trouble?.trim()) err('no_trouble', 'world.trouble is required — say why this is a scene');
  for (const l of p.locations)
    for (const dest of Object.keys(l.travel_minutes))
      if (!locIds.has(dest)) err('bad_travel', `${l.id} → unknown location ${dest}`);
  for (const e of p.entities) if (!locIds.has(e.location)) err('bad_entity_loc', `entity ${e.id} in unknown location ${e.location}`);

  // --- cast (Part 4) ---
  if (p.cast.length === 0) err('no_cast', 'a world with no characters has no leverage');
  for (const c of p.cast) {
    if (!c.leverage?.trim())
      err('no_leverage', `character ${c.id} holds no leverage — that is scenery, not a character`);
    // A player must never meet a name they were not introduced to.
    if (!c.intro?.trim())
      err('no_intro', `character ${c.id} has no intro — the player would meet a name with no person attached`);
    for (const f of c.knows) if (!factIds.has(f)) err('bad_char_fact', `${c.id} knows unknown fact ${f}`);
  }
  if (!p.cast.some((c) => c.reliability === 'mistaken'))
    err('no_mistaken', 'at least one character must be sincerely mistaken (Part 4)');
  if (!p.cast.some((c) => c.reliability === 'deceptive'))
    err('no_deceptive', 'at least one character must be deliberately deceptive (Part 4)');

  // --- facts and discovery paths ---
  for (const f of p.facts) {
    if (!f.question?.trim())
      err('no_fact_question', `fact ${f.id} has no question form — the debrief would print "…was something"`);
    for (const d of f.discoverable_via) if (!pathIds.has(d)) err('bad_path_ref', `fact ${f.id} cites unknown path ${d}`);
    if (f.required_for_top_outcome) {
      const distinct = new Set(f.discoverable_via);
      if (distinct.size < 2)
        err('single_path', `fact ${f.id} is required for a top outcome but has ${distinct.size} discovery path(s); Part 4 requires two independent paths`);
    }
  }
  for (const d of p.discovery_paths) {
    if (!factIds.has(d.fact)) err('bad_path_fact', `path ${d.id} reveals unknown fact ${d.fact}`);
    // A path through a thing the player cannot get to is not a path. Nothing moves the
    // player between locations — the parser will not even offer them the name — so a fact
    // that counts on an object stowed somewhere else has one route fewer than it claims,
    // and the player is told "look at what?" as though they had typed nonsense.
    for (const t of d.via_target ?? []) {
      const ent = p.entities.find((e) => e.id === t);
      if (ent && ent.location !== p.world.player.start_location)
        err(
          'path_out_of_reach',
          `path ${d.id} goes through ${ent.id}, which is in ${ent.location} while the player is in ${p.world.player.start_location} — nothing can carry them there`,
        );
    }
    // Path descriptions are shown to the player in the debrief as "you could have …".
    // A hint that contains the answer is not a hint.
    const fixed = p.truth_template.facts[d.fact]?.value;
    if (fixed && fixed.length > 3 && d.description.toLowerCase().includes(String(fixed).toLowerCase()))
      err('hint_spoils', `path ${d.id} names the answer ("${fixed}") in the hint the player is shown`);
    for (const r of predRefs(d.requires))
      if (!factIds.has(r) && !knownActor(r) && !entIds.has(r) && !locIds.has(r))
        warn('path_ref', `path ${d.id} references unknown id ${r}`);
  }

  // --- truth template ---
  const varIds = new Set(p.truth_template.variables.map((v) => v.id));
  for (const [factId, src] of Object.entries(p.truth_template.facts)) {
    if (!factIds.has(factId)) err('bad_truth_fact', `truth template assigns unknown fact ${factId}`);
    if (src.from_variable && !varIds.has(src.from_variable))
      err('bad_truth_var', `fact ${factId} draws from unknown variable ${src.from_variable}`);
    if (!src.from_variable && src.value === undefined)
      err('empty_truth', `fact ${factId} has neither a variable nor a fixed value`);
  }
  for (const [token, v] of Object.entries(p.truth_template.bindings))
    if (!varIds.has(v)) err('bad_binding', `binding @${token} points at unknown variable ${v}`);
  for (const v of p.truth_template.variables) {
    if (v.kind === 'choice' && (!v.choices || v.choices.length < 2))
      err('thin_variable', `variable ${v.id} needs at least two choices to be worth seeding`);
    if (v.weights && v.choices && v.weights.length !== v.choices.length)
      err('bad_weights', `variable ${v.id}: weights and choices differ in length`);
  }

  // --- holds ---
  for (const h of p.holds) {
    if (!knownActor(h.actor)) err('bad_hold_actor', `hold on unknown actor ${h.actor}`);
    if (!factIds.has(h.fact)) err('bad_hold_fact', `hold on unknown fact ${h.fact}`);
  }

  // --- verbs / overrides / injects / processes ---
  if (p.verbs.length < 5) warn('thin_vocab', `${p.verbs.length} verbs — Vertical Slice A wants at least five plausible actions`);
  for (const o of p.overrides) {
    for (const v of o.when.verb ?? []) if (!verbIds.has(v)) err('bad_override_verb', `override ${o.id} matches unknown verb ${v}`);
    if (o.outcome === 'from_truth' && !o.truth_match) err('no_truth_match', `override ${o.id} is from_truth but declares no truth_match`);
    if (o.truth_match && !factIds.has(o.truth_match.fact)) err('bad_truth_ref', `override ${o.id} reads unknown fact ${o.truth_match.fact}`);
  }
  if (p.overrides.length > p.verbs.length * 3)
    warn('override_sprawl', 'overrides outnumber verbs 3:1 — L5: authored rules constrain resolution, they do not enumerate it');
  for (const i of p.injects) {
    if (!knownActor(i.actor)) err('bad_inject_actor', `inject ${i.id} acts as unknown actor ${i.actor}`);
    if (!i.when) err('unguarded_inject', `inject ${i.id} has no preconditions — it could fire in an incoherent state`);
  }
  for (const w of p.processes)
    if (!w.trigger.at_minute && !w.trigger.every_minutes && !w.trigger.when)
      err('unguarded_process', `process ${w.id} has no trigger condition`);

  // --- outcomes ---
  if (p.outcome_dimensions.length < 2) err('single_axis', 'outcomes are multi-axis, not a score (item 24)');
  for (const d of p.outcome_dimensions) {
    if (!d.scoring.length) err('empty_dimension', `dimension ${d.key} can never move`);
    if (!d.question?.trim()) err('no_dimension_question', `dimension ${d.key} does not say what it measures`);
  }
  if (!p.world.ending_out_of_time?.trim())
    err('no_clock_ending', 'world.ending_out_of_time is required — running out of time needs a sentence');

  // The brief is one screen shared by every world, so everything on it that is specific
  // to a world has to come from the world. A second world that forgot these would show
  // the first world's cast to somebody who has never met them.
  if ((p.world.example_actions ?? []).length < 2)
    err('no_examples', 'world.example_actions needs at least two things a player could type here');
  for (const ex of p.world.example_actions ?? [])
    if (!namesSomethingReal(p, ex))
      err('example_names_nothing', `example action "${ex}" names nobody and nothing in this world`);
  if (!p.world.cast_note?.trim())
    err('no_cast_note', 'world.cast_note is required — the player needs to know who else is coming');
  // The opening is a promise made on the front of the house. Every part of it has to be
  // playable here, or "enter the full world" lands somebody somewhere that does not exist.
  if (p.world.opening) {
    const o = p.world.opening;
    if (!o.prompt?.trim()) err('no_opening_prompt', 'world.opening has no moment to show');
    if (o.choices.length < 2) err('thin_opening', 'world.opening needs at least two moves to choose between');
    const seen = new Set<string>();
    for (const c of o.choices) {
      if (seen.has(c.id)) err('duplicate_opening_choice', `world.opening has two choices called ${c.id}`);
      seen.add(c.id);
      for (const [field, value] of [['label', c.label], ['preview', c.preview], ['move', c.move]] as [string, string][])
        if (!value?.trim()) err('empty_opening_choice', `opening choice ${c.id} has no ${field}`);
      // The move is typed into this world, so it has to be about this world.
      if (c.move && !namesSomethingReal(p, c.move))
        err('opening_move_names_nothing', `opening choice ${c.id} plays "${c.move}", which names nobody and nothing here`);
    }
  }

  if (p.world.duration_minutes !== null && !p.world.clock_label?.trim())
    err('no_clock_label', 'world.clock_label is required — the number on the clock has to say what it is counting down to');
  if ((p.world.house_rules ?? []).length < 2)
    err('no_house_rules', 'world.house_rules needs at least two — what ends a run here, and who can be trusted');
  for (const v of p.verbs) {
    if (v.commitment && !v.commitment_line?.trim())
      err('no_commitment_line', `verb ${v.id} ends the run but has no ending sentence`);
    if (v.question_verb && !(v.speech && v.requires_target))
      err('bad_question_verb', `verb ${v.id} answers bare questions but is not a speech verb that takes a target`);
  }
  if (p.verbs.filter((v) => v.question_verb).length > 1)
    err('two_question_verbs', 'more than one verb claims bare questions — a question can only mean one thing');

  // --- content descriptors, written before the scenario (Part 4) ---
  const cd = p.content_descriptors;
  if (!cd || !cd.depicted?.length || !cd.player_action_bounds?.length)
    err('no_descriptors', 'content descriptors are required before a package may load');

  return issues;
}

export function assertLoadable(p: ScenarioPackage): void {
  const issues = validateScenarioPackage(p);
  const errors = issues.filter((i) => i.severity === 'error');
  if (errors.length) {
    throw new Error(
      `Scenario package ${p.slug} failed validation and will not load:\n` +
        errors.map((e) => `  [${e.code}] ${e.message}`).join('\n'),
    );
  }
}

/** The version tuple stamped on every run (item 2). A seed alone is not a world. */
export function versionsFor(p: ScenarioPackage): RunVersions {
  return {
    scenario_id: p.id,
    schema_version: p.schema_version,
    content_version: p.content_version,
    engine_ruleset_version: ENGINE_RULESET_VERSION,
  };
}

/** Two runs are comparable only when every version matches (item 2). */
export function comparable(a: RunVersions, b: RunVersions): boolean {
  return (
    a.scenario_id === b.scenario_id &&
    a.schema_version === b.schema_version &&
    a.content_version === b.content_version &&
    a.engine_ruleset_version === b.engine_ruleset_version
  );
}

/**
 * Does this sentence name anybody or anything that exists in this world?
 *
 * The point is to catch a world whose brief was copied from another one: an example
 * action naming a cast member who is not in the room teaches the player a name for
 * somebody they will never meet.
 */
function namesSomethingReal(p: ScenarioPackage, sentence: string): boolean {
  const said = new Set(
    sentence
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean),
  );
  const names = [
    ...p.cast.flatMap((c) => [c.name, c.id]),
    ...p.entities.flatMap((e) => [e.name, e.id]),
    ...p.locations.flatMap((l) => [l.name, l.id]),
  ];
  return names.some((n) =>
    n
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 2)
      .some((w) => said.has(w)),
  );
}
