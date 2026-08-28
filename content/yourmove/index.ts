// The worlds.
//
// A world is data. The engine in lib/aw has no idea any of these exist — it takes a
// package and a seed and runs whatever it is given — so adding one is a file in this
// directory and a line in this list, and nothing else in the product changes.
//
// A run records which world it came from, and is always reloaded against that world.
// Loading a run from one world against another would be a different game wearing the
// same run id: the facts would not line up, the cast would not exist, and canonical
// truth drawn under one package is meaningless under another.

import type { ScenarioPackage } from '@/lib/aw/package';
import { LAST_JOB } from './last-job';
import { LATE_EDITION } from './late-edition';
import { FOUR_MINUTES } from './four-minutes';
import { NO_PREY_NO_PAY } from './no-prey-no-pay';
import { THE_FAIR_COPY } from './the-fair-copy';
import { HEAD_OF_PRESSURE } from './head-of-pressure';
import { THE_LAST_HOUR } from './the-last-hour';

/** Every world a player can enter, in the order they are offered. */
export const WORLDS: ScenarioPackage[] = [LAST_JOB, LATE_EDITION, FOUR_MINUTES, NO_PREY_NO_PAY, THE_FAIR_COPY, HEAD_OF_PRESSURE, THE_LAST_HOUR];

/** Where a player lands when they have not asked for anything in particular. */
export const DEFAULT_WORLD: ScenarioPackage = WORLDS[0]!;

/** By the name in the URL. */
export function worldBySlug(slug: string | undefined | null): ScenarioPackage | null {
  if (!slug) return null;
  return WORLDS.find((w) => w.slug === slug) ?? null;
}

/**
 * By the id stored on a run. This is the lookup that matters: a saved run names its own
 * world, and that is the only package it may ever be restored against.
 */
export function worldById(id: string): ScenarioPackage | null {
  return WORLDS.find((w) => w.id === id) ?? null;
}

export { LAST_JOB, LATE_EDITION, FOUR_MINUTES, NO_PREY_NO_PAY, THE_FAIR_COPY, HEAD_OF_PRESSURE, THE_LAST_HOUR };
