import 'server-only';
// Store selection. Supabase when the Your Move project is configured, memory otherwise.
// The app never branches on this: it asks for a store and gets one.

import { ymSupabaseConfigured } from '@/lib/yourmove/env';
import { memoryStore } from './memory';
import { supabaseStore } from './supabase';
import type { RunStore } from './types';

let cached: RunStore | null = null;

export function runStore(): RunStore {
  if (cached) return cached;
  // supabaseStore builds its client lazily, on first use, so importing it costs nothing
  // and reads no environment until a run is actually persisted.
  cached = ymSupabaseConfigured() ? supabaseStore : memoryStore;
  return cached;
}

export { memoryStore };
export type { RunStore, RunSummary, TurnRecord } from './types';
