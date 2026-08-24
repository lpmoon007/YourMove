// ITEM 16 — the World Clock. Time. Nothing else.
//
// It advances on action, with the duration set by the action, and it advances on
// inaction, because waiting is a choice with a cost. It is decoupled from the wall clock
// so later time jumps and off-screen execution are retrofittable. It contains NO process
// logic — that is item 17, kept separate so this never becomes a miscellaneous bucket.

import type { Effect } from './types';
import type { World } from './world';

/** The effect that moves time. The only way the clock moves. */
export function advance(minutes: number): Effect {
  return { kind: 'clock', minutes: Math.max(0, Math.round(minutes)) };
}

/** Timers whose moment has arrived. Firing them is item 17's job, not this file's. */
export function dueTimers(world: World): { id: string; fires_at: number; payload: Record<string, unknown> }[] {
  const now = world.clock;
  return Object.entries(world.store.read().timers)
    .filter(([, t]) => t.fires_at <= now)
    .map(([id, t]) => ({ id, fires_at: t.fires_at, payload: t.payload }))
    .sort((a, b) => a.fires_at - b.fires_at);
}

/** Has the world run out of time? The hard stop, if the scenario declares one. */
export function outOfTime(world: World): boolean {
  const rem = world.minutesRemaining;
  return rem !== null && rem <= 0;
}
