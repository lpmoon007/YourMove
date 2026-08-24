// The in-memory run store. Not a toy: it is the store the integrity suite runs against,
// and it is what the app uses until a Your Move Supabase project is configured, so the
// game is playable end to end with zero infrastructure.
//
// It is per-process and does not survive a restart. That is the only difference.

import type { RunOutcome } from '../outcome';
import type { WorldSnapshot } from '../persistence';
import type { Badge } from '../play/badges';
import type { PlayEvidence } from '../play/observe';
import type { RunStore, RunSummary, StoredAccount, TurnRecord } from './types';

interface Row {
  snapshot: WorldSnapshot;
  created_at: string;
  ended_at: string | null;
  turns: TurnRecord[];
  outcome: RunOutcome | null;
  lenses: Record<string, { version: string; payload: unknown }>;
}

const RUNS = new Map<string, Row>();
const PLAYERS = new Map<string, { runs: string[]; evidence: PlayEvidence[]; badges: Map<string, Badge>; account: string | null }>();
const ACCOUNTS = new Map<string, StoredAccount>();
const player = (id: string) => {
  let p = PLAYERS.get(id);
  if (!p) { p = { runs: [], evidence: [], badges: new Map(), account: null }; PLAYERS.set(id, p); }
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

  async playerEvidence(playerIds) {
    return playerIds.flatMap((id) => player(id).evidence);
  },

  async playerBadges(playerIds) {
    const seen = new Map<string, Badge>();
    for (const id of playerIds) for (const [k, b] of player(id).badges) if (!seen.has(k)) seen.set(k, b);
    return [...seen.values()];
  },

  async playerRunOrder(playerIds) {
    // Oldest first, across every device on the account — the recency ordering the
    // profile weights by has to be one timeline, not one per device.
    return playerIds
      .flatMap((id) => player(id).runs)
      .sort((a, b) => (RUNS.get(a)?.created_at ?? '').localeCompare(RUNS.get(b)?.created_at ?? ''));
  },

  async createAccount(input) {
    ACCOUNTS.set(input.account_id, {
      id: input.account_id,
      display_name: input.display_name,
      secret_hash: input.secret_hash,
      created_at: new Date().toISOString(),
    });
  },

  async accountById(accountId) {
    return ACCOUNTS.get(accountId) ?? null;
  },

  async attachPlayer(playerId, accountId) {
    player(playerId).account = accountId;
  },

  async accountForPlayer(playerId) {
    const a = player(playerId).account;
    return a ? (ACCOUNTS.get(a) ?? null) : null;
  },

  async devicesForAccount(accountId) {
    return [...PLAYERS.entries()].filter(([, p]) => p.account === accountId).map(([id]) => id);
  },

  async setDisplayName(accountId, name) {
    const a = ACCOUNTS.get(accountId);
    if (a) a.display_name = name;
  },
};
