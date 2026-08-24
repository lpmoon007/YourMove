import 'server-only';
// The Supabase run store.
//
// Everything writes through the service role, because RLS in the schema is default-deny
// with no policies: a browser can read nothing, and canonical truth in particular is
// unreachable from any client.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { WorldSnapshot } from '../persistence';
import type { Badge } from '../play/badges';
import type { PlayEvidence } from '../play/observe';
import type { RunStore, RunSummary } from './types';
import { YM_SUPABASE_URL, ymServiceRoleKey } from '@/lib/yourmove/env';

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

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    client = createClient(YM_SUPABASE_URL, ymServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const supabaseStore: RunStore = {
  kind: 'supabase',

  async create(snapshot) {
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

  async playerEvidence(playerId) {
    const res = await db()
      .from('aw_play_evidence')
      .select('*')
      .eq('player_id', playerId)
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

  async playerBadges(playerId) {
    const res = await db()
      .from('aw_badge_award')
      .select('*')
      .eq('player_id', playerId)
      .order('earned_at', { ascending: false });
    orThrow('reading badges', res);
    return (res.data ?? []).map(
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

  async playerRunOrder(playerId) {
    const res = await db()
      .from('aw_run')
      .select('id')
      .eq('player_id', playerId)
      .order('created_at', { ascending: true });
    orThrow('reading the run order', res);
    return (res.data ?? []).map((r) => r.id as string);
  },
};

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
