// ITEM 3 — the Seeded Scenario Loader. Package + seed → a live world.
//
// Everything randomized is derived from the seed alone (L11). Variable ranges resolve,
// facts are assigned to holders, character openness is set, and clues are placed BEFORE
// the first player action — the loader is the last thing in the engine allowed to
// generate anything.
//
// It also refuses to start an unsolvable world: every fact a top-tier outcome requires
// must be reachable through at least two legitimate paths. Unsolvable seeds are rejected
// at load, not discovered mid-run.

import { KnowledgeTracker } from './knowledge';
import { assertLoadable, versionsFor, type ScenarioPackage } from './package';
import { evalPred, type PredContext } from './predicate';
import { Rng } from './rng';
import { EventSpine } from './spine';
import { TruthLayer } from './truth';
import type { KnowledgeStore, RunConfig, WorldState } from './types';
import { World } from './world';

export interface LoadOptions {
  run_id: string;
  seed: string;
  config?: Partial<RunConfig>;
  /** Injected so the core stays pure and replays are reproducible. */
  now?: () => string;
}

export class UnsolvableWorldError extends Error {
  readonly failures: string[];
  constructor(failures: string[]) {
    super(`world is unsolvable and will not start:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
    this.failures = failures;
    this.name = 'UnsolvableWorldError';
  }
}

export function loadWorld(pkg: ScenarioPackage, opts: LoadOptions): World {
  assertLoadable(pkg); // item 2: refuse to load a package that fails the schema

  const rng = new Rng(opts.seed);
  const truth = TruthLayer.draw(pkg.truth_template, rng);

  // --- initial state -------------------------------------------------------
  const state: WorldState = {
    clock: 0,
    flags: { ...pkg.world.flags },
    positions: {
      [pkg.world.player.id]: pkg.world.player.start_location,
      ...Object.fromEntries(pkg.cast.map((c) => [c.id, c.start_location])),
      ...Object.fromEntries(pkg.entities.map((e) => [e.id, e.location])),
    },
    objects: Object.fromEntries(pkg.entities.map((e) => [e.id, e.initial_state])),
    destroyed: [],
    alive: Object.fromEntries(pkg.cast.map((c) => [c.id, true])),
    resources: Object.fromEntries(
      Object.entries(pkg.world.resources).map(([id, r]) => [id, { ...r.holdings }]),
    ),
    timers: {},
    dispositions: Object.fromEntries(pkg.cast.map((c) => [c.id, { ...c.starting_disposition }])),
  };

  // --- information topology: who holds what, before the first action --------
  const knowledge = new KnowledgeTracker();
  const bind = (id: string): string => (truth.isBinding(id) ? (truth.bind(id) ?? id) : id);

  for (const c of pkg.cast)
    for (const factId of c.knows)
      knowledge.seed(c.id, factId, {
        status: 'observed',
        value: truth.read(factId) ?? null,
        source_actor: null,
        acquired_at: 0,
        confidence: 0.95,
      });

  const preCtx = (kstore: KnowledgeStore): PredContext => ({
    state,
    knowledge: kstore,
    truth: truth.entries(),
    turns: 0,
    fired: new Set<string>(),
    pressure: 0,
    playerLocation: pkg.world.player.start_location,
  });

  for (const h of pkg.holds) {
    if (h.when && !evalPred(h.when, preCtx(knowledge.snapshot()))) continue;
    const actor = bind(h.actor);
    const value = h.value === '@canonical' ? (truth.read(h.fact) ?? null) : bind(h.value);
    knowledge.seed(actor, h.fact, {
      status: h.status,
      value,
      source_actor: null,
      acquired_at: 0,
      confidence: h.confidence ?? (h.status === 'believed_false' ? 0.85 : 0.9),
    });
  }

  // --- solvability (item 3) -------------------------------------------------
  const failures = checkSolvable(pkg, knowledge.snapshot(), preCtx(knowledge.snapshot()), pkg.world.player.id);
  if (failures.length) throw new UnsolvableWorldError(failures);

  const config: RunConfig = { difficulty: 'standard', lfs12_overlay: false, ...(opts.config ?? {}) };
  const spine = new EventSpine(opts.run_id, opts.now);

  const world = new World({
    run_id: opts.run_id,
    pkg,
    versions: versionsFor(pkg),
    seed: opts.seed,
    config,
    rng,
    state,
    knowledge,
    truth,
    spine,
  });

  // The world's first event: it began. Everything downstream can cite it.
  world.spine.append(
    {
      actor_id: 'system',
      actor_type: 'system',
      verb: 'world_created',
      targets: [pkg.id],
      payload: {
        seed: opts.seed,
        scenario_id: pkg.id,
        content_version: pkg.content_version,
        schema_version: pkg.schema_version,
        engine_ruleset_version: world.versions.engine_ruleset_version,
        truth_fingerprint: truth.fingerprint(),
        public_line: pkg.world.cold_open,
      },
      visibility: ['*'],
    },
    0,
  );

  return world;
}

/**
 * Every fact required for a top-tier outcome must be reachable through at least two
 * legitimate paths. A path is legitimate here when its gate can actually be opened at
 * load: a knowledge gate needs a holder who holds it; an object gate needs an object
 * that exists and is not already destroyed.
 */
export function checkSolvable(
  pkg: ScenarioPackage,
  knowledge: KnowledgeStore,
  ctx: PredContext,
  playerId: string,
): string[] {
  const failures: string[] = [];
  const holdersOf = (factId: string) =>
    Object.entries(knowledge)
      .filter(([, facts]) => facts[factId] && facts[factId]!.status !== 'unknown')
      .map(([actor]) => actor);

  // A gate on a fact the PLAYER must already hold is satisfiable when that fact is
  // itself reachable — reachability is recursive, with a visited set so a cycle in the
  // fact graph reports as unreachable rather than hanging the loader.
  const reachable = (factId: string, seen: Set<string>): boolean => {
    if (seen.has(factId)) return false;
    seen.add(factId);
    const def = pkg.facts.find((x) => x.id === factId);
    if (!def) return false;
    return pkg.discovery_paths
      .filter((p) => p.fact === factId && def.discoverable_via.includes(p.id))
      .some((p) => pathLive(p.requires, pkg, ctx, holdersOf, playerId, reachable, seen));
  };

  for (const f of pkg.facts) {
    if (!f.required_for_top_outcome) continue;
    const paths = pkg.discovery_paths.filter((p) => f.discoverable_via.includes(p.id) && p.fact === f.id);
    const live = paths.filter((p) => pathLive(p.requires, pkg, ctx, holdersOf, playerId, reachable, new Set([f.id])));
    if (live.length < 2) {
      failures.push(
        `fact "${f.id}" is required for a top outcome but only ${live.length} of ${paths.length} discovery path(s) are open at load (${paths.map((p) => p.id).join(', ') || 'none declared'})`,
      );
    }
  }
  return failures;
}

function pathLive(
  requires: Parameters<typeof evalPred>[0],
  pkg: ScenarioPackage,
  ctx: PredContext,
  holdersOf: (factId: string) => string[],
  playerId: string,
  reachable: (factId: string, seen: Set<string>) => boolean,
  seen: Set<string>,
): boolean {
  if (!requires) return true; // an ungated path is always walkable
  // A knowledge gate on a character needs that character to actually hold the fact.
  // A knowledge gate on the player needs the fact to be reachable in its own right.
  const gates = collectKnowsGates(requires);
  for (const g of gates) {
    if (g.actor === playerId) {
      if (!reachable(g.fact, new Set(seen))) return false;
      continue;
    }
    const holders = holdersOf(g.fact);
    if (!holders.includes(g.actor)) return false;
  }
  // Everything else is checked against the load-time state directly.
  const alive = collectAliveGates(requires);
  for (const a of alive) if (ctx.state.alive[a] === false) return false;
  const objs = collectObjectGates(requires);
  for (const o of objs) if (!pkg.entities.some((e) => e.id === o)) return false;
  return true;
}

type AnyPred = Parameters<typeof evalPred>[0];
function collectKnowsGates(p: AnyPred, out: { actor: string; fact: string }[] = []): { actor: string; fact: string }[] {
  if (!p) return out;
  if ('all' in p) p.all.forEach((q) => collectKnowsGates(q, out));
  else if ('any' in p) p.any.forEach((q) => collectKnowsGates(q, out));
  else if ('knows' in p) out.push({ actor: p.knows.actor, fact: p.knows.fact });
  return out;
}
function collectAliveGates(p: AnyPred, out: string[] = []): string[] {
  if (!p) return out;
  if ('all' in p) p.all.forEach((q) => collectAliveGates(q, out));
  else if ('any' in p) p.any.forEach((q) => collectAliveGates(q, out));
  else if ('alive' in p) out.push(p.alive);
  return out;
}
function collectObjectGates(p: AnyPred, out: string[] = []): string[] {
  if (!p) return out;
  if ('all' in p) p.all.forEach((q) => collectObjectGates(q, out));
  else if ('any' in p) p.any.forEach((q) => collectObjectGates(q, out));
  else if ('object' in p) out.push(p.object.id);
  return out;
}
