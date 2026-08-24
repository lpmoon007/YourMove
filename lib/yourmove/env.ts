// Environment access. Server-only secrets are read lazily, inside server-only modules,
// so they can never reach the client bundle.

/** Public — safe in the browser bundle. */
export const YM_SUPABASE_URL =
  process.env.NEXT_PUBLIC_YOURMOVE_SUPABASE_URL ?? process.env.YOURMOVE_SUPABASE_URL ?? '';
export const YM_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_YOURMOVE_SUPABASE_ANON_KEY ?? process.env.YOURMOVE_SUPABASE_ANON_KEY ?? '';

/** Server-only. The run store writes through it; RLS is default-deny for everyone else. */
export function ymServiceRoleKey(): string {
  const k = process.env.YOURMOVE_SUPABASE_SERVICE_ROLE ?? '';
  if (!k) throw new Error('YOURMOVE_SUPABASE_SERVICE_ROLE is not set — the Your Move run store writes through it.');
  return k;
}

/** True when a Your Move Supabase project is configured. Until then the app runs on the
 *  in-memory store, which is the correct behavior for local play and for CI. */
export function ymSupabaseConfigured(): boolean {
  return Boolean(YM_SUPABASE_URL && process.env.YOURMOVE_SUPABASE_SERVICE_ROLE);
}

export function anthropicKey(): string | null {
  return process.env.ANTHROPIC_API_KEY || null;
}

/** Stage 1 runs on every turn and is latency-bound; stage 5 is what the player reads.
 *  Tiered routing per the convergence brief (9.5). */
export const YM_INTENT_MODEL = process.env.YOURMOVE_INTENT_MODEL ?? 'claude-haiku-4-5-20251001';
export const YM_NARRATOR_MODEL = process.env.YOURMOVE_NARRATOR_MODEL ?? 'claude-sonnet-5';

/** Guards the facilitator console — the only surface allowed to ask for the LFS overlay. */
export function ymConsoleSecret(): string {
  const s = process.env.YOURMOVE_CONSOLE_SECRET ?? '';
  if (!s) throw new Error('YOURMOVE_CONSOLE_SECRET is not set — the Your Move console requires it.');
  return s;
}
export function ymConsoleSecretOrNull(): string | null {
  return process.env.YOURMOVE_CONSOLE_SECRET || null;
}
