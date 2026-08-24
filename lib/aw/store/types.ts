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
  /** Evidence for these devices, oldest run first. One device when playing anonymously;
   *  every device on the account once signed in. */
  playerEvidence(playerIds: string[]): Promise<PlayEvidence[]>;
  playerBadges(playerIds: string[]): Promise<Badge[]>;
  /** Run ids across these devices, oldest first — the recency ordering the profile needs. */
  playerRunOrder(playerIds: string[]): Promise<string[]>;

  // --- lightweight accounts: no email, no password, one play code ------------
  createAccount(input: { account_id: string; display_name: string | null; secret_hash: string }): Promise<void>;
  accountById(accountId: string): Promise<StoredAccount | null>;
  /** Attach a device to an account. This is also what merges anonymous play in. */
  attachPlayer(playerId: string, accountId: string): Promise<void>;
  accountForPlayer(playerId: string): Promise<StoredAccount | null>;
  /** Every device on an account, so one profile can be read across all of them. */
  devicesForAccount(accountId: string): Promise<string[]>;
  setDisplayName(accountId: string, name: string): Promise<void>;
}

export interface StoredAccount {
  id: string;
  display_name: string | null;
  secret_hash: string;
  created_at: string;
}
