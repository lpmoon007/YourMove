import 'server-only';
// The Supabase run store.
//
// Everything writes through the service role, because RLS in the schema is default-deny
// with no policies: a browser can read nothing, and canonical truth in particular is
// unreachable from any client.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { ENGINE_RULESET_VERSION, type ScenarioPackage } from '../package';
import type { WorldSnapshot } from '../persistence';
import type { Badge } from '../play/badges';
import type { PlayEvidence } from '../play/observe';
import { schemaProblemFrom } from './schema-check';
import type { RunStore, RunSummary, StoredAccount } from './types';
import { ymServiceRoleKey, ymSupabaseUrl } from '@/lib/yourmove/env';

/** Supabase returns errors rather than throwing them. Silence is not acceptable for the
 *  event spine or for canonical truth, so every write is checked. */
function orThrow(
  what: string,
  res: { error: { message: string; code?: string } | null },
  ignoreCodes: string[] = [],
): void {
  const e = res.error;
  if (!e) return;
  if (e.code && ignoreCodes.includes(e.code)) return;
  throw new Error(`Your Move store: ${what} failed — ${e.message}`);
}

/** The database has not had the accounts migration applied yet. Reading is allowed to
 *  shrug at this — the game is playable without accounts and should not go down for one
 *  — but writing is not: minting a code that goes nowhere is worse than an error. */
function accountsSchemaMissing(error: { code?: string } | null): boolean {
  return error?.code === '42P01' || error?.code === '42703';
}

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    client = createClient(ymSupabaseUrl(), ymServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/**
 * Is this actually a Your Move database?
 *
 * A Vercel project cloned from another app carries that app's generic Supabase variables,
 * and those may point at a live database belonging to something else. Writing runs into
 * somebody else's project is the worst failure this code could have, and it would be
 * silent. So before anything is written, the store looks for a table that only Your Move's
 * own migrations create.
 *
 * Returns null when the database is ours, or a sentence explaining what is wrong.
 */
export async function checkYourMoveSchema(): Promise<string | null> {
  try {
    // A plain select, deliberately. `head: true` would send HEAD, and a HEAD response has
    // no body to carry PostgREST's error in — see lib/aw/store/schema-check.ts.
    const res = await db().from('aw_account').select('id').limit(1);
    return schemaProblemFrom({ status: res.status, error: res.error });
  } catch (err) {
    return `The configured database could not be reached: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export const supabaseStore: RunStore = {
  kind: 'supabase',

  async create(snapshot, pkg) {
    // A run cites a world, and the database enforces that the world exists: aw_run
    // .scenario_id is a foreign key to aw_scenario. Nothing had ever written that row,
    // so the first run to reach a real database would have been rejected — which stayed
    // invisible for as long as the app was quietly running on in-memory storage.
    await registerWorld(pkg);

    const runRow = {
      id: snapshot.run_id,
      scenario_id: snapshot.scenario_id,
      content_version: snapshot.content_version,
      schema_version: snapshot.schema_version,
      engine_ruleset_version: snapshot.engine_ruleset_version,
      seed: snapshot.seed,
      status: 'live',
      config: snapshot.config,
      snapshot,
    };
    orThrow('creating the run', await db().from('aw_run').upsert(runRow, { onConflict: 'id' }));

    // Canonical truth is written exactly once, at world creation, and the database
    // refuses any later write with a trigger. A duplicate key here means this run already
    // has its answers, which is correct rather than a failure.
    const truthRow = {
      run_id: snapshot.run_id,
      values: snapshot.truth.values,
      bindings: snapshot.truth.bindings,
      fingerprint: snapshot.truth.fingerprint,
    };
    orThrow('writing canonical truth', await db().from('aw_run_truth').insert(truthRow), ['23505']);

    await writeEvents(snapshot);
    await writeKnowledge(snapshot);
  },

  async save(snapshot, turn, outcome) {
    orThrow(
      'saving the run snapshot',
      await db()
        .from('aw_run')
        .update({
          snapshot,
          status: snapshot.ended ? 'ended' : 'live',
          ended_at: snapshot.ended ? new Date().toISOString() : null,
          end_reason: snapshot.ended?.reason ?? null,
        })
        .eq('id', snapshot.run_id),
    );

    await writeEvents(snapshot);
    await writeKnowledge(snapshot);

    if (turn) {
      const a = turn.adjudication;
      const row = {
        run_id: snapshot.run_id,
        event_id: a.event_id || `${snapshot.run_id}:t${snapshot.counters.turns}`,
        raw_text: a.raw_text,
        intent: a.intent,
        parser_model: a.parser_model,
        parser_output: a.parser_output,
        stage2_result: a.stage2_result,
        stage2_reason: a.stage2_reason,
        stage3_rule_path: a.stage3_rule_path,
        seeded_draw: a.seeded_draw,
        outcome: a.outcome,
        director_participated: a.director_participated,
        narrator_model: a.narrator_model,
        narrator_output: a.narrator_output,
        narrator_fell_back: a.narrator_fell_back,
        validation_problems: a.validation_problems,
        narration: turn.narration,
      };
      orThrow(
        'writing adjudication provenance',
        await db().from('aw_adjudication').upsert(row, { onConflict: 'run_id,event_id' }),
      );
    }

    if (outcome) {
      const row = {
        run_id: snapshot.run_id,
        axes: outcome.axes,
        headline: outcome.headline,
        reason: outcome.reason,
        world_time: outcome.world_time,
      };
      orThrow('writing the outcome', await db().from('aw_outcome').upsert(row, { onConflict: 'run_id' }));
    }
  },

  async load(runId) {
    const res = await db().from('aw_run').select('snapshot').eq('id', runId).maybeSingle();
    orThrow('loading the run', res);
    return (res.data?.snapshot as WorldSnapshot | undefined) ?? null;
  },

  async list(limit = 50) {
    const res = await db()
      .from('aw_run')
      .select('id, scenario_id, seed, status, created_at, ended_at, snapshot, aw_outcome(headline)')
      .order('created_at', { ascending: false })
      .limit(limit);
    orThrow('listing runs', res);

    return (res.data ?? []).map((r): RunSummary => {
      const snap = r.snapshot as WorldSnapshot | null;
      const outcome = r.aw_outcome as { headline?: string } | { headline?: string }[] | null;
      const headline = Array.isArray(outcome) ? (outcome[0]?.headline ?? null) : (outcome?.headline ?? null);
      return {
        run_id: r.id as string,
        scenario_slug: r.scenario_id as string,
        seed: r.seed as string,
        status: (r.status as 'live' | 'ended') ?? 'live',
        created_at: r.created_at as string,
        ended_at: (r.ended_at as string | null) ?? null,
        turns: snap?.counters.turns ?? 0,
        headline,
      };
    });
  },

  async saveLens(runId, lensKey, lensVersion, payload) {
    orThrow(
      'storing a lens read',
      await db()
        .from('aw_lens_read')
        .upsert(
          { run_id: runId, lens_key: lensKey, lens_version: lensVersion, payload },
          { onConflict: 'run_id,lens_key,lens_version' },
        ),
    );
  },

  async getLens(runId, lensKey) {
    const res = await db()
      .from('aw_lens_read')
      .select('payload')
      .eq('run_id', runId)
      .eq('lens_key', lensKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    orThrow('reading a lens', res);
    return res.data?.payload ?? null;
  },

  // --- How You Play. Written after a run ends; never read during one. ---------

  async claimRun(runId, playerId) {
    orThrow(
      'registering the player',
      await db()
        .from('aw_player')
        .upsert({ id: playerId, last_seen_at: new Date().toISOString() }, { onConflict: 'id' }),
    );
    orThrow('attaching the run to a player', await db().from('aw_run').update({ player_id: playerId }).eq('id', runId));
  },

  async savePlayEvidence(playerId, evidence) {
    if (!evidence.length) return;
    const rows = evidence.map((e) => ({
      player_id: playerId,
      run_id: e.run_id,
      taxonomy: e.taxonomy,
      dimension: e.dimension,
      direction: e.direction,
      strength: e.strength,
      confidence: e.confidence,
      opportunity_id: e.opportunity_id,
      world_id: e.world_id,
      scenario_id: e.scenario_id,
      at_world_time: e.at_world_time,
      context: e.context,
      quote: e.quote,
    }));
    orThrow(
      'storing play evidence',
      await db().from('aw_play_evidence').upsert(rows, { onConflict: 'run_id,opportunity_id,dimension' }),
    );
  },

  async saveBadges(playerId, badges) {
    if (!badges.length) return;
    const rows = badges.map((b) => ({
      player_id: playerId,
      badge_id: b.id,
      run_id: b.run_id,
      name: b.name,
      earned_for: b.earned_for,
      category: b.category,
      rarity: b.rarity,
      secret: Boolean(b.secret),
      world_id: b.world_id,
    }));
    // A badge is earned once. A second run that qualifies does not overwrite the first.
    orThrow(
      'awarding badges',
      await db().from('aw_badge_award').upsert(rows, { onConflict: 'player_id,badge_id', ignoreDuplicates: true }),
    );
  },

  async playerEvidence(playerIds) {
    if (!playerIds.length) return [];
    const res = await db()
      .from('aw_play_evidence')
      .select('*')
      .in('player_id', playerIds)
      .order('created_at', { ascending: true });
    orThrow('reading play evidence', res);
    return (res.data ?? []).map(
      (r): PlayEvidence => ({
        dimension: r.dimension as string,
        direction: r.direction as number,
        strength: r.strength as number,
        confidence: r.confidence as number,
        opportunity_id: r.opportunity_id as string,
        run_id: r.run_id as string,
        world_id: r.world_id as string,
        scenario_id: r.scenario_id as string,
        at_world_time: r.at_world_time as number,
        context: r.context as string,
        quote: (r.quote as string | null) ?? null,
        taxonomy: r.taxonomy as string,
      }),
    );
  },

  async playerBadges(playerIds) {
    if (!playerIds.length) return [];
    const res = await db()
      .from('aw_badge_award')
      .select('*')
      .in('player_id', playerIds)
      .order('earned_at', { ascending: true });
    orThrow('reading badges', res);
    // A badge is earned once per person, not once per device: two devices on one account
    // that both qualified show the earlier award, not two copies of it.
    const seen = new Set<string>();
    return (res.data ?? [])
      .filter((r) => {
        const id = r.badge_id as string;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map(
      (r): Badge => ({
        id: r.badge_id as string,
        name: r.name as string,
        earned_for: r.earned_for as string,
        category: r.category as Badge['category'],
        rarity: r.rarity as Badge['rarity'],
        secret: Boolean(r.secret),
        world_id: r.world_id as string,
        run_id: r.run_id as string,
      }),
    );
  },

  async playerRunOrder(playerIds) {
    if (!playerIds.length) return [];
    const res = await db()
      .from('aw_run')
      .select('id')
      .in('player_id', playerIds)
      .order('created_at', { ascending: true });
    orThrow('reading the run order', res);
    return (res.data ?? []).map((r) => r.id as string);
  },

  // --- lightweight accounts --------------------------------------------------
  //
  // No email, no password, nothing personal. The row holds a display name the player
  // chose and the scrypt hash of the secret half of their play code, and that is all.

  async createAccount(input) {
    orThrow(
      'creating the account',
      await db().from('aw_account').insert({
        id: input.account_id,
        display_name: input.display_name,
        secret_hash: input.secret_hash,
      }),
    );
  },

  async accountById(accountId) {
    const res = await db()
      .from('aw_account')
      .select('id, display_name, secret_hash, created_at')
      .eq('id', accountId)
      .maybeSingle();
    if (accountsSchemaMissing(res.error)) return null;
    orThrow('looking up the account', res);
    return res.data ? (res.data as StoredAccount) : null;
  },

  async attachPlayer(playerId, accountId) {
    orThrow(
      'registering the device',
      await db()
        .from('aw_player')
        .upsert({ id: playerId, last_seen_at: new Date().toISOString() }, { onConflict: 'id' }),
    );
    orThrow(
      'attaching the device to the account',
      await db().from('aw_player').update({ account_id: accountId }).eq('id', playerId),
    );
    orThrow(
      'touching the account',
      await db().from('aw_account').update({ last_seen_at: new Date().toISOString() }).eq('id', accountId),
    );
  },

  async accountForPlayer(playerId) {
    const link = await db().from('aw_player').select('account_id').eq('id', playerId).maybeSingle();
    if (accountsSchemaMissing(link.error)) return null;
    orThrow('reading the device link', link);
    const accountId = link.data?.account_id as string | null | undefined;
    if (!accountId) return null;
    return this.accountById(accountId);
  },

  async devicesForAccount(accountId) {
    const res = await db().from('aw_player').select('id').eq('account_id', accountId);
    if (accountsSchemaMissing(res.error)) return [];
    orThrow('listing the devices on the account', res);
    return (res.data ?? []).map((r) => r.id as string);
  },

  async setDisplayName(accountId, name) {
    orThrow(
      'saving the display name',
      await db().from('aw_account').update({ display_name: name }).eq('id', accountId),
    );
  },
};

/**
 * Make sure the world this run belongs to exists, and that the exact package being played
 * is on the record beside it.
 *
 * The version row is the point: a run names a content_version, and without the package
 * behind it that citation is a promise nobody can check. Published versions are immutable
 * in the database, so this inserts and ignores a duplicate — it never updates one.
 */
async function registerWorld(pkg: ScenarioPackage): Promise<void> {
  orThrow(
    'registering the world',
    await db().from('aw_scenario').upsert(
      {
        id: pkg.id,
        slug: pkg.slug,
        title: pkg.title,
        tagline: pkg.tagline,
        format: pkg.format,
        status: 'published',
      },
      { onConflict: 'id', ignoreDuplicates: true },
    ),
  );
  orThrow(
    'recording the version of the world being played',
    await db().from('aw_scenario_version').insert({
      scenario_id: pkg.id,
      content_version: pkg.content_version,
      schema_version: pkg.schema_version,
      engine_ruleset_version: ENGINE_RULESET_VERSION,
      payload: pkg,
    }),
    // Already published. That is the normal case on every run after the first.
    ['23505'],
  );
}

/** The spine is append-only in the database, so only what is new is inserted. There is no
 *  update path here, and there is no update path in Postgres either. */
async function writeEvents(snapshot: WorldSnapshot): Promise<void> {
  const head = await db()
    .from('aw_event')
    .select('seq')
    .eq('run_id', snapshot.run_id)
    .order('seq', { ascending: false })
    .limit(1)
    .maybeSingle();
  orThrow('reading the spine head', head);

  const highest = (head.data?.seq as number | undefined) ?? 0;
  const fresh = snapshot.events.filter((e) => e.seq > highest);
  if (!fresh.length) return;

  const rows = fresh.map((e) => ({
    run_id: e.run_id,
    seq: e.seq,
    id: e.id,
    world_time: e.world_time,
    wall_time: e.wall_time,
    actor_id: e.actor_id,
    actor_type: e.actor_type,
    verb: e.verb,
    targets: e.targets,
    payload: e.payload,
    visibility: e.visibility,
    caused_by: e.causality.caused_by,
    enabled_by: e.causality.enabled_by,
    blocked_by: e.causality.blocked_by,
    amplified_by: e.causality.amplified_by,
    revealed_by: e.causality.revealed_by,
  }));
  orThrow('appending to the event spine', await db().from('aw_event').insert(rows));
}

async function writeKnowledge(snapshot: WorldSnapshot): Promise<void> {
  const rows = Object.entries(snapshot.knowledge).flatMap(([actor, facts]) =>
    Object.entries(facts).map(([fact, r]) => ({
      run_id: snapshot.run_id,
      actor_id: actor,
      fact_id: fact,
      status: r.status,
      value: r.value,
      source_actor: r.source_actor,
      acquired_at: r.acquired_at,
      fidelity: r.fidelity,
      distortion: r.distortion,
      confidence: r.confidence,
      contradicted: r.contradicted,
      provenance: r.provenance,
      updated_at: new Date().toISOString(),
    })),
  );
  if (!rows.length) return;
  orThrow(
    'writing knowledge state',
    await db().from('aw_knowledge_state').upsert(rows, { onConflict: 'run_id,actor_id,fact_id' }),
  );
}
