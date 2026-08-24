// The turn pipeline. Five stages, exactly as the convergence brief specifies: two model
// calls, three code. The model proposes and speaks; the rules decide and remember (L1).
//
//   1  intent parse ......... model (deterministic fallback)   item 7
//   2  capability + cost .... code                             item 8
//   3  resolution ........... code + seeded draw               item 9
//   4  consequence .......... code + world processes + Director items 10, 17, 19
//   5  narration ............ model (authored fallback)        item 12
//
// Nothing between stage 2 and stage 4 ever asks a model anything.

import { checkCapability } from './capability';
import { outOfTime } from './clock';
import { applyBlocked, applyResolution } from './consequence';
import { tickDirector, type DirectorDecision } from './director';
import { CLARIFY_THRESHOLD, localParser, needsClarification, type IntentParser, type ParseInput } from './intent';
import { fallbackLine, narrate, type NarrationRequest, type Narrator } from './narrator';
import { tickProcesses } from './processes';
import { resolve } from './resolver';
import type {
  CapabilityVerdict,
  Intent,
  Json,
  OutcomeClass,
  Resolution,
  TelemetryProjection,
  UiProjection,
  WorldEvent,
} from './types';
import type { EndState, World } from './world';

export interface EngineDeps {
  /** Null → the deterministic parser. The world always runs. */
  parser?: IntentParser | null;
  /** Null → the deterministic renderer. The world always runs. */
  narrator?: Narrator | null;
}

/** Everything needed to replay this turn byte-for-byte (brief 10.5 `adjudication`). */
export interface AdjudicationRecord {
  event_id: string;
  raw_text: string;
  intent: Intent;
  parser_model: string | null;
  parser_output: string | null;
  stage2_result: CapabilityVerdict['result'];
  stage2_reason: string | null;
  stage3_rule_path: string | null;
  seeded_draw: number | null;
  outcome: OutcomeClass | 'blocked' | 'clarify';
  director_participated: boolean;
  narrator_model: string | null;
  narrator_output: string | null;
  narrator_fell_back: boolean;
  validation_problems: string[];
}

export interface TurnResult {
  narration: string;
  outcome: OutcomeClass | 'blocked' | 'clarify';
  events: WorldEvent[];
  director: DirectorDecision | null;
  ui: UiProjection;
  telemetry: TelemetryProjection;
  ended: EndState | null;
  adjudication: AdjudicationRecord;
}

export async function takeTurn(world: World, rawText: string, deps: EngineDeps = {}): Promise<TurnResult> {
  if (world.ended) return terminalTurn(world, rawText);

  const parser: IntentParser = deps.parser ?? localParser;
  const narrator = deps.narrator ?? null;

  // --- stage 1: intent parse (model) ---------------------------------------
  const parseInput: ParseInput = {
    raw: rawText,
    vocabulary: world.pkg.verbs,
    surface: {
      actors: world.presentActors().map((id) => ({ id, name: world.displayName(id) })),
      entities: world.pkg.entities
        .filter((e) => e.location === world.playerLocation)
        .map((e) => ({ id: e.id, name: e.name })),
      resources: Object.entries(world.pkg.world.resources).map(([id, r]) => ({ id, label: r.label })),
      location: world.pkg.locations.find((l) => l.id === world.playerLocation)
        ? { id: world.playerLocation, name: world.displayName(world.playerLocation) }
        : null,
    },
    recent: world.spine
      .all()
      .slice(-4)
      .map((e) => String(e.payload.public_line ?? '')),
  };
  const parsed = await parser.parse(parseInput);
  const intent = parsed.intent;

  // --- ambiguity is answered in world, never with an error (item 7) --------
  if (needsClarification(intent)) return clarifyTurn(world, intent, parsed, narrator);

  // --- stage 2: capability and cost (code) ---------------------------------
  const cap = checkCapability(world, intent);

  // --- stage 3 + 4 ----------------------------------------------------------
  let resolution: Resolution | null = null;
  let consequence: ReturnType<typeof applyResolution>;
  if (cap.result === 'impossible') {
    consequence = applyBlocked(world, { intent, capability: cap, parse: parsed });
  } else {
    resolution = resolve(world, intent, cap);
    consequence = applyResolution(world, { intent, capability: cap, resolution, parse: parsed });
  }

  const events: WorldEvent[] = [consequence.action_event, ...consequence.derived_events];

  // --- world processes, then the Director ----------------------------------
  const proc = tickProcesses(world, consequence.action_event.id);
  events.push(...proc.events);

  let director: DirectorDecision | null = null;
  if (consequence.applied) {
    director = tickDirector(world, consequence.action_event.id);
    if (director.event) events.push(director.event);
    const post = tickProcesses(world, director.event?.id ?? consequence.action_event.id);
    events.push(...post.events);
    proc.lines.push(...post.lines);
  }

  // --- end conditions -------------------------------------------------------
  const ended = checkEnd(world, intent, cap);

  // --- stage 5: narration (model), validated, degrading to authored text ----
  const speakerId = cap.result === 'impossible' ? cap.voiced_by : (intent.targets.find((t) => world.character(t)) ?? null);
  const req: NarrationRequest = {
    summary: cap.result === 'impossible' ? (cap.reason ?? 'Nothing doing.') : (resolution?.summary ?? ''),
    outcome: cap.result === 'impossible' ? 'blocked' : (resolution?.outcome ?? 'failure'),
    projection: world.projectNarrator(),
    speaker: speakerId ? world.projectCharacter(speakerId) : null,
    authored_lines: [...proc.lines, ...(director?.line ? [director.line] : [])],
    revealed: (resolution?.reveals ?? []).map((r) => ({
      statement: world.renderFact(r.fact, world.knowledge.get(world.playerId, r.fact).value),
      from: (() => {
        const src = world.knowledge.get(world.playerId, r.fact).source_actor;
        return src && world.character(src) ? world.displayName(src) : null;
      })(),
    })),
    fallback_key: cap.result === 'impossible' ? 'narration.blocked' : `narration.${resolution?.outcome ?? 'failure'}`,
    player_text: rawText,
  };
  const narration = await narrate(world.pkg, req, narrator);

  // the rendered prose rides on the event as a RENDERING, never as the record (item 5)
  world.spine.append(
    {
      actor_id: 'system',
      actor_type: 'system',
      verb: 'narration',
      targets: [consequence.action_event.id],
      visibility: [world.playerId],
      causality: { caused_by: [consequence.action_event.id] },
      payload: {
        text: narration.text,
        model: narration.model,
        fell_back: narration.fell_back,
        problems: narration.validation.problems as unknown as Json,
      },
    },
    world.clock,
  );

  return {
    narration: narration.text,
    outcome: req.outcome,
    events,
    director,
    ui: world.projectUi(),
    telemetry: world.projectTelemetry(),
    ended,
    adjudication: {
      event_id: consequence.action_event.id,
      raw_text: rawText,
      intent,
      parser_model: parsed.model,
      parser_output: parsed.raw_output,
      stage2_result: cap.result,
      stage2_reason: cap.reason,
      stage3_rule_path: resolution?.rule_path ?? null,
      seeded_draw: resolution?.draw ?? null,
      outcome: req.outcome,
      director_participated: Boolean(director?.fired),
      narrator_model: narration.model,
      narrator_output: narration.raw_output,
      narrator_fell_back: narration.fell_back,
      validation_problems: narration.validation.problems,
    },
  };
}

// ---------------------------------------------------------------------------

function clarifyTurn(
  world: World,
  intent: Intent,
  parsed: { model: string | null; raw_output: string | null },
  _narrator: Narrator | null,
): TurnResult {
  const asker = world.presentActors()[0] ?? null;
  const line = fallbackLine(world.pkg, 'clarify');
  const text = asker ? `${world.displayName(asker)}: "${line}"` : line;

  const { event } = world.commit([{ kind: 'clock', minutes: 0 }], {
    actor_id: world.playerId,
    actor_type: 'player',
    verb: 'unclear',
    targets: intent.targets,
    visibility: ['*'],
    payload: {
      raw_text: intent.raw,
      confidence: intent.confidence,
      threshold: CLARIFY_THRESHOLD,
      parser_model: parsed.model,
      public_line: text,
    },
  });

  return {
    narration: text,
    outcome: 'clarify',
    events: [event],
    director: null,
    ui: world.projectUi(),
    telemetry: world.projectTelemetry(),
    ended: null,
    adjudication: {
      event_id: event.id,
      raw_text: intent.raw,
      intent,
      parser_model: parsed.model,
      parser_output: parsed.raw_output,
      stage2_result: 'permitted',
      stage2_reason: null,
      stage3_rule_path: null,
      seeded_draw: null,
      outcome: 'clarify',
      director_participated: false,
      narrator_model: null,
      narrator_output: null,
      narrator_fell_back: true,
      validation_problems: [],
    },
  };
}

function terminalTurn(world: World, rawText: string): TurnResult {
  const line = fallbackLine(world.pkg, 'narration.ended');
  return {
    narration: line,
    outcome: 'blocked',
    events: [],
    director: null,
    ui: world.projectUi(),
    telemetry: world.projectTelemetry(),
    ended: world.ended,
    adjudication: {
      event_id: '',
      raw_text: rawText,
      intent: { verb: 'other', targets: [], method: null, instrument: null, resources: [], goal: null, secrecy: 'open', addressee: null, confidence: 0, raw: rawText },
      parser_model: null,
      parser_output: null,
      stage2_result: 'impossible',
      stage2_reason: 'the run is over',
      stage3_rule_path: null,
      seeded_draw: null,
      outcome: 'blocked',
      director_participated: false,
      narrator_model: null,
      narrator_output: null,
      narrator_fell_back: true,
      validation_problems: [],
    },
  };
}

/** The run ends on the clock, on an irreversible commitment, or on an authored hard fail
 *  reached through ACCUMULATED state — never through a single unlucky draw (L9). */
export function checkEnd(world: World, intent: Intent | null, _cap: CapabilityVerdict | null): EndState | null {
  if (world.ended) return world.ended;

  if (outOfTime(world)) {
    world.ended = { reason: 'clock', label: world.pkg.world.ending_out_of_time, at_world_time: world.clock };
  } else if (intent && world.pkg.verbs.find((v) => v.id === intent.verb)?.commitment) {
    const verb = world.pkg.verbs.find((v) => v.id === intent.verb)!;
    world.ended = { reason: 'commitment', label: verb.commitment_line ?? verb.label, at_world_time: world.clock };
  } else if (world.store.read().flags['_hard_fail'] === true) {
    world.ended = { reason: 'hard_fail', label: String(world.store.read().flags['_hard_fail_label'] ?? 'it came apart'), at_world_time: world.clock };
  }

  if (world.ended) {
    world.spine.append(
      {
        actor_id: 'system',
        actor_type: 'system',
        verb: 'run_ended',
        targets: [],
        visibility: ['*'],
        payload: { reason: world.ended.reason, label: world.ended.label, public_line: world.ended.label },
      },
      world.clock,
    );
  }
  return world.ended;
}
