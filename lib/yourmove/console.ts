import 'server-only';
// The facilitator console's data layer — and the ONLY place in the product that is
// allowed to ask for the twelve-measurement leadership overlay.
//
// Your Move is entertainment. The overlay is a separate reading, taken after the fact,
// by someone who has explicitly asked for it. It is not in the player's app, it is not in
// any projection, and it cannot influence a run: by the time it can be computed, the run
// is already written down.

import { timingSafeEqual } from 'node:crypto';

import { worldById } from '@/content/yourmove';
import { restoreWorld, scoreOutcome, type RunOutcome } from '@/lib/aw';
import { applyLfs12, LFS12_LENS_VERSION, type Lfs12Read } from '@/lib/aw/lens/lfs12';
import { runStore, type RunSummary } from '@/lib/aw/store';
import { ymConsoleSecretOrNull } from '@/lib/yourmove/env';

export function consoleAuthorized(key: string | undefined): boolean {
  const secret = ymConsoleSecretOrNull();
  // No secret configured means the console is CLOSED, not open. A missing lock is not
  // an invitation.
  if (!secret || !key) return false;
  const a = Buffer.from(key);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function listRuns(limit = 50): Promise<RunSummary[]> {
  return runStore().list(limit);
}

export interface ConsoleRunDetail {
  run_id: string;
  /** Which world this run was played in. With more than one, the console has to say. */
  world: string;
  world_title: string;
  seed: string;
  content_version: string;
  engine_version: string;
  status: 'live' | 'ended';
  turns: number;
  world_time: number;
  outcome: RunOutcome | null;
  /** Adjudication provenance, one row per player action, newest last. */
  moves: {
    world_time: number;
    typed: string;
    verb: string;
    stage2: string;
    rule_path: string;
    outcome: string;
    draw: number | null;
    director: boolean;
  }[];
  rejections: number;
  director_interventions: number;
  rescues_used: number;
  /** Null unless the console explicitly asked for the overlay on this view. */
  lfs12: Lfs12Read | null;
}

export async function runDetail(runId: string, opts: { lfs12: boolean }): Promise<ConsoleRunDetail | null> {
  const snap = await runStore().load(runId);
  if (!snap) return null;
  // A run is only ever restored against the world it was played in.
  const pkg = worldById(snap.scenario_id);
  if (!pkg) return null;
  const world = restoreWorld(pkg, snap);

  const moves = world.spine
    .all()
    .filter((e) => e.actor_type === 'player')
    .map((e) => ({
      world_time: e.world_time,
      typed: String(e.payload.raw_text ?? ''),
      verb: e.verb,
      stage2: String(e.payload.capability_result ?? '—'),
      rule_path: String(e.payload.rule_path ?? '—'),
      outcome: String(e.payload.outcome ?? e.verb),
      draw: typeof e.payload.draw === 'number' ? (e.payload.draw as number) : null,
      director: false,
    }));

  // The overlay is computed only when asked for, and the read is stored apart from the
  // run so a run's own record never carries an interpretation of it.
  let lfs12: Lfs12Read | null = null;
  if (opts.lfs12) {
    lfs12 = applyLfs12(world, { enabled: true });
    if (lfs12) await runStore().saveLens(runId, 'lfs12', LFS12_LENS_VERSION, lfs12);
  }

  return {
    run_id: runId,
    world: pkg.slug,
    world_title: pkg.title,
    seed: world.seed,
    content_version: world.versions.content_version,
    engine_version: world.versions.engine_ruleset_version,
    status: world.ended ? 'ended' : 'live',
    turns: world.counters.turns,
    world_time: world.clock,
    outcome: world.ended ? scoreOutcome(world) : null,
    moves,
    rejections: world.store.rejections.length,
    director_interventions: world.counters.director_interventions,
    rescues_used: world.counters.rescues_used,
    lfs12,
  };
}
