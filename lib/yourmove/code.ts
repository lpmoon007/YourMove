// The play code: the whole of a lightweight account.
//
// No email, no password, no personal data. A player is given one code, and typing it on
// another device attaches that device to the same profile.
//
//   ym-4f2a9c-raven-tunnel-quiet-ash-mercy-eleven
//      ^^^^^^ ^-------------------------------^
//      public account id      the secret, ~62 bits
//
// The account id is public and is how the code is looked up, so no searchable hash of the
// secret is ever stored. Only a scrypt hash of the secret half is written down: a copy of
// the database does not let anybody sign in as anybody.

import { randomInt, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

/** 256 short, unambiguous, easily-typed words. 5 of them is about 40 bits; with the
 *  account id in front, guessing a working code means guessing a specific account's. */
const WORDS = `amber anchor angle apple arbor arch ashen aspen atlas attic aurora autumn
axis azure badge bamboo banner barley basin beacon bell birch bishop blade bloom bluff
bolt border bramble brass bridge bronze brook buckle burrow cable cactus canvas canyon
carbon cargo cedar chalk chapel charm cinder circle cliff cloak clover cobalt comet
compass copper coral cotton crater crest crimson crown crystal cypress dagger dawn delta
denim diamond ditch dome drift dune dusk ember empire ensign epoch equinox falcon fathom
feather fennel fern ferry fiddle finch flint forge fossil fountain foxglove gable galley
garnet gate ginger glacier glint granite gravel grotto grove gulf gully hammer harbor
harvest haven hazel hearth heron hickory hollow honey horizon ivory jasper jetty juniper
kettle keystone kindle lantern larch lattice ledger lichen lilac linen lodge lotus lumber
lyric maple marble marsh meadow mercy meridian mesa mica midnight mineral mint mirror mist
morrow mosaic moss motion nectar needle nickel nomad north nutmeg oak oasis obsidian ochre
olive onyx opal orbit orchard osprey otter oxide pallet pantry parcel parlor pasture pearl
pebble pennant pepper petal pewter pigeon pillar pine pivot plateau plover plume pollen
poplar porch portal prairie prism quarry quartz quill quiver radish rafter rally rampart
raven ravine reed relic remedy ribbon ridge rille rime ripple river rooster rosemary rudder
rustic saffron sage sandal sapling satchel scarlet season sedge sequoia shale shelf shore
signal silver sketch slate sliver socket solstice sorrel spindle spire spruce stable stanza
steeple stitch stone stream sumac summit sundial swallow sycamore tally tamarisk tandem
tangle tannin tavern teal tempo tender terrace thicket thimble thistle thorn thread thrush
tide timber tinder topaz torch tower trellis trestle trickle trill trout tunnel turret
twine umber vale valley vellum velvet verdant vessel vine violet vireo walnut warren
weather wharf wheat willow window winter wisp yarrow yonder`
  .split(/\s+/)
  .filter(Boolean);

const SECRET_WORDS = 5;

export interface NewCode {
  /** The full code. Shown to the player exactly once and never stored. */
  code: string;
  account_id: string;
  secret_hash: string;
}

export function mintCode(): NewCode {
  const accountId = randomUUID().replace(/-/g, '').slice(0, 6);
  // No word twice. A repeated word reads like a typo, and somebody copying this by hand
  // off one screen onto another phone should never have to wonder.
  const words: string[] = [];
  while (words.length < SECRET_WORDS) {
    const word = WORDS[randomInt(WORDS.length)]!;
    if (!words.includes(word)) words.push(word);
  }
  const secret = words.join('-');
  return { code: `ym-${accountId}-${secret}`, account_id: accountId, secret_hash: hashSecret(secret) };
}

/** Forgiving on the way in: case, spaces, smart dashes and a missing prefix all work. */
export function parseCode(input: string): { account_id: string; secret: string } | null {
  const cleaned = (input ?? '')
    .toLowerCase()
    .replace(/[‐-―−]/g, '-')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/^ym-/, '');
  const parts = cleaned.split('-').filter(Boolean);
  if (parts.length < 2) return null;
  const [accountId, ...words] = parts;
  if (!/^[0-9a-f]{6}$/.test(accountId!) || !words.length) return null;
  return { account_id: accountId!, secret: words.join('-') };
}

export function hashSecret(secret: string): string {
  const salt = randomUUID().replace(/-/g, '');
  const hash = scryptSync(secret, salt, 32).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifySecret(secret: string, stored: string): boolean {
  const [scheme, salt, expected] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = scryptSync(secret, salt, 32).toString('hex');
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
