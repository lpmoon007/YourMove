// SPEAKING INSTEAD OF TYPING — the part of it that is testable without a microphone.
//
// Speech recognition mangles names it has never heard, and the intent parser matches a
// name as a whole word, so "ask Des what he saw" has no target and does nothing. Heard
// words that are nearly a name in the room are snapped to that name before they reach
// the box.
//
// The other half of the rule is that a snap is never silent: it lands in the composer,
// in front of the player, and nothing is sent until they send it. That is a property of
// the component, not of this function — see the browser check in the commit message.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { editDistance, snapNames, tidyUtterance } from '@/lib/yourmove/dictation';
import { PKG } from './_harness';

const CAST = PKG.cast.map((c) => c.name);

test('a name heard slightly wrong is snapped to the person in the room', () => {
  for (const [heard, expected] of [
    ['ask Des what he saw', 'ask Dez what he saw'],
    ['ask Deb about the parked car', 'ask Dez about the parked car'],
    ['press Marlo about the phone', 'press Marla about the phone'],
    ['offer Marla ten thousand', 'offer Marla ten thousand'],
    ['what does Cyrus want', 'what does Cyrus want'],
    ['ask Cyrus when the fence stops answering', 'ask Cyrus when the fence stops answering'],
  ] as [string, string][]) {
    assert.equal(snapNames(heard, CAST), expected, `heard: "${heard}"`);
  }
});

test('a word that is merely a word is left exactly as it was heard', () => {
  // The cost of a wrong snap is higher than the cost of a miss: a miss is visible in the
  // box and retyped, a wrong snap sends the action at the wrong person.
  const untouched = [
    'read the call log',
    'look out the window at the car',
    'count the money and sit down',
    'does anyone have a second phone',
    'check the door and the corridor',
    'wait and see who speaks first',
    'tell everyone to put their phones on the bed',
    'say nothing',
  ];
  for (const line of untouched) assert.equal(snapNames(line, CAST), line, `changed: "${line}"`);
});

test('two names equally close is left alone rather than guessed', () => {
  // "Dan" is one edit from both. Picking either would be a coin flip with the player's
  // turn on it.
  assert.equal(snapNames('ask Dan about it', ['Dax', 'Dam']), 'ask Dan about it');
  // One clear winner still snaps.
  assert.equal(snapNames('ask Dan about it', ['Dax', 'Marla']), 'ask Dax about it');
});

test('a name already spelled right, in any casing, is not touched', () => {
  assert.equal(snapNames('ask dez what he saw', CAST), 'ask dez what he saw');
  assert.equal(snapNames('ask DEZ what he saw', CAST), 'ask DEZ what he saw');
});

test('short words are never snapped', () => {
  // "he", "it", "do" are one or two edits from all sorts of things.
  for (const line of ['do it', 'he is lying', 'go and look']) {
    assert.equal(snapNames(line, ['Dez', 'Ito', 'Gil']), line, `changed: "${line}"`);
  }
});

test('an utterance is tidied into something a person would have typed', () => {
  assert.equal(tidyUtterance('  ask   Dez  what he saw '), 'ask Dez what he saw');
  assert.equal(tidyUtterance('read the call log .'), 'read the call log.');
  assert.equal(tidyUtterance(''), '');
});

test('edit distance is the ordinary one', () => {
  assert.equal(editDistance('dez', 'dez'), 0);
  assert.equal(editDistance('des', 'dez'), 1);
  assert.equal(editDistance('marlo', 'marla'), 1);
  assert.equal(editDistance('martha', 'marla'), 2);
  assert.equal(editDistance('', 'dez'), 3);
});

test('every name this world puts in a room survives a round trip', () => {
  // A world whose cast names collide under the snap rules would quietly make voice worse
  // than typing. If a future world adds two names one edit apart, this fails.
  for (const name of CAST) {
    const first = name.split(' ')[0]!;
    assert.equal(snapNames(`ask ${first} about it`, CAST), `ask ${first} about it`);
    const rivals = CAST.filter((n) => n !== name).map((n) => n.split(' ')[0]!.toLowerCase());
    for (const rival of rivals) {
      assert.ok(
        editDistance(first.toLowerCase(), rival) > 2,
        `"${first}" and "${rival}" are close enough that speech will confuse them`,
      );
    }
  }
});
