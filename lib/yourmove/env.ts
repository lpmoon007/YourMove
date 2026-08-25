// Environment access. Server-only secrets are read lazily, inside server-only modules,
// so they can never reach the client bundle.
//
// Two names are accepted for each Supabase setting: the YOURMOVE_-prefixed one, and the
// generic one a Vercel project cloned from another app already has. The prefix exists
// because a cloned project's generic variables may still point at the OTHER app's
// database, and Your Move writing into it would be the worst kind of quiet failure — so
// the generic names are only ever a fallback, and whichever name wins, the store proves
// the database is a Your Move database before it writes a single row (see
// `assertYourMoveSchema` in lib/aw/store/supabase.ts).

/** Read the first of these variables that is set, and say which one it was. */
function firstOf(names: string[]): { name: string; value: string } | null {
  for (const name of names) {
    const value = process.env[name];
    if (value) return { name, value };
  }
  return null;
}

const URL_NAMES = [
  'NEXT_PUBLIC_YOURMOVE_SUPABASE_URL',
  'YOURMOVE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
];
const SERVICE_ROLE_NAMES = [
  'YOURMOVE_SUPABASE_SERVICE_ROLE',
  'YOURMOVE_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE',
  'SUPABASE_SERVICE_ROLE_KEY',
];

/** Read on use, never captured at import: a value frozen when the module first loaded is
 *  a value that cannot be corrected, and is its own version of this same bug. */
export function ymSupabaseUrl(): string {
  return firstOf(URL_NAMES)?.value ?? '';
}

/** Server-only. The run store writes through it; RLS is default-deny for everyone else. */
export function ymServiceRoleKey(): string {
  const found = firstOf(SERVICE_ROLE_NAMES);
  if (!found)
    throw new Error(
      `No Supabase service-role key is set. The run store writes through it. Set one of: ${SERVICE_ROLE_NAMES.join(', ')}.`,
    );
  return found.value;
}

/** True when a Supabase project is configured. Until then the app runs on the in-memory
 *  store, which is the correct behavior for local play and for CI — and the wrong thing
 *  to do silently in production, which is what `storeDiagnostics` is for. */
export function ymSupabaseConfigured(): boolean {
  return Boolean(firstOf(URL_NAMES) && firstOf(SERVICE_ROLE_NAMES));
}

export interface EnvDiagnostics {
  /** Which variable supplied each setting, or every name that would have worked. */
  url: { found: string | null; accepted: string[] };
  service_role: { found: string | null; accepted: string[] };
  model_key: boolean;
  console_secret: boolean;
}

/**
 * What is configured, by NAME only. No values, no URLs, no key fragments, no project
 * reference — nothing here identifies a database or opens one. This exists because a
 * missing variable used to present as a game that worked perfectly and lost everything.
 */
export function envDiagnostics(): EnvDiagnostics {
  return {
    url: { found: firstOf(URL_NAMES)?.name ?? null, accepted: URL_NAMES },
    service_role: { found: firstOf(SERVICE_ROLE_NAMES)?.name ?? null, accepted: SERVICE_ROLE_NAMES },
    model_key: Boolean(process.env.ANTHROPIC_API_KEY),
    console_secret: Boolean(process.env.YOURMOVE_CONSOLE_SECRET),
  };
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
