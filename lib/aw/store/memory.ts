// The in-memory run store. Not a toy: it is the store the integrity suite runs against,
// and it is what the app uses until a Your Move Supabase project is configured, so the
// game is playable end to end with zero infrastructure.
//
// It is per-process and does not survive a restart. That is the only difference.

import type { RunOutcome } from '../outcome';
import type { WorldSnapshot } from '../persistence';
import type { Badge } from '../play/badges';
import type { PlayEvidence } from '../play/observe';
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
const PLAYERS = new Map<string, { runs: string[]; evidence: PlayEvidence[]; badges: Map<string, Badge> }>();
const player = (id: string) => {
  let p = PLAYERS.get(id);
  if (!p) { p = { runs: [], evidence: [], badges: new Map() }; PLAYERS.set(id, p); }
  return p;
};

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

  async claimRun(runId, playerId) {
    const p = player(playerId);
    if (!p.runs.includes(runId)) p.runs.push(runId);
  },

  async savePlayEvidence(playerId, evidence) {
    const p = player(playerId);
    const seen = new Set(p.evidence.map((e) => `${e.run_id}|${e.opportunity_id}|${e.dimension}`));
    for (const e of evidence) {
      const k = `${e.run_id}|${e.opportunity_id}|${e.dimension}`;
      if (!seen.has(k)) { p.evidence.push(e); seen.add(k); }
    }
  },

  async saveBadges(playerId, badges) {
    const p = player(playerId);
    for (const b of badges) if (!p.badges.has(b.id)) p.badges.set(b.id, b);
  },

  async playerEvidence(playerId) {
    return [...player(playerId).evidence];
  },

  async playerBadges(playerId) {
    return [...player(playerId).badges.values()];
  },

  async playerRunOrder(playerId) {
    return [...player(playerId).runs];
  },
};
