// Save, resume, and replay (item 27 / A3). A world is fully described by five separate
// things, and this module is the only place that knows how to write them down and read
// them back: state, knowledge, canonical truth, the seeded stream, and the spine.
//
// Truth is part of the snapshot but is NEVER re-drawn on restore — a resumed run has the
// same answers it had when it started, or it is a different run (L2).

import { KnowledgeTracker } from './knowledge';
import { assertLoadable, versionsFor, type ScenarioPackage } from './package';
import { Rng, type RngSnapshot } from './rng';
import { EventSpine } from './spine';
import { TruthLayer } from './truth';
import type { KnowledgeStore, RunConfig, WorldEvent, WorldState } from './types';
import { World, type EndState, type WorldCounters } from './world';

export interface WorldSnapshot {
  run_id: string;
  seed: string;
  scenario_id: string;
  schema_version: string;
  content_version: string;
  engine_ruleset_version: string;
  config: RunConfig;
  state: WorldState;
  knowledge: KnowledgeStore;
  truth: { values: Record<string, string>; bindings: Record<string, string>; fingerprint: string };
  rng: RngSnapshot;
  counters: WorldCounters;
  ended: EndState | null;
  events: WorldEvent[];
}

export function serializeWorld(w: World): WorldSnapshot {
  return {
    run_id: w.run_id,
    seed: w.seed,
    scenario_id: w.versions.scenario_id,
    schema_version: w.versions.schema_version,
    content_version: w.versions.content_version,
    engine_ruleset_version: w.versions.engine_ruleset_version,
    config: w.config,
    state: w.store.serialize(),
    knowledge: w.knowledge.snapshot(),
    truth: {
      values: { ...w.truth.entries() },
      bindings: bindingsOf(w),
      fingerprint: w.truth.fingerprint(),
    },
    rng: w.rng.snapshot(),
    counters: structuredClone(w.counters),
    ended: w.ended,
    events: w.spine.serialize(),
  };
}

export class SnapshotVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotVersionError';
  }
}

/**
 * Restore a world. Refuses a snapshot written under a different content or engine
 * version: a resumed run that silently changes rules mid-flight is not the same run, and
 * item 2 forbids treating the two as comparable.
 */
export function restoreWorld(pkg: ScenarioPackage, snap: WorldSnapshot, now?: () => string): World {
  assertLoadable(pkg);
  const v = versionsFor(pkg);
  if (snap.scenario_id !== v.scenario_id || snap.content_version !== v.content_version)
    throw new SnapshotVersionError(
      `snapshot is ${snap.scenario_id}@${snap.content_version}; this build serves ${v.scenario_id}@${v.content_version}`,
    );
  if (snap.engine_ruleset_version !== v.engine_ruleset_version)
    throw new SnapshotVersionError(
      `snapshot ran under engine ${snap.engine_ruleset_version}; this build is ${v.engine_ruleset_version}`,
    );

  const truth = TruthLayer.restore(snap.truth.values, snap.truth.bindings);
  if (truth.fingerprint() !== snap.truth.fingerprint)
    throw new SnapshotVersionError('canonical truth does not match its stored fingerprint — the snapshot is corrupt');

  const world = new World({
    run_id: snap.run_id,
    pkg,
    versions: v,
    seed: snap.seed,
    config: snap.config,
    rng: Rng.restore(snap.rng),
    state: structuredClone(snap.state),
    knowledge: new KnowledgeTracker(structuredClone(snap.knowledge)),
    truth,
    spine: EventSpine.restore(snap.run_id, snap.events, now),
    counters: structuredClone(snap.counters),
  });
  world.ended = snap.ended;
  return world;
}

/** The truth bindings are private to the layer; recover them from the declared tokens. */
function bindingsOf(w: World): Record<string, string> {
  const out: Record<string, string> = {};
  for (const token of Object.keys(w.pkg.truth_template.bindings)) {
    const v = w.truth.bind(`@${token}`);
    if (v !== undefined) out[`@${token}`] = v;
  }
  return out;
}
