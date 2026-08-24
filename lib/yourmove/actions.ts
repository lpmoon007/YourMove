'use server';
// Your Move server actions. The whole turn pipeline runs here, on the server, because
// the engine is the authority and the browser is a screen (L1, L4).

import { randomUUID } from 'node:crypto';

import { LAST_JOB } from '@/content/yourmove/last-job';
import {
  causalDebrief,
  buildReveal,
  loadWorld,
  restoreWorld,
  scoreOutcome,
  serializeWorld,
  takeTurn,
  type CausalChain,
  type Reveal,
  type RunOutcome,
  type UiProjection,
  type World,
} from '@/lib/aw';
import { modelNarrator } from '@/lib/aw/model/narrate';
import { modelParser } from '@/lib/aw/model/parse';
import { runStore } from '@/lib/aw/store';
import { buildTranscript, type TranscriptEntry } from '@/lib/yourmove/transcript';

export interface RunView {
  run_id: string;
  title: string;
  tagline: string;
  ui: UiProjection;
  transcript: TranscriptEntry[];
  ended: { reason: string; label: string } | null;
  outcome: RunOutcome | null;
  /** True when a model is wired; false means the deterministic renderer is speaking. */
  live_prose: boolean;
}

export interface DebriefView {
  run_id: string;
  title: string;
  outcome: RunOutcome;
  reveal: Reveal;
  chains: CausalChain[];
  /** Things that happened tonight that the player did not set off. */
  unprompted_events: number;
  seed: string;
}

const PKG = LAST_JOB;

function deps() {
  return { parser: modelParser(), narrator: modelNarrator() };
}

/** Item 3 — a package plus a seed becomes a world. V1A holds the seed fixed per the
 *  build order (seed variation is V1C); the parameter exists so V1C is a config change. */
export async function startRun(seed = 'last-job-001'): Promise<RunView> {
  const runId = `ym_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const world = loadWorld(PKG, { run_id: runId, seed, now: () => new Date().toISOString() });
  await runStore().create(serializeWorld(world));
  return view(world);
}

export async function loadRun(runId: string): Promise<RunView | null> {
  const world = await hydrate(runId);
  return world ? view(world) : null;
}

export async function submitAction(runId: string, text: string): Promise<RunView | { error: string }> {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return { error: 'Type something.' };
  if (trimmed.length > 600) return { error: 'That is a paragraph. Say it shorter.' };

  const world = await hydrate(runId);
  if (!world) return { error: 'That run is gone.' };
  if (world.ended) return view(world);

  const turn = await takeTurn(world, trimmed, deps());
  const outcome = world.ended ? scoreOutcome(world) : null;
  await runStore().save(
    serializeWorld(world),
    { adjudication: turn.adjudication, narration: turn.narration },
    outcome,
  );
  return view(world, outcome);
}

export async function debrief(runId: string): Promise<DebriefView | { error: string }> {
  const world = await hydrate(runId);
  if (!world) return { error: 'That run is gone.' };
  if (!world.ended) return { error: 'The run is still live. The reveal comes after, never during.' };

  const causal = causalDebrief(world);
  return {
    run_id: runId,
    title: PKG.title,
    outcome: scoreOutcome(world),
    reveal: buildReveal(world),
    chains: causal.chains,
    unprompted_events: causal.unprompted_events,
    seed: world.seed,
  };
}

async function hydrate(runId: string): Promise<World | null> {
  const snap = await runStore().load(runId);
  if (!snap) return null;
  return restoreWorld(PKG, snap, () => new Date().toISOString());
}

function view(world: World, outcome: RunOutcome | null = null): RunView {
  return {
    run_id: world.run_id,
    title: PKG.title,
    tagline: PKG.tagline,
    ui: world.projectUi(),
    transcript: buildTranscript(world),
    ended: world.ended ? { reason: world.ended.reason, label: world.ended.label } : null,
    outcome: outcome ?? (world.ended ? scoreOutcome(world) : null),
    live_prose: Boolean(process.env.ANTHROPIC_API_KEY),
  };
}
