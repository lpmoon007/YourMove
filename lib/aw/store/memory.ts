// The in-memory run store. Not a toy: it is the store the integrity suite runs against,
// and it is what the app uses until a Your Move Supabase project is configured, so the
// game is playable end to end with zero infrastructure.
//
// It is per-process and does not survive a restart. That is the only difference.

import type { RunOutcome } from '../outcome';
import type { WorldSnapshot } from '../persistence';
import type { RunStore, RunSummary, TurnRecord } from './types';

interface Row {
  snapshot: WorldSnapshot;
  created_at: string;
  ended_at: string | null;
  turns: TurnRecord[];
  outcome: RunOutcome | null;
  lenses: Record<string, { version: string; payload: unknown }>;
}

const RUNS = new Map<string, Row>();

export const memoryStore: RunStore = {
  kind: 'memory',

  async create(snapshot) {
    RUNS.set(snapshot.run_id, {
      snapshot,
      created_at: new Date().toISOString(),
      ended_at: null,
      turns: [],
      outcome: null,
      lenses: {},
    });
  },

  async save(snapshot, turn, outcome) {
    const row = RUNS.get(snapshot.run_id);
    if (!row) return this.create(snapshot);
    row.snapshot = snapshot;
    if (turn) row.turns.push(turn);
    if (outcome) row.outcome = outcome;
    if (snapshot.ended && !row.ended_at) row.ended_at = new Date().toISOString();
  },

  async load(runId) {
    return RUNS.get(runId)?.snapshot ?? null;
  },

  async list(limit = 50) {
    return [...RUNS.values()]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
      .map(
        (r): RunSummary => ({
          run_id: r.snapshot.run_id,
          scenario_slug: r.snapshot.scenario_id,
          seed: r.snapshot.seed,
          status: r.snapshot.ended ? 'ended' : 'live',
          created_at: r.created_at,
          ended_at: r.ended_at,
          turns: r.snapshot.counters.turns,
          headline: r.outcome?.headline ?? null,
        }),
      );
  },

  async saveLens(runId, lensKey, lensVersion, payload) {
    const row = RUNS.get(runId);
    if (row) row.lenses[lensKey] = { version: lensVersion, payload };
  },

  async getLens(runId, lensKey) {
    return RUNS.get(runId)?.lenses[lensKey]?.payload ?? null;
  },
};
