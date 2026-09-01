// ITEM 10 — the Consequence Engine. Applies resolved effects and generates everything
// downstream.
//
// Every write routes through the invariant engine (L3). Information propagation is
// decided EXPLICITLY here — who saw, who was told, who will hear later, with what
// fidelity — because nothing enters a knowledge state implicitly (item 11). Causal links
// are written on every generated event (L7), which is what makes the debrief a query
// rather than an inference.
//
// It never invents a consequence beyond the resolved effects.

import { resolveDisclosureValue } from './resolver';
import type { CapabilityVerdict, Effect, Intent, Json, Resolution, WorldEvent } from './types';
import type { World } from './world';

export interface ConsequenceResult {
  action_event: WorldEvent;
  derived_events: WorldEvent[];
  applied: boolean;
  violations: string[];
}

export function applyResolution(
  world: World,
  args: {
    intent: Intent;
    capability: CapabilityVerdict;
    resolution: Resolution;
    parse: { model: string | null; raw_output: string | null };
    caused_by?: string[];
  },
): ConsequenceResult {
  const { intent, capability, resolution } = args;
  const target = intent.targets[0] ?? null;
  const witnesses = world.presentActors().filter((a) => a !== target);

  // --- information effects: the player's own learning ----------------------
  const knowledgeEffects: Effect[] = [];
  const disclosures: {
    fact: string;
    to: string;
    from: string;
    status: string;
    value: string | null;
    fidelity: number;
    distortion: string | null;
    via: string;
  }[] = [];

  for (const r of resolution.reveals) {
    const path = world.pkg.discovery_paths.find((p) => p.id === r.via);
    const d = path?.disclosure;
    // The source is the PERSON the path routes through, or nobody. Whoever the player
    // happened to be addressing is not automatically the one who told them: an override
    // that fires on `press` against anybody in the room, revealing a fact worked out from
    // two others, named the person being pressed as the source — and L6 rejected the write
    // because they did not know it. Silently. The triumphant paragraph printed anyway and
    // the deduction at the centre of that world simply did not happen unless the person
    // being pressed happened to be the one who knew.
    const routed = path?.via_target?.find((id) => intent.targets.includes(id)) ?? null;
    const source = d?.source ?? (routed && world.character(routed) ? routed : 'observation');
    const value = path ? resolveDisclosureValue(world, path, source) : (world.truth.read(r.fact) ?? null);
    const fidelity = d?.fidelity ?? (r.status === 'observed' ? 1 : 0.8);
    const distortion = d?.distortion ?? null;

    knowledgeEffects.push({
      kind: 'knowledge',
      actor: r.to,
      fact: r.fact,
      status: r.status,
      value,
      source: source === 'observation' ? 'observation' : source,
      fidelity,
      distortion,
      confidence: d?.confidence ?? (r.status === 'observed' ? 0.9 : 0.6),
    });
    disclosures.push({ fact: r.fact, to: r.to, from: source, status: r.status, value, fidelity, distortion, via: r.via });

    // --- propagation: an open exchange in a small room is overheard ---------
    if (intent.secrecy === 'open') {
      for (const w of witnesses) {
        if (w === r.to) continue;
        knowledgeEffects.push({
          kind: 'knowledge',
          actor: w,
          fact: r.fact,
          status: 'told',
          value,
          source: source === 'observation' ? 'observation' : source,
          fidelity: Math.max(0.4, fidelity - 0.2),
          distortion: 'overheard',
          confidence: 0.5,
        });
      }
    }
  }

  const effects = [...resolution.effects, ...knowledgeEffects];

  // --- the atomic write: one event, one effect set, all or none ------------
  const { event, result } = world.commit(effects, {
    actor_id: world.playerId,
    actor_type: 'player',
    verb: intent.verb,
    targets: intent.targets,
    visibility: intent.secrecy === 'covert' && target ? [world.playerId, target] : ['*'],
    causality: { caused_by: args.caused_by ?? [] },
    payload: {
      raw_text: intent.raw,
      intent: intentPayload(intent),
      parser_model: args.parse.model,
      parser_output: args.parse.raw_output,
      capability_result: capability.result,
      capability_reason: capability.reason,
      capability_checks: capability.checks.map((c) => `${c.check}:${c.passed ? 'ok' : 'no'}`),
      outcome: resolution.outcome,
      rule_path: resolution.rule_path,
      draw: resolution.draw,
      capability_score: resolution.capability_score,
      opposition_score: resolution.opposition_score,
      uncertainty: resolution.uncertainty,
      minutes: capability.minutes,
      public_line: resolution.summary,
    },
  });

  const derived: WorldEvent[] = [];
  if (result.ok) {
    world.counters.turns += 1;
    world.counters.outcomes[resolution.outcome] += 1;
    if (disclosures.length) world.counters.last_reveal_turn = world.counters.turns;

    // --- one explicit disclosure event per fact learned (brief gap-5 fix) ---
    for (const d of disclosures) {
      derived.push(
        world.spine.append(
          {
            actor_id: d.from,
            actor_type: d.from === 'observation' ? 'world_process' : 'character',
            verb: 'fact_disclosed',
            targets: [d.to, d.fact],
            visibility: intent.secrecy === 'covert' ? [world.playerId, d.from] : ['*'],
            causality: { caused_by: [event.id], revealed_by: [event.id] },
            payload: {
              fact: d.fact,
              status: d.status,
              value: d.value,
              fidelity: d.fidelity,
              distortion: d.distortion,
              path: d.via,
              public_line: `${world.displayName(d.from)} → ${world.displayName(d.to)}: ${world.renderFact(d.fact, d.value)}`,
            },
          },
          world.clock,
        ),
      );
    }

    // --- who was in the room when it happened ------------------------------
    if (witnesses.length && intent.secrecy === 'open') {
      derived.push(
        world.spine.append(
          {
            actor_id: 'world',
            actor_type: 'world_process',
            verb: 'witnessed',
            targets: witnesses,
            visibility: ['*'],
            causality: { caused_by: [event.id] },
            payload: { witnesses: witnesses as unknown as Json, public_line: `${witnesses.map((w) => world.displayName(w)).join(', ')} saw it.` },
          },
          world.clock,
        ),
      );
    }
  } else {
    world.counters.blocked += 1;
  }

  return {
    action_event: event,
    derived_events: derived,
    applied: result.ok,
    violations: result.violations.map((v) => `${v.invariant}: ${v.message}`),
  };
}

/** An intent BLOCKED at item 8 is still an act: it happened, it cost time, and the
 *  refusal is voiced in world (L10). It is recorded so the debrief can show what the
 *  player tried, not only what the world allowed. */
export function applyBlocked(
  world: World,
  args: { intent: Intent; capability: CapabilityVerdict; parse: { model: string | null; raw_output: string | null } },
): ConsequenceResult {
  const { intent, capability } = args;
  const { event, result } = world.commit([{ kind: 'clock', minutes: Math.min(1, capability.minutes) }], {
    actor_id: world.playerId,
    actor_type: 'player',
    verb: 'attempt_blocked',
    targets: intent.targets,
    visibility: ['*'],
    payload: {
      raw_text: intent.raw,
      intent: intentPayload(intent),
      attempted_verb: intent.verb,
      parser_model: args.parse.model,
      capability_result: capability.result,
      reason: capability.reason,
      voiced_by: capability.voiced_by,
      public_line: capability.reason ?? 'Nothing about that works right now.',
    },
  });
  world.counters.blocked += 1;
  return { action_event: event, derived_events: [], applied: result.ok, violations: [] };
}

function intentPayload(i: Intent): Record<string, Json> {
  return {
    verb: i.verb,
    targets: i.targets as unknown as Json,
    goal: i.goal,
    secrecy: i.secrecy,
    addressee: i.addressee,
    confidence: i.confidence,
    resources: i.resources as unknown as Json,
    description: i.description ?? null,
  };
}
