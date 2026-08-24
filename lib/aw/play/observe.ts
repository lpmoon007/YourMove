// HOW YOU PLAY — the observer.
//
// THE ARCHITECTURAL RULE: the simulation emits events; this reads them afterward. Nothing
// in the runtime knows what "diplomatic" means, no resolution consults a play dimension,
// and no dimension can change an outcome. The pipeline is one-way:
//
//     simulation runtime → event spine → observer → profile
//
// Evidence comes from two places. AUTHORED signals live on the scenario, because only the
// world knows that pressing someone is force and paying them is diplomacy. GENERIC signals
// are derived here from things true of every world: secrecy, how long you waited before
// committing, how much you knew when you did, how much of the room you talked to, and how
// much of what you held you were willing to spend.

import type { ScenarioPackage } from '../package';
import type { PlaySignal, WorldEvent } from '../types';
import type { World } from '../world';
import { PLAY_TAXONOMY } from './dimensions';

export interface PlayEvidence {
  dimension: string;
  /** −1 = strongly the left label, +1 = strongly the right label. */
  direction: number;
  /** How much this single moment says. 0..1 */
  strength: number;
  /** The event this was read from. One opportunity, one id. */
  opportunity_id: string;
  run_id: string;
  world_id: string;
  scenario_id: string;
  at_world_time: number;
  /** Why the world read it that way, in the player's language. */
  context: string;
  /** What the player actually typed, when there was something. */
  quote: string | null;
  /** How sure this single reading is. Authored signals are surer than derived ones. */
  confidence: number;
  taxonomy: string;
}

// PlaySignal is declared in ../types with the other authored content types, so that no
// engine module ever imports this directory. Re-exported for callers of lib/aw/play.
export type { PlaySignal };

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/**
 * Read a run. Safe to call at any time — it only ever reads — but meant for a finished run.
 */
export function observePlay(world: World): PlayEvidence[] {
  const pkg = world.pkg;
  const out: PlayEvidence[] = [];
  const spine = world.spine.all();
  const playerActs = spine.filter((e) => e.actor_type === 'player' && e.verb !== 'unclear');

  const base = (e: WorldEvent) => ({
    opportunity_id: e.id,
    run_id: world.run_id,
    world_id: pkg.slug,
    scenario_id: pkg.id,
    at_world_time: e.world_time,
    quote: (e.payload.raw_text as string) ?? null,
    taxonomy: PLAY_TAXONOMY,
  });

  const enabled = new Set(pkg.play_dimensions ?? []);
  const allowed = (d: string) => enabled.size === 0 || enabled.has(d) || (pkg.world_specific_dimensions ?? []).some((x) => x.id === d);
  const push = (e: WorldEvent, ev: Omit<PlayEvidence, keyof ReturnType<typeof base>>) => {
    if (!allowed(ev.dimension)) return;
    if (Math.abs(ev.direction) < 0.05 || ev.strength <= 0) return;
    out.push({ ...base(e), ...ev, direction: clamp(ev.direction) });
  };

  const name = (id: string | undefined) => (id ? world.displayName(id) : 'the room');
  const facts = pkg.facts.filter((f) => pkg.discovery_paths.some((p) => p.fact === f.id));
  const spoken = new Set<string>();
  let learnedByTurn = 0;
  let turnIndex = 0;

  for (const e of playerActs) {
    turnIndex += 1;
    const verbId = String(e.verb);
    const verb = pkg.verbs.find((v) => v.id === verbId);
    const target = e.targets[0];
    const isPerson = Boolean(target && world.character(target));
    const secrecy = String((e.payload.intent as Record<string, unknown> | undefined)?.secrecy ?? 'open');

    // --- authored: the scenario says what its own verbs mean --------------
    for (const sig of verb?.play_signals ?? [])
      push(e, {
        dimension: sig.dimension,
        direction: sig.direction,
        strength: sig.strength,
        context: sig.context ?? `${verb!.label} — ${isPerson ? name(target) : 'in the room'}.`,
        confidence: 0.8,
      });

    // --- authored: a specific beat the designer controls -------------------
    const rulePath = String(e.payload.rule_path ?? '');
    const overrideId = rulePath.startsWith('override:') ? rulePath.split(':')[1] : null;
    for (const sig of pkg.overrides.find((o) => o.id === overrideId)?.play_signals ?? [])
      push(e, {
        dimension: sig.dimension,
        direction: sig.direction,
        strength: sig.strength,
        context: sig.context ?? 'A moment the world was watching for.',
        confidence: 0.85,
      });

    // --- derived: doing it quietly is a choice about what others know ------
    if (secrecy !== 'open')
      push(e, {
        dimension: 'direct_cunning',
        direction: secrecy === 'covert' ? 0.8 : 0.45,
        strength: 0.7,
        context: `You did that ${secrecy === 'covert' ? 'without letting the room see it' : 'quietly, off to one side'}.`,
        confidence: 0.65,
      });

    // --- derived: how much of the room you actually used -------------------
    if (isPerson && !spoken.has(target!)) {
      spoken.add(target!);
      push(e, {
        dimension: 'solo_coalition',
        direction: 0.5,
        strength: 0.55,
        context: `You brought ${name(target)} into it rather than working around them.`,
        confidence: 0.6,
      });
    }
    if (!isPerson && target && world.presentActors().length > 0)
      push(e, {
        dimension: 'solo_coalition',
        direction: -0.3,
        strength: 0.35,
        context: `You went to ${name(target)} yourself with people standing right there.`,
        confidence: 0.55,
      });

    // --- derived: how much you had spent -----------------------------------
    const committed = ((e.payload.intent as { resources?: { amount: number }[] } | undefined)?.resources ?? []).reduce(
      (n, r) => n + (r.amount > 0 ? r.amount : 0),
      0,
    );
    if (committed > 0) {
      const total = Object.values(pkg.world.resources).reduce(
        (n, r) => n + Object.values(r.holdings).reduce((m, v) => m + v, 0),
        0,
      );
      const fraction = total > 0 ? committed / total : 0;
      push(e, {
        dimension: 'preserve_risk',
        direction: Math.min(1, fraction * 3),
        strength: Math.min(1, 0.4 + fraction * 2),
        context: `You put real money on the table to move ${isPerson ? name(target) : 'this'}.`,
        confidence: 0.7,
      });
    }

    // --- derived: the shape of an irreversible commitment ------------------
    if (verb?.commitment) {
      // how long you sat with it
      push(e, {
        dimension: 'speed_deliberation',
        direction: clamp((turnIndex - 4) / 6),
        strength: 0.8,
        context:
          turnIndex <= 3
            ? `You committed on move ${turnIndex}, before the room had finished happening.`
            : `You took ${turnIndex} moves before you committed to anything you could not undo.`,
        confidence: 0.75,
      });
      // how much you knew when you did it
      const known = facts.filter((f) => world.knowledge.hasHeard(world.playerId, f.id)).length;
      const share = facts.length ? known / facts.length : 0;
      push(e, {
        dimension: 'caution_boldness',
        direction: clamp(0.9 - share * 1.8),
        strength: 0.85,
        context: `You committed knowing ${known} of the ${facts.length} things that were findable.`,
        confidence: 0.75,
      });
    }
  }

  // --- derived, once per run: did anything you learned get passed on? ------
  const shared = spine.filter((e) => e.verb === 'fact_disclosed' && e.actor_id === world.playerId).length;
  const last = playerActs[playerActs.length - 1];
  if (last && learnedByTurn >= 0 && spoken.size > 0)
    push(last, {
      dimension: 'control_delegation',
      direction: shared > 0 ? 0.35 : -0.35,
      strength: 0.4,
      context: shared
        ? 'You handed people things you had worked out, rather than holding them.'
        : 'What you worked out, you kept.',
      confidence: 0.5,
    });

  return out;
}

/** The world-specific dimensions a scenario declares, for the profile page to render. */
export function worldDimensions(pkg: ScenarioPackage) {
  return pkg.world_specific_dimensions ?? [];
}
