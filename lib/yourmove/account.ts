'use server';
// The account actions. Four of them, and none of them asks for anything personal.
//
// The whole account is a play code. Creating one mints it, signing in verifies it, and
// signing out simply hands this browser a fresh anonymous identity — the account and
// everything filed under it stay exactly where they are.

import { runStore } from '@/lib/aw/store';
import { mintCode, parseCode, verifySecret } from '@/lib/yourmove/code';
import { currentDeviceId, ensureDeviceId, newDeviceId, setDeviceId } from '@/lib/yourmove/session';

export interface AccountView {
  signed_in: boolean;
  display_name: string | null;
  /** The public half of the code, so a signed-in player can tell which account this is. */
  account_id: string | null;
  devices: number;
}

export interface NewAccountResult {
  /** Shown once, on the screen that created it, and never retrievable again. */
  code: string;
  display_name: string | null;
}

const SAME_ERROR = 'That code did not work. Check it and try again — it is five words after the short id.';

export async function accountView(): Promise<AccountView> {
  const device = await currentDeviceId();
  if (!device) return { signed_in: false, display_name: null, account_id: null, devices: 0 };
  const account = await runStore().accountForPlayer(device);
  if (!account) return { signed_in: false, display_name: null, account_id: null, devices: 1 };
  const devices = await runStore().devicesForAccount(account.id);
  return {
    signed_in: true,
    display_name: account.display_name,
    account_id: account.id,
    devices: Math.max(devices.length, 1),
  };
}

/** Create an account for the play already on this device. Its history comes along. */
export async function createPlayCode(displayName: string): Promise<NewAccountResult | { error: string }> {
  const device = await ensureDeviceId();
  const existing = await runStore().accountForPlayer(device);
  if (existing) return { error: 'This device already has a code. Sign out first if you want a different one.' };

  const name = cleanName(displayName);
  if (name && name.length > 40) return { error: 'Keep the name under 40 characters.' };

  const minted = mintCode();
  await runStore().createAccount({
    account_id: minted.account_id,
    display_name: name,
    secret_hash: minted.secret_hash,
  });
  await runStore().attachPlayer(device, minted.account_id);
  return { code: minted.code, display_name: name };
}

/**
 * Use a code on this device.
 *
 * If this browser has been playing anonymously, its play is merged into the account —
 * that is the ordinary case, and it is why the code is worth typing. If it already
 * belongs to a different account, it is given a fresh identity first, so one account's
 * history is never quietly moved into another.
 */
export async function signInWithCode(code: string): Promise<{ display_name: string | null } | { error: string }> {
  const parsed = parseCode(code ?? '');
  if (!parsed) return { error: SAME_ERROR };

  const account = await runStore().accountById(parsed.account_id);
  // Deliberately the same message whether the account is unknown or the words are wrong:
  // a stranger with a code should not learn which half they got right.
  if (!account || !verifySecret(parsed.secret, account.secret_hash)) return { error: SAME_ERROR };

  let device = await ensureDeviceId();
  const already = await runStore().accountForPlayer(device);
  if (already && already.id !== account.id) {
    device = newDeviceId();
    await setDeviceId(device);
  }
  await runStore().attachPlayer(device, account.id);
  return { display_name: account.display_name };
}

/** Leave the account on this browser. Nothing is deleted; this device just goes quiet. */
export async function signOutOfAccount(): Promise<void> {
  await setDeviceId(newDeviceId());
}

export async function renameAccount(displayName: string): Promise<{ display_name: string | null } | { error: string }> {
  const device = await currentDeviceId();
  const account = device ? await runStore().accountForPlayer(device) : null;
  if (!account) return { error: 'Nothing to rename — this device is not using a code.' };
  const name = cleanName(displayName);
  if (!name) return { error: 'Give it a name first.' };
  if (name.length > 40) return { error: 'Keep the name under 40 characters.' };
  await runStore().setDisplayName(account.id, name);
  return { display_name: name };
}

function cleanName(input: string): string | null {
  const trimmed = (input ?? '').replace(/\s+/g, ' ').trim();
  return trimmed ? trimmed : null;
}
