// ITEM 17 — World Processes. Everything that happens on the clock without the player
// causing it.
//
// Actor-driven: a character relocates, leaks, panics, destroys evidence, changes
// allegiance, acts on a false belief. System-driven: evidence degrades, pressure builds,
// deadlines approach, rumors spread.
//
// Every process has explicit trigger conditions, writes events with causal links like
// any other actor, routes through invariants, and is AUTHORED IN THE PACKAGE, never
// hard-coded. Anything that fits neither definition does not belong here.

import { dueTimers } from './clock';
import { evalPred } from './predicate';
import type { WorldEvent } from './types';
import type { World } from './world';

export interface ProcessTickResult {
  events: WorldEvent[];
  lines: string[];
}

export function tickProcesses(world: World, causedBy: string | null): ProcessTickResult {
  const events: WorldEvent[] = [];
  const lines: string[] = [];
  const ctx = world.predContext();

  // --- authored processes --------------------------------------------------
  for (const p of world.pkg.processes) {
    const key = `process:${p.id}`;
    if (p.once && world.counters.fired.includes(key)) continue;

    let due = false;
    if (p.trigger.at_minute !== undefined) due = world.clock >= p.trigger.at_minute;
    if (p.trigger.every_minutes !== undefined) {
      const last = world.counters.fired_at_turn[key] ?? -Infinity;
      due = due || world.clock - last >= p.trigger.every_minutes;
    }
    if (p.trigger.when !== undefined) {
      const cond = evalPred(p.trigger.when, ctx);
      due = p.trigger.at_minute === undefined && p.trigger.every_minutes === undefined ? cond : due && cond;
    }
    if (!due) continue;

    const { event, result } = world.commit(p.effects, {
      actor_id: p.actor,
      actor_type: p.kind === 'actor' ? 'character' : 'world_process',
      verb: `process:${p.id}`,
      targets: [],
      visibility: ['*'],
      causality: { caused_by: causedBy ? [causedBy] : [] },
      payload: { process: p.id, kind: p.kind, summary: p.summary, public_line: p.line ?? p.summary },
    });
    if (!result.ok) continue;

    world.counters.fired.push(key);
    world.counters.fired_at_turn[key] = world.clock;
    events.push(event);
    if (p.line) lines.push(p.line);
  }

  // --- timers started by earlier effects -----------------------------------
  for (const t of dueTimers(world)) {
    const { event, result } = world.commit([{ kind: 'timer', op: 'cancel', id: t.id }], {
      actor_id: 'world',
      actor_type: 'world_process',
      verb: 'timer_fired',
      targets: [t.id],
      visibility: ['*'],
      causality: { caused_by: causedBy ? [causedBy] : [] },
      payload: {
        timer: t.id,
        public_line: String((t.payload as Record<string, unknown>).line ?? `${t.id} comes due.`),
      },
    });
    if (result.ok) {
      events.push(event);
      const line = (t.payload as Record<string, unknown>).line;
      if (typeof line === 'string') lines.push(line);
    }
  }

  return { events, lines };
}
