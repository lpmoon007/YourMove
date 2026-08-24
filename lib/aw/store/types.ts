// The run store contract. The simulation core is pure (state in, deltas out, no I/O), so
// everything that touches a database lives behind this interface. Two implementations
// ship: Supabase (production) and in-memory (local play, CI, and the test harness).

import type { AdjudicationRecord } from '../engine';
import type { RunOutcome } from '../outcome';
import type { WorldSnapshot } from '../persistence';
import type { Badge } from '../play/badges';
import type { PlayEvidence } from '../play/observe';

export interface RunSummary {
  run_id: string;
  scenario_slug: string;
  seed: string;
  status: 'live' | 'ended';
  created_at: string;
  ended_at: string | null;
  turns: number;
  headline: string | null;
}

export interface TurnRecord {
  adjudication: AdjudicationRecord;
  narration: string;
}

export interface RunStore {
  readonly kind: 'supabase' | 'memory';
  create(snapshot: WorldSnapshot): Promise<void>;
  /** Persist the world after a turn: the snapshot, any new spine events, the
   *  adjudication provenance for this turn, and the outcome once the run ends. */
  save(snapshot: WorldSnapshot, turn: TurnRecord | null, outcome: RunOutcome | null): Promise<void>;
  load(runId: string): Promise<WorldSnapshot | null>;
  list(limit?: number): Promise<RunSummary[]>;
  /** Overlay reads (the twelve-measurement lens). Stored apart from run data, because
   *  they are an interpretation of the run, not part of it. */
  saveLens(runId: string, lensKey: string, lensVersion: string, payload: unknown): Promise<void>;
  getLens(runId: string, lensKey: string): Promise<unknown | null>;

  // --- How You Play. Written once, after a run ends; never read by the simulation. ---
  /** Attach a run to the local identifier that played it. */
  claimRun(runId: string, playerId: string): Promise<void>;
  savePlayEvidence(playerId: string, evidence: PlayEvidence[]): Promise<void>;
  saveBadges(playerId: string, badges: Badge[]): Promise<void>;
  /** All evidence for one player, oldest run first. */
  playerEvidence(playerId: string): Promise<PlayEvidence[]>;
  playerBadges(playerId: string): Promise<Badge[]>;
  /** Run ids for this player, oldest first — the recency ordering the profile needs. */
  playerRunOrder(playerId: string): Promise<string[]>;
}
