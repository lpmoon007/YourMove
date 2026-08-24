import 'server-only';
// Who is playing, as far as the server is concerned.
//
// Two ideas, deliberately separate:
//
//   a DEVICE is one browser. It gets a random id in a cookie the first time it plays, and
//   that id is what evidence and badges are filed under. No account is required, ever.
//
//   an ACCOUNT is several devices tied together by a play code. It holds a display name
//   and the hash of the code, and nothing else — no email, no password, nothing personal.
//
// A profile is read across every device on the account, which is the whole point: the
// phone and the laptop are the same person's play.

import { randomUUID } from 'node:crypto';

import { cookies } from 'next/headers';

import { runStore } from '@/lib/aw/store';
import type { StoredAccount } from '@/lib/aw/store/types';

export const PLAYER_COOKIE = 'ym_player';
const TWO_YEARS = 60 * 60 * 24 * 365 * 2;

export function newDeviceId(): string {
  return `p_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

/** Read-only. Safe during a page render, where Next.js forbids writing cookies. */
export async function currentDeviceId(): Promise<string | null> {
  return (await cookies()).get(PLAYER_COOKIE)?.value ?? null;
}

/** Mints the cookie if this browser has never played. Server actions only. */
export async function ensureDeviceId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(PLAYER_COOKIE)?.value;
  if (existing) return existing;
  const fresh = newDeviceId();
  jar.set(PLAYER_COOKIE, fresh, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: TWO_YEARS });
  return fresh;
}

/** Hand this browser a different device identity. Server actions only. */
export async function setDeviceId(id: string): Promise<void> {
  (await cookies()).set(PLAYER_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: TWO_YEARS,
  });
}

export async function currentAccount(): Promise<StoredAccount | null> {
  const device = await currentDeviceId();
  if (!device) return null;
  return runStore().accountForPlayer(device);
}

/**
 * Every device whose play counts as mine. One id when playing anonymously; all of the
 * account's devices once a play code has been used. The current device is always in the
 * list even if the store has not caught up with it yet.
 */
export async function myDevices(): Promise<string[]> {
  const device = await currentDeviceId();
  if (!device) return [];
  const account = await runStore().accountForPlayer(device);
  if (!account) return [device];
  const devices = await runStore().devicesForAccount(account.id);
  return devices.includes(device) ? devices : [...devices, device];
}
