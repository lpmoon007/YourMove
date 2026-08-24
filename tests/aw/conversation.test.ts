// CONVERSATION — the half of this world that is people talking.
//
// Everything here comes from watching somebody play. The world answered "I didn't catch
// that" to "how sure are you Dez?" three times in a row, told a player somebody was
// "keeping the rest where you can see them holding it" when nothing had been offered,
// and computed a reason for a blocked search that it then threw away. All of it shipped
// with a green harness, because every check ran on sentences that started with a verb.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { takeTurn } from '@/lib/aw';
import { checkCapability } from '@/lib/aw/capability';
import { deterministicParse } from '@/lib/aw/intent';
import { fixture, PKG } from './_harness';

const surface = (w: ReturnType<typeof fixture>) => ({
  actors: w.presentActors().map((id) => ({ id, name: w.displayName(id) })),
  entities: PKG.entities.map((e) => ({ id: e.id, name: e.name })),
  resources: Object.entries(PKG.world.resources).map(([id, r]) => ({ id, label: r.label })),
  location: { id: 'room', name: 'Room 1114' },
});

test('a question put to somebody in the room is a question, not gibberish', () => {
  const w = fixture('last-job-001', 'q-1');
  const asked = [
    'how sure are you Dez?',
    'Dez, how do you know that car is the same one?',
    'are you certain, Marla?',
    'Cyrus what time was the call',
    'why would they park it there, Dez',
    'Marla who else has a key',
  ];
  for (const raw of asked) {
    const intent = deterministicParse({ raw, vocabulary: PKG.verbs, surface: surface(w), recent: [] });
    assert.notEqual(intent.verb, 'other', `"${raw}" parsed as nothing`);
    assert.ok(intent.targets.length, `"${raw}" found nobody to ask`);
    assert.ok(intent.confidence > 0.4, `"${raw}" would be sent back as unclear`);
  }
});

test('a question aimed at nobody is still unclear — the world does not guess', () => {
  const w = fixture('last-job-001', 'q-2');
  for (const raw of ['who left the room?', 'what is going on', 'why is the car still there?']) {
    const intent = deterministicParse({ raw, vocabulary: PKG.verbs, surface: surface(w), recent: [] });
    assert.equal(intent.targets.length, 0, `"${raw}" invented a target`);
  }
});

test('a follow-up stays on the subject the person was already on', async () => {
  // "How sure are you?" names no subject and needs none: the driver has just said the car
  // on the corner is a police car, and that is plainly what is being asked about.
  const w = fixture('last-job-001', 'follow-1');
  const turn = await takeTurn(w, 'how sure are you Dez?');
  assert.equal(turn.outcome === 'clarify', false, 'the most obvious question in the game returned nothing');
  assert.match(turn.narration, /sedan|car/i, `Dez answered about nothing: ${turn.narration}`);
});

test('asking the same thing twice is answered as a repetition, never as withholding', async () => {
  const w = fixture('last-job-001', 'follow-2');
  await takeTurn(w, 'ask Dez about the car');
  const again = await takeTurn(w, 'ask Dez about the car');
  assert.match(again.narration, /again|already/i, `the repeat read as something new: ${again.narration}`);
  assert.doesNotMatch(
    again.narration,
    /keeps the rest|part of it/i,
    'the world invented a withholding that never happened',
  );
});

test('nothing claims a person held something back when nothing was on offer', async () => {
  // Sweep every question in the corpus: whenever a turn reveals nothing, the sentence the
  // player reads may not imply that it did.
  const asked = [
    'ask Marla about the weather',
    'ask Cyrus about the carpet',
    'ask Dez about the ice machine',
    'how are you holding up, Marla',
  ];
  for (const [i, move] of asked.entries()) {
    const w = fixture('last-job-001', `hold-${i}`);
    const turn = await takeTurn(w, move);
    if (/gives you this much/.test(turn.narration)) continue; // something really was given
    assert.doesNotMatch(
      turn.narration,
      /keeps the rest where you can see them holding it/,
      `"${move}" claimed a withholding with nothing revealed: ${turn.narration}`,
    );
  }
});

test('a verb that needs a target and has none is blocked, in world, for no time', async () => {
  for (const [i, move] of ['search', 'ask', 'press', 'offer'].entries()) {
    const w = fixture('last-job-001', `bare-${i}`);
    const before = w.clock;
    const turn = await takeTurn(w, move);
    assert.equal(turn.outcome, 'blocked', `"${move}" resolved into something instead of asking what you meant`);
    assert.equal(w.clock, before, `"${move}" charged world time for a half-typed word`);
    assert.match(turn.narration, /who|what/i, `"${move}" did not ask what was missing: ${turn.narration}`);
    assert.doesNotMatch(turn.narration, /\bcan(?:no|')t\b|invalid|error|target/i, 'a system voice got through');
  }
});

test('an object verb asks "what", a speech verb asks "who"', async () => {
  const searched = await takeTurn(fixture('last-job-001', 'whom-1'), 'search');
  assert.match(searched.narration, /Search what\?/, searched.narration);
  const asked = await takeTurn(fixture('last-job-001', 'whom-2'), 'ask');
  assert.match(asked.narration, /Ask who\?/, asked.narration);
});

test('a constraint the rules imposed always reaches the player', async () => {
  // It was being computed and dropped, so a hobbled action came back as a shrug and the
  // player was never told why (L10 — the world says why, in world).
  const tried = [
    'offer Marla a hundred thousand dollars', // more than is in the bag
    'search the plan',
  ];
  for (const [i, move] of tried.entries()) {
    const w = fixture('last-job-001', `constraint-${i}`);
    const intent = deterministicParse({ raw: move, vocabulary: PKG.verbs, surface: surface(w), recent: [] });
    const cap = checkCapability(w, intent);
    if (!cap.constraint || cap.result === 'impossible') continue;
    const turn = await takeTurn(w, move);
    assert.ok(
      turn.narration.includes(cap.constraint),
      `the world worked out why and said nothing:\n  constraint: ${cap.constraint}\n  narration:  ${turn.narration}`,
    );
  }
});

test('the world does not repeat itself word for word when it cannot understand', async () => {
  const w = fixture('last-job-001', 'clar-1');
  const said: string[] = [];
  for (const move of ['who left the room?', 'why is the car still there?', 'hmm']) {
    const turn = await takeTurn(w, move);
    assert.equal(turn.outcome, 'clarify', `"${move}" should not have parsed`);
    said.push(turn.narration);
  }
  assert.equal(new Set(said).size, said.length, `the same sentence twice:\n${said.join('\n')}`);
  // The first one has to be answerable: naming who is standing there is the whole point.
  assert.match(said[0]!, /Marla|Cyrus|Dez/, `it asked who without saying who is available: ${said[0]}`);
});

test('a clarifying question costs nothing and leaves the world exactly as it was', async () => {
  const w = fixture('last-job-001', 'clar-2');
  const before = { clock: w.clock, state: JSON.stringify(w.store.serialize()) };
  await takeTurn(w, 'hmm');
  assert.equal(w.clock, before.clock, 'not understanding the player cost them time');
  assert.equal(JSON.stringify(w.store.serialize()), before.state, 'not understanding the player changed the world');
});
