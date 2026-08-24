// ITEM 8 — the Capability and Cost Check. Can this be attempted, and at what price?
//
// Fully deterministic. No model call anywhere in this file.
//
// Five results, not two. The interesting play lives between yes and no, so this stage
// prefers COST or CONSTRAINT over IMPOSSIBLE wherever the fiction allows, and it never
// blocks an action merely because the scenario did not anticipate it (L5). Every
// non-permitted result carries a diegetic reason (L10) — the world says why, in world,
// through a character or a condition. It never says "you can't do that".

import type { VerbDef } from './package';
import type { CapabilityVerdict, Effect, Intent } from './types';
import type { World } from './world';

export function checkCapability(world: World, intent: Intent): CapabilityVerdict {
  const pkg = world.pkg;
  const st = world.store.read();
  const verb: VerbDef | undefined = pkg.verbs.find((v) => v.id === intent.verb);
  const checks: CapabilityVerdict['checks'] = [];
  const cost: Effect[] = [];
  let result: CapabilityVerdict['result'] = 'permitted';
  let reason: string | null = null;
  let voiced_by: string | null = null;
  let constraint: string | null = null;
  let uncertainty = 0;
  let minutes = verb?.default_minutes ?? 1;

  const line = (code: string, vars: Record<string, string>) => renderBlock(world, code, vars);
  const worsen = (next: CapabilityVerdict['result']) => {
    const rank: CapabilityVerdict['result'][] = [
      'permitted',
      'permitted_with_cost',
      'permitted_with_constraint',
      'attempted_with_uncertainty',
      'impossible',
    ];
    if (rank.indexOf(next) > rank.indexOf(result)) result = next;
  };

  // --- proximity: is the person you are addressing actually here? -----------
  const actorTargets = intent.targets.filter((t) => pkg.cast.some((c) => c.id === t));
  for (const t of actorTargets) {
    const here = st.positions[t] === world.playerLocation;
    const alive = st.alive[t] !== false;
    checks.push({ check: 'proximity', passed: here || Boolean(verb?.remote) });
    if (!alive) {
      worsen('impossible');
      reason = line('block.dead', { name: world.displayName(t) });
      voiced_by = null;
    } else if (!here && !verb?.remote) {
      worsen('impossible');
      reason = line('block.absent', { name: world.displayName(t) });
      voiced_by = world.presentActors()[0] ?? null;
    } else if (!here && verb?.remote) {
      // reaching someone who is elsewhere costs time and may not land
      worsen('attempted_with_uncertainty');
      uncertainty += 0.15;
      minutes += 1;
    }
  }

  // --- existence and access: is the thing there, and can it be touched? -----
  const objectTargets = intent.targets.filter((t) => pkg.entities.some((e) => e.id === t));
  for (const t of objectTargets) {
    const def = pkg.entities.find((e) => e.id === t)!;
    if (st.destroyed.includes(t)) {
      worsen('impossible');
      reason = line('block.destroyed', { name: def.name });
      checks.push({ check: 'existence', passed: false });
      continue;
    }
    checks.push({ check: 'existence', passed: true });
    const inReach = st.positions[t] === world.playerLocation || def.location === world.playerLocation;
    if (!inReach) {
      worsen('impossible');
      reason = line('block.out_of_reach', { name: def.name });
      checks.push({ check: 'access', passed: false });
    } else if (def.searchable === false && (verb?.object_verb || intent.verb === 'search')) {
      // access denied, but as a constraint: you can try, in a worse form
      worsen('permitted_with_constraint');
      constraint = line('block.sealed', { name: def.name });
      uncertainty += 0.2;
      minutes += 1;
      checks.push({ check: 'access', passed: false, note: 'degraded' });
    } else {
      checks.push({ check: 'access', passed: true });
    }
  }

  // --- a verb that needs a target and did not get one ----------------------
  if (verb?.requires_target && intent.targets.length === 0) {
    worsen('permitted_with_constraint');
    constraint = line('block.no_target', { verb: verb.label });
    uncertainty += 0.2;
    checks.push({ check: 'target', passed: false });
  }

  // --- resources: never let a player spend what they do not hold -----------
  const commits: { id: string; amount: number }[] = [];
  for (const r of intent.resources) {
    const held = st.resources[r.id]?.[world.playerId] ?? 0;
    const wanted = r.amount === -1 ? held : r.amount === -2 ? Math.floor(held / 2) : r.amount;
    if (held <= 0) {
      worsen('impossible');
      reason = line('block.broke', { resource: pkg.world.resources[r.id]?.label ?? r.id });
      checks.push({ check: 'resources', passed: false });
      continue;
    }
    if (wanted > held) {
      worsen('permitted_with_constraint');
      constraint = line('block.short', {
        resource: pkg.world.resources[r.id]?.label ?? r.id,
        held: String(held),
        wanted: String(wanted),
      });
      commits.push({ id: r.id, amount: held });
      checks.push({ check: 'resources', passed: false, note: 'capped at holdings' });
    } else {
      commits.push({ id: r.id, amount: wanted });
      checks.push({ check: 'resources', passed: true });
    }
  }

  // --- time: the clock is a real constraint, and running out is uncertainty,
  //     not a wall. You may simply not finish before the van goes. -----------
  const remaining = world.minutesRemaining;
  if (remaining !== null) {
    checks.push({ check: 'time', passed: minutes <= remaining });
    if (minutes > remaining) {
      worsen('attempted_with_uncertainty');
      uncertainty += 0.35;
    } else if (remaining <= 3) {
      worsen('attempted_with_uncertainty');
      uncertainty += 0.15;
    }
  }

  // --- social permission: a burnt bridge is a price, not a locked door -----
  for (const t of actorTargets) {
    const trust = st.dispositions[t]?.trust ?? 0;
    checks.push({ check: 'social', passed: trust > -60 });
    if (trust <= -60) {
      worsen('permitted_with_cost');
      cost.push({ kind: 'clock', minutes: 1 });
      reason = reason ?? line('block.cold', { name: world.displayName(t) });
      voiced_by = t;
      uncertainty += 0.2;
    }
  }

  // --- secrecy: doing it covertly in a full room is a gamble ---------------
  if (intent.secrecy !== 'open') {
    const witnesses = world.presentActors().filter((a) => !intent.targets.includes(a));
    checks.push({ check: 'secrecy', passed: witnesses.length === 0 });
    if (witnesses.length) {
      worsen('attempted_with_uncertainty');
      uncertainty += 0.1 * witnesses.length;
    }
  }

  // --- an unanticipated action is NOT blocked for being unanticipated (L5) --
  if (intent.verb === 'other') {
    checks.push({ check: 'vocabulary', passed: true, note: 'general fallback' });
    uncertainty += 0.1;
    minutes = Math.max(minutes, 2);
  }

  return {
    result,
    reason: result === 'permitted' ? null : reason ?? constraint,
    voiced_by,
    cost,
    constraint,
    uncertainty: Math.min(0.9, uncertainty),
    minutes: Math.max(0, minutes),
    commits,
    checks,
  };
}

/** Diegetic block lines are AUTHORED, in the package. The engine never invents one. */
function renderBlock(world: World, code: string, vars: Record<string, string>): string {
  const template =
    world.pkg.narrator_fallbacks[code] ??
    world.pkg.narrator_fallbacks['block.default'] ??
    'Nothing in the room makes that possible right now.';
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), template);
}
