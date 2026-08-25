import 'server-only';
// Store selection.
//
// Supabase when a Your Move project is configured AND the database proves it is one;
// memory otherwise. The app never branches on this: it asks for a store and gets one.
//
// The important word is "proves". This used to be a name check — if two environment
// variables were set, the Supabase store was used — and when the variable names did not
// match, the app fell back to memory and looked completely healthy while losing every run
// on the next deploy. A silent downgrade is the failure mode this file exists to prevent:
// the game keeps working either way, but the reason is recorded and shown at /setup.

import { ymSupabaseConfigured } from '@/lib/yourmove/env';
import { memoryStore } from './memory';
import { checkYourMoveSchema, supabaseStore } from './supabase';
import type { RunStore } from './types';

let chosen: RunStore | null = null;
let demotedReason: string | null = null;

/** Decided once per process, on the first call that needs a store. */
async function active(): Promise<RunStore> {
  if (chosen) return chosen;
  if (!ymSupabaseConfigured()) {
    demotedReason =
      'No Supabase project is configured, so runs live in this server’s memory and do not survive a deploy.';
    chosen = memoryStore;
    return chosen;
  }
  const problem = await checkYourMoveSchema();
  if (problem) {
    demotedReason = problem;
    console.error(`Your Move: falling back to in-memory storage. ${problem}`);
    chosen = memoryStore;
  } else {
    demotedReason = null;
    chosen = supabaseStore;
  }
  return chosen;
}

export interface StoreStatus {
  kind: 'supabase' | 'memory';
  /** Null when everything is as it should be. */
  reason: string | null;
  durable: boolean;
}

export async function storeStatus(): Promise<StoreStatus> {
  const store = await active();
  return { kind: store.kind, reason: demotedReason, durable: store.kind === 'supabase' };
}

/**
 * The store the app talks to. Synchronous to obtain, because every caller already awaits
 * the method it calls; which store is underneath is resolved on the first of those.
 */
export function runStore(): RunStore {
  return dispatcher;
}

const dispatcher: RunStore = {
  // `kind` is only ever read for display, and before the first call there is nothing to
  // display yet. Anything that needs the truth asks storeStatus().
  get kind() {
    return (chosen ?? memoryStore).kind;
  },
  async create(s) {
    return (await active()).create(s);
  },
  async save(s, t, o) {
    return (await active()).save(s, t, o);
  },
  async load(id) {
    return (await active()).load(id);
  },
  async list(limit) {
    return (await active()).list(limit);
  },
  async saveLens(runId, key, version, payload) {
    return (await active()).saveLens(runId, key, version, payload);
  },
  async getLens(runId, key) {
    return (await active()).getLens(runId, key);
  },
  async claimRun(runId, playerId) {
    return (await active()).claimRun(runId, playerId);
  },
  async savePlayEvidence(playerId, evidence) {
    return (await active()).savePlayEvidence(playerId, evidence);
  },
  async saveBadges(playerId, badges) {
    return (await active()).saveBadges(playerId, badges);
  },
  async playerEvidence(ids) {
    return (await active()).playerEvidence(ids);
  },
  async playerBadges(ids) {
    return (await active()).playerBadges(ids);
  },
  async playerRunOrder(ids) {
    return (await active()).playerRunOrder(ids);
  },
  async createAccount(input) {
    return (await active()).createAccount(input);
  },
  async accountById(id) {
    return (await active()).accountById(id);
  },
  async attachPlayer(playerId, accountId) {
    return (await active()).attachPlayer(playerId, accountId);
  },
  async accountForPlayer(playerId) {
    return (await active()).accountForPlayer(playerId);
  },
  async devicesForAccount(accountId) {
    return (await active()).devicesForAccount(accountId);
  },
  async setDisplayName(accountId, name) {
    return (await active()).setDisplayName(accountId, name);
  },
};

export { memoryStore };
export type { RunStore, RunSummary, TurnRecord } from './types';
