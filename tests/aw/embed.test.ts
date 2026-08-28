// THE FRONT OF THE HOUSE.
//
// The marketing site used to keep its own copy of the three moves each world opens with,
// and it drifted — three separate rounds of "here is the new block, paste it in", and one
// taster left offering endings instead of openings for weeks.
//
// It holds one script tag now. That script is served from this app and reads
// /api/openings, so the failure mode moved: nobody will notice if a field is renamed here,
// because the break shows up on a different website. These checks are the noticing.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { GET } from '@/app/api/openings/route';
import { WORLDS } from '@/content/yourmove';

const EMBED = 'public/embed/openings.js';

async function payload(origin = 'https://app.example') {
  const response = await GET(new Request(`${origin}/api/openings`));
  assert.equal(response.status, 200);
  return (await response.json()) as {
    openings: {
      world: string;
      title: string;
      tagline: string;
      prompt: string;
      estimated_minutes: number;
      choices: { id: string; label: string; preview: string; enter: string }[];
    }[];
  };
}

test('the embed reads every field it renders, and the API still sends them', async () => {
  const source = readFileSync(EMBED, 'utf8');
  const { openings } = await payload();
  assert.ok(openings.length, 'the API offered no tasters at all');

  // Read straight off the script rather than restating it here, so this cannot pass by
  // agreeing with a copy of itself.
  const read = [...source.matchAll(/world\.([a-z_]+)/g)].map((m) => m[1]!);
  const perChoice = [...source.matchAll(/choice\.([a-z_]+)/g)].map((m) => m[1]!);
  assert.ok(read.length && perChoice.length, 'the embed reads nothing — has it been rewritten?');

  for (const world of openings) {
    for (const field of new Set(read))
      assert.ok(
        field in world,
        `the embed renders world.${field} and the API no longer sends it — the site will show a gap`,
      );
    assert.ok(world.choices.length, `${world.world} offers a taster with no moves in it`);
    for (const choice of world.choices)
      for (const field of new Set(perChoice))
        assert.ok(
          field in choice,
          `the embed renders choice.${field} and the API no longer sends it (${world.world})`,
        );
  }
});

test('every world with a taster reaches the site, and its links are real doors', async () => {
  const { openings } = await payload();
  const expected = WORLDS.filter((w) => w.world.opening).map((w) => w.slug);
  assert.deepEqual(
    openings.map((o) => o.world).sort(),
    [...expected].sort(),
    'the site would show a different set of worlds than the ones that actually have tasters',
  );

  for (const world of openings) {
    const pkg = WORLDS.find((w) => w.slug === world.world)!;
    const ids = pkg.world.opening!.choices.map((c) => c.id);
    for (const choice of world.choices) {
      assert.ok(ids.includes(choice.id), `${world.world} offers "${choice.id}", which the world does not have`);
      const url = new URL(choice.enter);
      assert.equal(url.pathname, `/world/${world.world}`, `${choice.id} points somewhere other than its world`);
      assert.equal(url.searchParams.get('opening'), choice.id, `${choice.id} would start a different move`);
    }
  }
});

test('the embed keeps the page as it is when the fetch does not land', () => {
  const source = readFileSync(EMBED, 'utf8');
  // Blanking a marketing page because an API blipped is worse than stale copy, so the
  // container is only ever emptied on the success path.
  const clears = source.indexOf("container.textContent = ''");
  const catches = source.indexOf('.catch(');
  assert.ok(clears > 0, 'the embed no longer replaces the fallback markup at all');
  assert.ok(catches > 0, 'the embed has no failure path — a blip would leave the page mid-render');
  assert.ok(
    /data-yourmove-state', 'failed'/.test(source),
    'a failed fetch no longer marks the container, so the page cannot style around it',
  );
  assert.ok(
    source.slice(catches).indexOf("container.textContent = ''") === -1,
    'the failure path clears the container — the page would go blank instead of staying stale',
  );
});

test('the embed takes its host from its own tag, not from the API', () => {
  const source = readFileSync(EMBED, 'utf8');
  // The API builds "enter" from the Host header it was given, which a proxy or a preview
  // deployment can make wrong. The script was pointed at the app by hand.
  assert.ok(/new URL\(self\.src\)\.origin/.test(source), 'the embed no longer derives its origin from its own src');
  assert.ok(
    !/link\.href = choice\.enter/.test(source),
    'the embed uses the host the API sent verbatim again — a preview deployment would capture the links',
  );
});

test('a document served to strangers says nothing about how to reach the console', async () => {
  const { openings } = await payload();
  const text = JSON.stringify(openings).toLowerCase();
  for (const word of ['secret', 'service_role', 'supabase', 'console?key'])
    assert.ok(!text.includes(word), `the public taster payload mentions ${word}`);
});
