// LIGHTWEIGHT ACCOUNTS.
//
// One thing has to be true and stay true: a play code moves a profile from one device to
// another, and nothing else about the game changes because of it.
//
// The account layer holds no email, no password and no personal data. What it does hold
// is the hash of a code, so these tests also pin down that the stored form of a code
// cannot be turned back into the code.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { takeTurn } from '@/lib/aw';
import { awardBadges, buildProfile, observePlay, type PlayEvidence } from '@/lib/aw/play';
import { memoryStore } from '@/lib/aw/store/memory';
import { hashSecret, mintCode, parseCode, verifySecret } from '@/lib/yourmove/code';
import { fixture } from './_harness';

// --- the code itself ---------------------------------------------------------

test('a minted code reads back as its own account and secret', () => {
  const minted = mintCode();
  const parsed = parseCode(minted.code);
  assert.ok(parsed, 'a freshly minted code must parse');
  assert.equal(parsed.account_id, minted.account_id);
  assert.equal(verifySecret(parsed.secret, minted.secret_hash), true);
});

test('typing is forgiven: case, spaces, smart dashes, a missing prefix', () => {
  const minted = mintCode();
  const words = minted.code.replace(/^ym-[0-9a-f]{6}-/, '');
  const variants = [
    minted.code.toUpperCase(),
    minted.code.replace(/-/g, ' '),
    `  ${minted.code}  `,
    minted.code.replace(/-/g, '—'), // an em dash, which some keyboards insert
    `${minted.account_id}-${words}`, // the "ym-" dropped
    `${minted.account_id} ${words.replace(/-/g, ' ')}`,
  ];
  for (const v of variants) {
    const parsed = parseCode(v);
    assert.ok(parsed, `should have parsed "${v}"`);
    assert.equal(parsed.account_id, minted.account_id, `wrong account from "${v}"`);
    assert.equal(verifySecret(parsed.secret, minted.secret_hash), true, `wrong secret from "${v}"`);
  }
});

test('a wrong code does not open an account', () => {
  const mine = mintCode();
  const theirs = mintCode();
  const parsedTheirs = parseCode(theirs.code)!;
  assert.equal(verifySecret(parsedTheirs.secret, mine.secret_hash), false);
  assert.equal(verifySecret('raven-tunnel-quiet-ash-mercy', mine.secret_hash), false);
  assert.equal(verifySecret('', mine.secret_hash), false);
  // Nonsense in the account slot is refused before any hashing happens.
  assert.equal(parseCode('ym-zzzz-raven-tunnel'), null);
  assert.equal(parseCode('ym-4f2a9c'), null);
  assert.equal(parseCode(''), null);
});

test('nothing stored can be turned back into the code', () => {
  const minted = mintCode();
  const secret = minted.code.replace(/^ym-[0-9a-f]{6}-/, '');
  // Nothing the server keeps contains any part of the secret.
  assert.equal(minted.secret_hash.includes(secret), false);
  for (const word of secret.split('-')) {
    assert.equal(minted.secret_hash.includes(word), false, `the stored hash leaks "${word}"`);
  }
  // Salted: the same secret hashed twice is two different rows.
  assert.notEqual(hashSecret(secret), hashSecret(secret));
  assert.equal(verifySecret(secret, hashSecret(secret)), true);
});

test('a code has no word twice, so it can be copied off one screen by hand', () => {
  for (let i = 0; i < 40; i += 1) {
    const words = mintCode().code.replace(/^ym-[0-9a-f]{6}-/, '').split('-');
    assert.equal(words.length, 5);
    assert.equal(new Set(words).size, words.length, `a code repeated a word: ${words.join('-')}`);
  }
});

// --- the store ---------------------------------------------------------------

async function playedEvidence(runId: string, moves: string[]): Promise<PlayEvidence[]> {
  const world = fixture('last-job-001', runId);
  for (const m of moves) {
    const t = await takeTurn(world, m);
    if (t.ended) break;
  }
  return observePlay(world);
}

const LAPTOP_MOVES = ['ask Dez about the parked car', 'read the call log', 'press Cyrus', 'accuse Cyrus'];
const PHONE_MOVES = ['offer Marla ten thousand', 'quietly ask Cyrus about Marla', 'wait', 'walk out with the bag'];

test('a profile follows the code from one device to the next', async () => {
  const minted = mintCode();
  await memoryStore.createAccount({
    account_id: minted.account_id,
    display_name: 'nobody in particular',
    secret_hash: minted.secret_hash,
  });

  const laptop = 'p_device_laptop_one';
  const phone = 'p_device_phone_one';

  // The laptop plays first, anonymously — no code has been typed anywhere yet.
  const laptopRun = 'run_laptop_one';
  const laptopEvidence = await playedEvidence(laptopRun, LAPTOP_MOVES);
  await memoryStore.claimRun(laptopRun, laptop);
  await memoryStore.savePlayEvidence(laptop, laptopEvidence);
  assert.ok(laptopEvidence.length > 0, 'the run should have produced evidence to carry');

  // Then a code is made on the laptop: the anonymous play comes with it.
  await memoryStore.attachPlayer(laptop, minted.account_id);
  assert.deepEqual(await memoryStore.devicesForAccount(minted.account_id), [laptop]);

  // The phone, before the code is typed, knows nothing.
  assert.deepEqual(await memoryStore.playerEvidence([phone]), []);
  assert.deepEqual(await memoryStore.accountForPlayer(phone), null);

  // Type the code on the phone.
  await memoryStore.attachPlayer(phone, minted.account_id);
  const account = await memoryStore.accountForPlayer(phone);
  assert.equal(account?.id, minted.account_id);
  assert.equal(account?.display_name, 'nobody in particular');

  const devices = (await memoryStore.devicesForAccount(minted.account_id)).sort();
  assert.deepEqual(devices, [laptop, phone].sort());

  // The phone now reads the laptop's play, and the two devices read identically.
  const fromPhone = await memoryStore.playerEvidence(devices);
  const fromLaptop = await memoryStore.playerEvidence(devices);
  assert.deepEqual(fromPhone, fromLaptop);
  // Nothing was lost on the way through the store: what the run produced is what the
  // profile reads, on either device.
  assert.equal(fromPhone.length, laptopEvidence.length);
  assert.deepEqual(
    buildProfile(fromPhone, { runOrder: await memoryStore.playerRunOrder(devices) }),
    buildProfile(fromLaptop, { runOrder: await memoryStore.playerRunOrder(devices) }),
  );
});

test('play on a second device joins the same profile rather than starting a new one', async () => {
  const minted = mintCode();
  await memoryStore.createAccount({
    account_id: minted.account_id,
    display_name: null,
    secret_hash: minted.secret_hash,
  });
  const laptop = 'p_device_laptop_two';
  const phone = 'p_device_phone_two';
  await memoryStore.attachPlayer(laptop, minted.account_id);
  await memoryStore.attachPlayer(phone, minted.account_id);

  const laptopRun = 'run_laptop_two';
  const phoneRun = 'run_phone_two';
  const laptopEvidence = await playedEvidence(laptopRun, LAPTOP_MOVES);
  await memoryStore.claimRun(laptopRun, laptop);
  await memoryStore.savePlayEvidence(laptop, laptopEvidence);

  const phoneEvidence = await playedEvidence(phoneRun, PHONE_MOVES);
  await memoryStore.claimRun(phoneRun, phone);
  await memoryStore.savePlayEvidence(phone, phoneEvidence);

  const devices = await memoryStore.devicesForAccount(minted.account_id);
  const all = await memoryStore.playerEvidence(devices);
  assert.equal(all.length, laptopEvidence.length + phoneEvidence.length);

  const runs = new Set(all.map((e) => e.run_id));
  assert.equal(runs.size, 2, 'both nights should count toward the one profile');

  const order = await memoryStore.playerRunOrder(devices);
  assert.deepEqual([...order].sort(), [laptopRun, phoneRun].sort());
  // One timeline, oldest first — recency weighting reads this, so it cannot be
  // "everything from one device, then everything from the other".
  assert.equal(order.length, 2);

  const profile = buildProfile(all, { runOrder: order });
  assert.equal(profile.runs, 2);
});

test('a badge is earned once per person, not once per device', async () => {
  const minted = mintCode();
  await memoryStore.createAccount({
    account_id: minted.account_id,
    display_name: null,
    secret_hash: minted.secret_hash,
  });
  const a = 'p_device_a_three';
  const b = 'p_device_b_three';
  await memoryStore.attachPlayer(a, minted.account_id);
  await memoryStore.attachPlayer(b, minted.account_id);

  // The same run, played the same way on both devices, earns the same badges.
  const worldA = fixture('last-job-001', 'run_badge_a');
  for (const m of LAPTOP_MOVES) if ((await takeTurn(worldA, m)).ended) break;
  const worldB = fixture('last-job-001', 'run_badge_b');
  for (const m of LAPTOP_MOVES) if ((await takeTurn(worldB, m)).ended) break;

  const badgesA = awardBadges(worldA, observePlay(worldA));
  const badgesB = awardBadges(worldB, observePlay(worldB));
  assert.ok(badgesA.length > 0, 'the fixture run should earn something');
  await memoryStore.saveBadges(a, badgesA);
  await memoryStore.saveBadges(b, badgesB);

  const devices = await memoryStore.devicesForAccount(minted.account_id);
  const shown = await memoryStore.playerBadges(devices);
  assert.equal(new Set(shown.map((x) => x.id)).size, shown.length, 'no badge should appear twice');
  assert.equal(shown.length, new Set([...badgesA, ...badgesB].map((x) => x.id)).size);
});

test('signing out leaves the account exactly where it was', async () => {
  const minted = mintCode();
  await memoryStore.createAccount({
    account_id: minted.account_id,
    display_name: 'gone quiet',
    secret_hash: minted.secret_hash,
  });
  const device = 'p_device_signout';
  await memoryStore.attachPlayer(device, minted.account_id);

  const runId = 'run_signout';
  const evidence = await playedEvidence(runId, LAPTOP_MOVES);
  await memoryStore.claimRun(runId, device);
  await memoryStore.savePlayEvidence(device, evidence);

  // Signing out is a new device id in the cookie. Nothing is deleted, and typing the
  // code again on the old device brings the same play back.
  const fresh = 'p_device_signout_fresh';
  assert.deepEqual(await memoryStore.playerEvidence([fresh]), []);
  const stillThere = await memoryStore.playerEvidence(await memoryStore.devicesForAccount(minted.account_id));
  assert.equal(stillThere.length, evidence.length);

  await memoryStore.attachPlayer(fresh, minted.account_id);
  const after = await memoryStore.playerEvidence(await memoryStore.devicesForAccount(minted.account_id));
  assert.equal(after.length, evidence.length);
});

test('the account holds nothing personal', async () => {
  const minted = mintCode();
  await memoryStore.createAccount({
    account_id: minted.account_id,
    display_name: 'someone',
    secret_hash: minted.secret_hash,
  });
  const stored = await memoryStore.accountById(minted.account_id);
  assert.ok(stored);
  // Every field on an account, enumerated. Adding an email or a password to this layer
  // should have to break a test first.
  assert.deepEqual(Object.keys(stored).sort(), ['created_at', 'display_name', 'id', 'secret_hash']);
});
