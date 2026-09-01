// NO PREY, NO PAY — the fourth world.
//
// A pirate captain in 1721 has until dark to keep a command that was never his by right.
// Under the articles every man aboard signed, a captain rules absolutely in a chase and
// is otherwise a servant of the vote — so this is not a world about giving orders. It is
// about finding out, in the time you have, whether the vote is what you were told it is.
//
// The engine shape, same as the others:
//   - the seed draws who is actually driving the mutiny, and one of the four answers is
//     that nobody is: the men are simply unpaid, and no one had to organize that
//   - the sailing master is certain about a topsail he saw three days ago, and wrong
//   - the quartermaster shades everything he says, whether or not he is behind it
//   - every fact that decides the run is reachable through a person and through a thing
//   - three ways to end it, and which is right depends on what you found out first

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const NO_PREY_NO_PAY: ScenarioPackage = {
  id: 'ym-no-prey-no-pay',
  slug: 'no-prey-no-pay',
  title: 'No Prey, No Pay',
  tagline: 'Three weeks out of Nassau, unpaid, and the vote is at nightfall. You have until dark.',
  format: 'F1',
  genre: 'Sea, 1721 — a pirate ship a few hours from a vote on whether to keep you. One deck, three men, and dark coming.',
  category: 'War & Command',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise: 'A pirate captain has until nightfall to find out whether the mutiny he has been warned about is real.',
    ending_out_of_time:
      'The sun goes down while you are still working it out, and the men come aft in their own time, without hurrying, because there is no need to hurry. Whatever you were going to find out, you were going to find it out tomorrow.',
    setup:
      'It is 1721 and you are three weeks out of Nassau in a sloop of forty-one men. Every one of them signed ' +
      'the ship\'s articles, and the articles are plain: no prey, no pay. The last raid came up empty, so ' +
      'nobody aboard has been paid in eleven weeks. Under those same articles you command absolutely in a chase ' +
      'and at no other time — the rest of it belongs to a vote. An hour ago your quartermaster came to the ' +
      'great cabin and told you that two-thirds of the men will vote at nightfall to put you off on the next ' +
      'sand they see, unless you turn the ship toward a merchant convoy that you have been told is under the ' +
      'guard of a Royal Navy frigate.',
    trouble:
      'You have until dark, and you have three things you are not certain of. You do not know whether the count ' +
      'you were given is the real one, because the man who gave it to you is the man the articles say takes the ' +
      'helm if you are put off. You do not know whether the frigate is with that convoy, because the only man ' +
      'who saw it saw it once, three days ago, through weather. And you do not know whether anybody organized ' +
      'this at all, or whether eleven weeks of nothing organized it by itself.',
    cold_open:
      'The cabin is hot and the stern windows are open and you can hear them on the deck above you, not talking ' +
      'much, which is the part that is wrong. Coyle is standing where the deckhead is low enough that he has to ' +
      'keep his head at an angle. Ridley came aft when he heard and has not been asked to sit. Tuck is in the ' +
      'doorway with his back half to you, watching the waist.\n\n' +
      '"Twenty-seven of forty-one," Coyle says, and lets it sit. "I counted twice. You have until it is dark, ' +
      'and then I have to put it to them whether I like it or not."',
    example_actions: [
      'ask Coyle to name the men who will vote against me',
      'ask Ridley what he actually saw three days ago',
      'look at the ship\'s articles',
    ],
    cast_note:
      'These three and forty-one men on the other side of the deckhead. Nothing is coming over the horizon to settle it for you.',
    clock_label: 'until the vote at nightfall',
    house_rules: [
      'Nobody aboard is neutral, and rank does not tell you which is which. One of them is certain about something and wrong. One of them shades everything he says, and that is true whether or not he is behind this.',
      'You are not the law here. Under the articles you command absolutely in a chase and at no other time, so an order is a thing the men may simply decline to carry out.',
      'Turning the ship ends the day. So does standing and letting the vote happen, and so does putting a different course to them. Everything before that, you can still take back.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the captain',
      start_location: 'cabin',
      you:
        'You were voted into this cabin nineteen months ago by men who could vote you out of it again, and ' +
        'until eleven weeks ago you had never given them a reason to. You have not slept properly since the ' +
        'last raid came up empty.',
      objective:
        'Still have a ship and a command when the sun comes up — and know what was actually true before you ' +
        'decide how. Guessing right is not the same as knowing.',
      pressure:
        'It is late afternoon and the vote is at dark. After that it stops being a conversation and becomes an ' +
        'arithmetic problem with your name in it.',
    },
    duration_minutes: 45,
    resources: {
      coin: { label: 'Coin left in the strongbox', holdings: { you: 240 } },
      talk: { label: 'How much of the lower deck has heard you are worried', holdings: { you: 0 } },
    },
    flags: { deck_mood: 'quiet' },

    opening: {
      prompt:
        'It is 1721, three weeks out from Nassau. Your crew has not been paid since the last raid came up ' +
        'empty, and your quartermaster has just told you that two-thirds of the men will vote to maroon you by ' +
        'nightfall unless you turn toward a merchant convoy you have been told is guarded by a Royal Navy ' +
        'frigate. You can smell mutiny already. You have until dark.',
      choices: [
        {
          id: 'count',
          label: 'Make him name them',
          preview:
            'A number is a thing anyone can say. Twenty-seven men have twenty-seven names, and a man who has really counted twice can give you them.',
          move: 'ask Coyle to name the men who will vote against me',
        },
        {
          id: 'frigate',
          label: 'Ask what was actually seen',
          preview:
            'The whole reason this course is suicide rests on one sighting by one man in poor weather. You send for him and ask what he saw, not what he concluded.',
          move: 'ask Ridley what he actually saw three days ago',
        },
        {
          id: 'articles',
          label: 'Read the articles again',
          preview:
            'Every man aboard signed them, including the one standing in front of you. What they actually say about a vote is not always what everybody remembers them saying.',
          move: 'look at the ship\'s articles',
        },
      ],
    },
  },

  locations: [
    {
      id: 'cabin',
      name: 'the great cabin',
      description:
        'Stern windows open on a flat sea, a table pegged to the deck, the strongbox under it, and forty-one men audible through the deckhead.',
      travel_minutes: { deck: 1 },
    },
    {
      id: 'deck',
      name: 'the waist of the ship',
      description: 'Men not doing very much in a way that takes effort, a water butt with a dipper on a string, and the whole horizon empty in every direction.',
      travel_minutes: { cabin: 1 },
    },
  ],

  entities: [
    {
      id: 'articles',
      name: "the ship's articles",
      kind: 'document',
      description: 'One sheet, signed or marked by every man aboard, including you and including the man standing in your cabin.',
      initial_state: 'in the locker',
      location: 'cabin',
      searchable: true,
      portable: true,
      body:
        'ARTICLE I. Every man has a vote in affairs of moment.\n' +
        'ARTICLE II. The Captain shall command absolutely in chase and in battle, and at no other time.\n' +
        'ARTICLE IV. No prey, no pay.\n' +
        'ARTICLE VII. A Captain may be put off by the vote of a MAJORITY of the whole company, taken openly,\n' +
        '            the Quartermaster counting, and no man to vote who has not stood a watch that day.\n' +
        'ARTICLE IX. He that is put off shall have a bottle of water, a pistol and one shot, and nothing else.',
    },
    {
      id: 'chart',
      name: "the sailing master's chart",
      kind: 'document',
      description: 'Worked in pencil and rubbed out a good deal, with a mark on it where something was seen three days ago.',
      initial_state: 'on the table',
      location: 'cabin',
      searchable: true,
      body:
        'Bearing marked in pencil, three days back, with a note beside it in a careful hand:\n\n' +
        '"Topsails only, hull down, eleven leagues. Ship-rigged. Did not close. Weather thick from the west."',
    },
    {
      id: 'strongbox',
      name: 'the strongbox',
      kind: 'object',
      description: 'Under the table, and lighter than it was in the spring.',
      initial_state: 'locked',
      location: 'cabin',
      searchable: true,
    },
    {
      id: 'daybook',
      name: "the purser's day-book",
      kind: 'document',
      description: 'What went out of the hold and what is left in it, written up every morning by a man with no reason to shade it.',
      initial_state: 'on the shelf',
      location: 'cabin',
      searchable: true,
      body:
        'Water, remaining: nine days at present ration.\n' +
        'Note: ration set in cooler weather. At this heat, six.\n' +
        'Small beer: none since the 14th.\n' +
        'Bread: adequate. Meat: adequate and not good.',
    },
    {
      id: 'glass',
      name: 'the spyglass',
      kind: 'object',
      description: 'Brass, salt-pitted, and good enough to tell a rig at eight miles on a clear day. It is a clear day.',
      initial_state: 'in the becket',
      location: 'cabin',
      searchable: true,
      portable: true,
    },
    {
      id: 'watchbill',
      name: 'the watch bill',
      kind: 'document',
      description: 'Who stood which watch, kept in the quartermaster\'s hand because keeping it is his office. He brought it aft with him, to be thorough.',
      initial_state: 'on the table where he set it down',
      location: 'cabin',
      searchable: true,
    },
  ],

  cast: [
    {
      id: 'coyle',
      name: 'Coyle',
      role: 'the quartermaster',
      voice:
        'Level and unhurried, says numbers as though they are weather. Answers the part of a question he likes ' +
        'and leaves the rest standing.',
      motive:
        'Take the helm by the articles rather than against them, and never once have to say out loud that this ' +
        'is what he wanted.',
      reliability: 'deceptive',
      competence: 0.7,
      start_location: 'cabin',
      intro:
        'Your quartermaster, elected by the men the same season they elected you. He keeps the watch bill, he ' +
        'counts a vote when there is one, and under the articles he is the man who speaks for the company.',
      leverage: 'He counts the vote, he keeps the watch bill that says who is allowed to cast one, and the articles put him at the helm if you go over the side.',
      starting_disposition: { trust: 20, fear: 5 },
      knows: ['mutiny_driver', 'real_count', 'coyle_stake'],
      fallback_lines: {
        default: 'I have told you the number. What you do about it is the captain\'s business, not mine.',
        pressed: 'You can shout at me in front of them if you like. It will not change what they do at dark.',
      },
    },
    {
      id: 'ridley',
      name: 'Ridley',
      role: 'the sailing master',
      voice:
        'Precise, careful, gives distances and bearings before he gives opinions. Repeats a thing he is sure of ' +
        'rather than defending it.',
      motive:
        'Be believed about the one thing he is certain of, because being right about the sea is the whole of ' +
        'what he is aboard for.',
      reliability: 'mistaken',
      competence: 0.6,
      start_location: 'cabin',
      intro:
        'The man who navigates for you. He has been at sea since he was nine and he is the only one aboard who ' +
        'saw anything at all three days ago.',
      leverage: 'He is the only witness to the sighting the whole argument rests on, and he keeps the chart it is marked on.',
      starting_disposition: { trust: 35, fear: 15 },
      knows: ['frigate_truth', 'convoy_position', 'real_count'],
      fallback_lines: {
        default: 'I know what I saw. Eleven leagues, topsails only, ship-rigged.',
        pressed: 'You may ask me a fourth time and I will give you the same bearing.',
      },
    },
    {
      id: 'tuck',
      name: 'Tuck',
      role: 'the gunner',
      voice:
        'Short, dry, been aboard longer than anybody including you. Says "aye" in three different ways and only ' +
        'one of them means yes.',
      motive:
        'Come out of this with his own share and his own skin, and be standing next to whoever is holding the ' +
        'ship at the end of it.',
      reliability: 'self_serving',
      competence: 0.7,
      start_location: 'cabin',
      intro:
        'Your gunner, and the oldest man aboard. He was on this deck under two captains before you and has ' +
        'stood in a doorway like that one for both of them.',
      leverage: 'He knows what is being said forward, because forward is where he sleeps and you are not.',
      starting_disposition: { trust: 20, fear: 0 },
      knows: ['mutiny_driver', 'water_left', 'promised_share'],
      fallback_lines: {
        default: 'Aye. That is one way to look at it.',
        pressed: 'I have been put off a ship before. It is not the worst thing that happens to a man.',
      },
    },
  ],

  facts: [
    {
      id: 'mutiny_driver',
      statement: 'The vote at nightfall was got up by {value}.',
      question: 'who actually got the vote up',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_driver_cornered', 'p_driver_tuck_paid'],
      required_for_top_outcome: true,
    },
    {
      id: 'real_count',
      statement: 'The men who would actually vote against you number {value}.',
      question: 'how the vote really stands',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_count_watchbill', 'p_count_coyle'],
      required_for_top_outcome: true,
    },
    {
      id: 'frigate_truth',
      statement: 'What was seen three days ago was {value}.',
      question: 'whether there is a frigate with that convoy at all',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_frigate_chart', 'p_frigate_ridley'],
      required_for_top_outcome: true,
    },
    {
      id: 'water_left',
      statement: 'The water in the hold is {value}.',
      question: 'how long the ship can stay out here at all',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_water_daybook', 'p_water_tuck'],
    },
    {
      id: 'coyle_stake',
      statement: 'If you go over the side, the quartermaster {value}.',
      question: 'what the man who counted the vote gets out of it',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_stake_articles', 'p_stake_tuck'],
    },
    {
      id: 'promised_share',
      statement: 'The men have been told that after you there will be {value}.',
      question: 'what the men have been promised comes after you',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_share_tuck'],
    },
    {
      id: 'convoy_position',
      statement: 'The convoy is {value}.',
      question: 'how far off the convoy actually is',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_convoy_ridley'],
    },
  ],

  discovery_paths: [
    // --- mutiny_driver: cornered with the count and the sighting, or bought forward
    {
      id: 'p_driver_cornered',
      fact: 'mutiny_driver',
      description: 'Put the real number and the truth about the sighting to the man who gave you neither, in front of the others.',
      requires: {
        all: [
          { knows: { actor: 'you', fact: 'real_count', correct: true } },
          { knows: { actor: 'you', fact: 'frigate_truth', correct: true } },
        ],
      },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },
    {
      id: 'p_driver_tuck_paid',
      fact: 'mutiny_driver',
      description: 'Pay the oldest man aboard out of the strongbox and ask him what is being said where he sleeps.',
      via_verb: ['ask', 'press'],
      via_target: ['tuck'],
      requires: { flag: 'tuck_paid', eq: true },
      topic_hints: ['who', 'behind', 'got', 'up', 'started', 'organized', 'forward', 'said', 'saying', 'talk'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.85 },
    },
    {
      id: 'p_driver_coyle_free',
      fact: 'mutiny_driver',
      description: 'Ask the quartermaster who got it up, and take the answer a man gives when he is one of the possible answers.',
      via_verb: ['ask'],
      via_target: ['coyle'],
      requires: { not: { knows: { actor: 'you', fact: 'real_count', correct: true } } },
      topic_hints: ['who', 'behind', 'got', 'up', 'started', 'organized', 'whose'],
      disclosure: {
        status: 'told',
        value: 'the men forward, all of them at once and none of them first',
        confidence: 0.5,
        fidelity: 0.35,
        distortion: 'an answer with no name in it, from a man with a name to keep out of it',
      },
    },

    // --- real_count: the watch bill is the check on the counter
    {
      id: 'p_count_watchbill',
      fact: 'real_count',
      description: 'Read the watch bill. No man votes who has not stood a watch that day, and the bill says who has.',
      via_verb: ['read'],
      via_target: ['watchbill'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_count_coyle',
      fact: 'real_count',
      description: 'Make the quartermaster name them rather than number them. Twenty-seven men have twenty-seven names.',
      via_verb: ['ask', 'press'],
      via_target: ['coyle'],
      topic_hints: ['name', 'names', 'who', 'which', 'count', 'counted', 'twenty', 'seven', 'many', 'number', 'list'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },

    // --- frigate_truth: the sailing master's sincere mistake
    {
      id: 'p_frigate_chart',
      fact: 'frigate_truth',
      description: 'Read what was actually written on the chart at the time, rather than what has been said about it since.',
      via_verb: ['read'],
      via_target: ['chart'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_frigate_ridley',
      fact: 'frigate_truth',
      description: 'Ask the man who saw it what he saw, and listen for the difference between that and what he decided it was.',
      via_verb: ['ask', 'press'],
      via_target: ['ridley'],
      requires: { knows: { actor: 'ridley', fact: 'frigate_truth' } },
      topic_hints: ['saw', 'seen', 'sighting', 'frigate', 'navy', 'topsail', 'topsails', 'rig', 'ship', 'actually', 'what', 'sure', 'certain'],
      // He passes on what he holds, which is wrong, and he holds it hard.
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8, fidelity: 0.9 },
    },

    // --- the rest
    {
      id: 'p_water_daybook',
      fact: 'water_left',
      description: "Read the purser's day-book instead of being told a number by somebody with an argument to make.",
      via_verb: ['read'],
      via_target: ['daybook'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_water_tuck',
      fact: 'water_left',
      description: 'Ask the oldest man aboard how long the ship can stay out here.',
      via_verb: ['ask', 'press'],
      via_target: ['tuck'],
      topic_hints: ['water', 'casks', 'long', 'days', 'stay', 'out', 'provisions', 'hold'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_stake_articles',
      fact: 'coyle_stake',
      description: 'The articles say plainly who takes the ship when a captain is put off. Read them again.',
      via_verb: ['read'],
      via_target: ['articles'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_stake_tuck',
      fact: 'coyle_stake',
      description: 'Ask the gunner what the quartermaster comes out of this with.',
      via_verb: ['ask', 'press'],
      via_target: ['tuck'],
      topic_hints: ['coyle', 'quartermaster', 'gets', 'get', 'gains', 'helm', 'command', 'after', 'stake', 'why'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
    {
      id: 'p_share_tuck',
      fact: 'promised_share',
      description: 'Ask the gunner what the men have been told is waiting for them on the other side of the vote.',
      via_verb: ['ask', 'press'],
      via_target: ['tuck'],
      topic_hints: ['promised', 'promise', 'told', 'share', 'shares', 'pay', 'paid', 'after', 'offered'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
    {
      id: 'p_convoy_ridley',
      fact: 'convoy_position',
      description: 'Ask the sailing master how far off the convoy is and how long it would take to close.',
      via_verb: ['ask', 'press'],
      via_target: ['ridley'],
      topic_hints: ['convoy', 'far', 'distance', 'leagues', 'close', 'reach', 'where', 'course', 'long'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.9 },
    },
  ],

  // --- canonical truth, drawn once from the seed ----------------------------
  truth_template: {
    variables: [
      {
        id: 'driver',
        kind: 'choice',
        // "nobody" is a real answer: eleven weeks of no pay does not need organizing.
        choices: [
          'the quartermaster, patiently, over about nine days',
          'the gunner, who has done this before on this same deck',
          'a man who came aboard at Nassau and has said very little since',
          'nobody at all — eleven weeks without pay did it without help',
        ],
        weights: [3, 2, 2, 3],
      },
    ],
    facts: {
      mutiny_driver: { from_variable: 'driver' },
      real_count: { value: 'nineteen, which is not twenty-seven and is not a majority of forty-one' },
      frigate_truth: { value: 'a Dutch merchantman, ship-rigged and running empty, eleven leagues off in thick weather' },
      water_left: { value: 'nine days at the present ration, and six if it stays this hot' },
      coyle_stake: { value: 'takes the helm by Article Seven, without ever having asked for it' },
      promised_share: { value: 'a full share each out of the next prize, promised by somebody with no prize to give' },
      convoy_position: { value: 'two days east on the present wind, and one if the wind backs' },
    },
    bindings: { ringleader: 'driver' },
  },

  // --- who holds what, before the first action ------------------------------
  holds: [
    // The sailing master is sincerely wrong about the one thing the whole argument rests
    // on. He saw topsails, hull down, in thick weather, and concluded a frigate.
    {
      actor: 'ridley',
      fact: 'frigate_truth',
      status: 'believed_false',
      value: 'a Royal Navy frigate, ship-rigged, standing guard over the convoy',
      confidence: 0.9,
    },
    // The quartermaster gave you a number he did not get from the watch bill.
    {
      actor: 'coyle',
      fact: 'real_count',
      status: 'believed_false',
      value: 'twenty-seven of forty-one, counted twice',
      confidence: 0.85,
    },
    // Whoever got it up knows perfectly well that they did.
    { actor: '@ringleader', fact: 'mutiny_driver', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'tuck', fact: 'water_left', status: 'observed', value: '@canonical', confidence: 0.9 },
  ],

  // --- the action space -----------------------------------------------------
  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'send for'],
      description: 'Put a question to one of the men in front of you.',
      default_minutes: 3,
      requires_target: true,
      speech: true,
      question_verb: true,
      base_difficulty: 0.05,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'solo_coalition', direction: 0.4, strength: 0.5, context: 'You asked instead of working around them.' },
        { dimension: 'direct_cunning', direction: -0.3, strength: 0.35, context: 'You put the question to them straight.' },
      ],
    },
    {
      id: 'press',
      label: 'Press',
      aliases: ['press', 'push', 'confront', 'lean on', 'demand', 'accuse', 'call out'],
      description: 'Stop asking and start insisting, in front of whoever is standing there.',
      default_minutes: 4,
      requires_target: true,
      speech: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'talk', from: 'world', to: 'you', amount: 1 }],
        backfire: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: -20 },
          { kind: 'resource', id: 'talk', from: 'world', to: 'you', amount: 2 },
        ],
      },
      play_signals: [
        { dimension: 'authority_consent', direction: -0.5, strength: 0.6, context: 'You leaned on them rather than won them.' },
        { dimension: 'force_diplomacy', direction: -0.7, strength: 0.8, context: 'You applied pressure rather than waiting for them to come around.' },
        { dimension: 'direct_cunning', direction: -0.5, strength: 0.5, context: 'You made it obvious what you wanted.' },
      ],
    },
    {
      id: 'read',
      label: 'Look at',
      aliases: ['read', 'look at', 'look', 'check', 'count', 'examine', 'search', 'open', 'go through'],
      description: 'Put your own hands and eyes on something aboard this ship.',
      default_minutes: 4,
      requires_target: true,
      object_verb: true,
      base_difficulty: 0.04,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'solo_coalition', direction: -0.45, strength: 0.5, context: 'You checked it yourself rather than asking anyone.' },
      ],
    },
    {
      id: 'tell',
      label: 'Tell',
      aliases: ['tell', 'warn', 'explain', 'admit', 'show', 'order'],
      description: 'Put something you have worked out into the room, or give an order and see what it is worth.',
      default_minutes: 3,
      requires_target: true,
      speech: true,
      base_difficulty: 0.1,
      effects_by_outcome: {
        success: [{ kind: 'disposition', actor: '@target', axis: 'trust', delta: 6 }],
      },
      play_signals: [
        { dimension: 'direct_cunning', direction: -0.7, strength: 0.6, context: 'You gave something away rather than holding it.' },
        { dimension: 'control_delegation', direction: -0.4, strength: 0.45, context: 'You said what was to happen rather than asking what should.' },
      ],
    },
    {
      id: 'pay',
      label: 'Pay',
      aliases: ['pay', 'offer', 'buy', 'give', 'bribe', 'promise coin'],
      description: 'Open the strongbox. It is lighter than it was, and everyone knows roughly how light.',
      default_minutes: 3,
      requires_target: true,
      speech: true,
      base_difficulty: 0.12,
      chip_when: { resource: { id: 'coin', holder: 'you', gte: 1 } },
      play_signals: [
        { dimension: 'authority_consent', direction: 0.4, strength: 0.5, context: 'You bought agreement rather than ordered it.' },
        { dimension: 'force_diplomacy', direction: 0.75, strength: 0.8, context: 'You paid for movement instead of demanding it.' },
        { dimension: 'preserve_risk', direction: 0.5, strength: 0.6, context: 'You spent from what was left to get an answer.' },
      ],
    },
    {
      id: 'send',
      label: 'Send away',
      aliases: ['send', 'send out', 'send away', 'dismiss', 'send on deck', 'get rid of'],
      description: 'Put somebody back on deck so you can talk without him.',
      default_minutes: 2,
      requires_target: true,
      base_difficulty: 0.25,
      play_signals: [
        { dimension: 'direct_cunning', direction: 0.6, strength: 0.6, context: 'You cleared the room before you said the next thing.' },
        { dimension: 'solo_coalition', direction: -0.5, strength: 0.55, context: 'You narrowed who was in the conversation.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'say nothing', 'do nothing', 'think', 'listen', 'let it sit'],
      description: 'Let the cabin go quiet and listen to what the deck is doing.',
      default_minutes: 3,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'turn',
      label: 'Turn toward the convoy',
      aliases: ['turn', 'turn toward the convoy', 'take the convoy', 'go for the convoy', 'set course east', 'chase', 'attack the convoy'],
      description: 'Call it a chase, which is the one hour of the day the articles make you absolute.',
      commitment_line:
        'You called the chase, and under Article Two that made you absolute for as long as it lasts. The helm came over, the men went to it because the articles say they must, and whatever is two days east is now a thing that is going to happen to all of you.',
      default_minutes: 2,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.15,
      chip_when: { clock: { gte: 8 } },
      play_signals: [
        { dimension: 'authority_consent', direction: -0.4, strength: 0.6, context: 'You set the course and expected it to be followed.' },
        { dimension: 'caution_boldness', direction: 0.85, strength: 0.9, context: 'You took the version of the day with the most in it and the most against it.' },
        { dimension: 'preserve_risk', direction: 0.8, strength: 0.8, context: 'You put the ship behind it.' },
      ],
    },
    {
      id: 'stand',
      label: 'Stand and let them vote',
      aliases: ['stand', 'let them vote', 'face the vote', 'accept the vote', 'let them maroon me', 'do nothing about it', 'refuse'],
      description: 'Change no course, promise nothing, and let the articles do what the articles do.',
      commitment_line:
        'You told them to hold the course and put it to the company at dark, and then you sat down in your own cabin and waited for other men to decide what happens to you. It is the one thing aboard this ship that nobody can take away from you: you did not beg.',
      default_minutes: 2,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.1,
      chip_when: { clock: { gte: 8 } },
      play_signals: [
        { dimension: 'cabin_deck', direction: 0.8, strength: 0.9, context: 'You let it go to the deck.' },
        { dimension: 'caution_boldness', direction: -0.5, strength: 0.7, context: 'You let it come to you rather than moving first.' },
        { dimension: 'loyalty_opportunism', direction: -0.6, strength: 0.7, context: 'You took the ending that cost you rather than the one that cost somebody else.' },
      ],
    },
    {
      id: 'propose',
      label: 'Put a different course',
      aliases: [
        'propose', 'suggest', 'compromise',
        'different course', 'another course', 'new course', 'change course',
        'smaller prize', 'nearer prize', 'safer prize',
        'put it to them', 'put it to the men', 'put it to the company', 'call them aft', 'call a vote myself',
      ],
      description: 'Go up and put a smaller, nearer prize to the whole company yourself, before the quartermaster has to.',
      commitment_line:
        'You went up the ladder and put it to them yourself, in daylight, before anybody had to be asked to. Whatever the men do with it now, they heard it from you standing in front of them and not from somebody else reading out a number.',
      default_minutes: 3,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.25,
      chip_when: { turns: { gte: 2 } },
      play_signals: [
        { dimension: 'cabin_deck', direction: 0.5, strength: 0.6, context: 'You put an alternative where everybody could hear it.' },
        { dimension: 'force_diplomacy', direction: 0.7, strength: 0.8, context: 'You made an offer rather than a stand.' },
        { dimension: 'solo_coalition', direction: 0.7, strength: 0.8, context: 'You put it to everybody rather than settling it in a cabin.' },
      ],
    },
  ],

  // --- the handful of beats the designer must control (L5) ------------------
  overrides: [
    {
      id: 'o_pay_tuck',
      priority: 100,
      when: { verb: ['pay'], target: ['tuck'], pred: { resource: { id: 'coin', holder: 'you', gte: 40 } } },
      outcome: 'success',
      effects: [
        { kind: 'resource', id: 'coin', from: 'you', to: 'tuck', amount: 40 },
        { kind: 'flag', id: 'tuck_paid', value: true },
        { kind: 'disposition', actor: 'tuck', axis: 'trust', delta: 25 },
      ],
      play_signals: [
        { dimension: 'force_diplomacy', direction: 0.7, strength: 0.8, context: 'You bought what you needed rather than taking it.' },
        { dimension: 'preserve_risk', direction: 0.5, strength: 0.6, context: 'You spent from what was left to get an answer.' },
      ],
      summary:
        'Tuck looks at the coin on the table for a while without touching it, and then takes it, and puts it somewhere about himself without counting it, which means he has decided something. "Ask me again," he says. "Properly."',
    },
    {
      id: 'o_corner_coyle',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['coyle'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'real_count', correct: true } },
            { knows: { actor: 'you', fact: 'frigate_truth', correct: true } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'cornered', value: true },
        { kind: 'disposition', actor: 'coyle', axis: 'fear', delta: 25 },
        { kind: 'disposition', actor: 'coyle', axis: 'trust', delta: -10 },
      ],
      reveals: [{ fact: 'mutiny_driver', to: 'you', status: 'observed', via: 'p_driver_cornered' }],
      play_signals: [
        { dimension: 'force_diplomacy', direction: -0.6, strength: 0.7, context: 'You used what you had found as leverage the moment you had it.' },
        { dimension: 'caution_boldness', direction: -0.3, strength: 0.4, context: 'You made sure before you moved.' },
      ],
      summary:
        'You say the real number out loud, and then what is actually written on the chart, and you let the two of them stand next to each other in a small hot cabin. Ridley says "nineteen?" before he can stop himself. Coyle does not say anything at all, and everybody in the doorway hears him not say it.',
    },
    {
      id: 'o_turn',
      priority: 100,
      when: { verb: ['turn'] },
      outcome: 'from_truth',
      truth_match: { fact: 'frigate_truth', equals: 'a Dutch merchantman, ship-rigged and running empty, eleven leagues off in thick weather' },
      // MATCHED means there was never a frigate, and the chase was never suicide.
      effects: [
        { kind: 'flag', id: 'turned', value: true },
        { kind: 'flag', id: 'turned_into_nothing', value: true },
        { kind: 'flag', id: 'deck_mood', value: 'committed' },
      ],
      summary:
        'The helm comes over and the men go to it, because in a chase they must. Two days east there is a convoy and no frigate anywhere near it, and there was never going to be one, and every man who was going to vote against you tonight will be hauling on a line at dawn instead.',
      effects_else: [
        { kind: 'flag', id: 'turned', value: true },
        { kind: 'flag', id: 'turned_into_it', value: true },
        { kind: 'flag', id: 'deck_mood', value: 'committed' },
      ],
      summary_else:
        'The helm comes over and the men go to it, because in a chase they must, and not one of them looks at you while they do it.',
    },
    {
      id: 'o_stand',
      priority: 100,
      when: { verb: ['stand'] },
      outcome: 'from_truth',
      truth_match: { fact: 'mutiny_driver', equals: 'nobody at all — eleven weeks without pay did it without help' },
      // MATCHED means there was no ringleader, and standing was exactly right.
      effects: [
        { kind: 'flag', id: 'stood', value: true },
        { kind: 'flag', id: 'stood_against_nothing', value: true },
      ],
      summary:
        'You hold the course and let it come. Nobody had organized anything, so there is nobody to be outmanoeuvred by, and what happens at dark is forty-one tired men deciding what they think of you on the evidence of nineteen months.',
      effects_else: [
        { kind: 'flag', id: 'stood', value: true },
        { kind: 'flag', id: 'stood_against_someone', value: true },
      ],
      summary_else:
        'You hold the course and let it come, which would be a fine thing to do if there were not somebody aboard who has spent nine days making sure of the answer.',
    },
    {
      // Putting a course to the company when the quartermaster is the one who got the vote
      // up hands him the floor he has been working toward for nine days.
      id: 'o_propose_his_floor',
      priority: 110,
      when: { verb: ['propose'], pred: { truth: { fact: 'mutiny_driver', eq: 'the quartermaster, patiently, over about nine days' } } },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'proposed', value: true },
        { kind: 'flag', id: 'proposed_to_his_floor', value: true },
      ],
      summary:
        'You go up and put it to them yourself. It is a good offer and it is heard out, and then the quartermaster steps forward to put the question properly, because putting questions is his office, and you understand a beat too late whose meeting this now is.',
    },
    {
      id: 'o_propose',
      priority: 100,
      when: { verb: ['propose'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'proposed', value: true },
        { kind: 'flag', id: 'proposed_clean', value: true },
      ],
      summary:
        'You go up and put it to them yourself, in daylight, and the thing that changes is not the offer. It is that they heard it standing up, from you, before anybody had to come and get you.',
    },
  ],

  // --- the Director's library ------------------------------------------------
  injects: [
    {
      id: 'i_deck_quiet',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      min_clock: 6,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'quiet',
      effects: [{ kind: 'flag', id: 'deck_mood', value: 'watching' }],
      line: 'The noise on deck changes. Not louder — thinner, as though a number of men have stopped what they were doing at roughly the same time and are now doing nothing in particular, close together.',
      summary: 'The deck goes quiet in the way that means people are listening.',
    },
    {
      id: 'i_coyle_price',
      kind: 'reveal',
      when: {
        all: [
          { turns: { gte: 3 } },
          { not: { knows: { actor: 'you', fact: 'real_count', correct: true } } },
        ],
      },
      once: true,
      actor: 'coyle',
      actor_type: 'character',
      verb: 'presses',
      demands_response: true,
      effects: [],
      line: 'Coyle shifts his head under the deckhead. "I am not enjoying this. I would rather come out of tonight with a captain than without one. Give me something to take up that ladder and I will take it."',
      summary: 'Coyle asks for something he can take to the men.',
    },
    {
      id: 'i_tuck_moves',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 4 } }, { not: { flag: 'tuck_paid', eq: true } }] },
      once: true,
      actor: 'tuck',
      actor_type: 'character',
      verb: 'positions',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'tuck', axis: 'trust', delta: -5 }],
      line: 'Tuck moves out of the doorway and leans on the frame the other way, so that he is now facing the deck rather than the cabin. He does not appear to have noticed doing it.',
      summary: 'Tuck quietly changes which way he is facing.',
    },
    {
      id: 'i_wind_backs',
      kind: 'pressure',
      when: { always: true },
      min_clock: 20,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'wind',
      effects: [{ kind: 'flag', id: 'wind_backed', value: true }],
      line: 'The wind backs two points while you are talking, which anybody who has been at sea eleven weeks can feel through the deck. It puts the convoy a day nearer and it takes an hour off the light.',
      summary: 'The wind backs: the convoy is nearer and the day is shorter.',
    },
    {
      id: 'i_chart_reversal',
      kind: 'reversal',
      when: { all: [{ clock: { gte: 22 } }, { not: { knows: { actor: 'you', fact: 'frigate_truth', correct: true } } }] },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'pencil',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'frigate_truth',
          status: 'observed',
          value: '@canonical',
          source: 'observation',
          fidelity: 1,
          confidence: 0.95,
        },
      ],
      line:
        'You look at the chart properly for the first time and read the note beside the mark rather than the mark: topsails only, hull down, eleven leagues, weather thick from the west. Ship-rigged — which a frigate is, and which half the Dutch merchant fleet also is. Nobody ever saw a gun.',
      summary: 'The chart note surfaces: the sighting never established a frigate at all.',
    },
    {
      id: 'i_ridley_recovery',
      kind: 'recovery',
      when: {
        all: [
          { pressure: { gte: 0.6 } },
          { turns: { gte: 4 } },
          { not: { knows: { actor: 'you', fact: 'real_count' } } },
        ],
      },
      once: true,
      is_rescue: true,
      actor: 'ridley',
      actor_type: 'character',
      verb: 'counts',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'real_count',
          status: 'told',
          value: '@canonical',
          source: 'ridley',
          fidelity: 1,
          confidence: 0.8,
        },
      ],
      line:
        'Ridley says, to the table rather than to anybody, "Nineteen have stood a watch today. I know because I set them." He looks up. "Article Seven. No man votes who has not stood a watch. Nineteen is not twenty-seven and nineteen is not a majority of forty-one."',
      summary: 'Ridley works out from the watch rota that the count cannot be what it was said to be.',
    },
  ],

  // --- what the world does on its own ---------------------------------------
  processes: [
    {
      id: 'w_coyle_goes_up',
      kind: 'actor',
      actor: 'coyle',
      trigger: { when: { all: [{ flag: 'cornered', eq: true }, { clock: { gte: 26 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'position', entity: 'coyle', location: 'deck' },
      ],
      line: 'Coyle says he is wanted on deck, and goes up the ladder without being told he may.',
      summary: 'Coyle leaves the cabin for the deck.',
    },
    {
      id: 'w_talk_spreads',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 10, when: { clock: { gte: 10 } } },
      effects: [{ kind: 'resource', id: 'talk', from: 'world', to: 'you', amount: 1 }],
      line: 'Somebody laughs on deck, once, in the wrong place.',
      summary: 'What is being said in the cabin gets forward.',
    },
  ],

  // --- outcome: four axes that move independently ---------------------------
  outcome_dimensions: [
    {
      key: 'command',
      label: 'The command',
      question: 'Whether you still have a ship in the morning.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'turned', eq: true }, points: 3, note: 'you called a chase, and in a chase nobody votes on anything' },
        { when: { flag: 'stood_against_nothing', eq: true }, points: 4, note: 'you let it come, and there was nothing organized to come' },
        { when: { flag: 'stood_against_someone', eq: true }, points: 0, note: 'you let it come, and somebody had spent nine days preparing it' },
        { when: { flag: 'proposed_clean', eq: true }, points: 3, note: 'you put a course to them yourself and it was your meeting' },
        { when: { flag: 'proposed_to_his_floor', eq: true }, points: 1, note: 'you called the meeting the other man wanted, and he was ready for it' },
      ],
      bands: [
        { at_least: 4, label: 'unshaken' },
        { at_least: 3, label: 'kept' },
        { at_least: 1, label: 'kept for now' },
        { at_least: 0, label: 'gone at dark' },
      ],
    },
    {
      key: 'crew',
      label: 'The company',
      question: 'What the men aboard think of you by morning.',
      min: 0,
      max: 4,
      scoring: [
        { when: { resource: { id: 'talk', holder: 'you', lt: 3 } }, points: 2, note: 'you did not let the whole deck watch you worry' },
        { when: { disposition: { actor: 'tuck', axis: 'trust', gte: 25 } }, points: 1, note: 'the oldest man aboard would stand next to you again' },
        { when: { disposition: { actor: 'ridley', axis: 'trust', gte: 30 } }, points: 1, note: 'the man who navigates for you still would' },
      ],
      bands: [
        { at_least: 4, label: 'with you' },
        { at_least: 2, label: 'waiting to see' },
        { at_least: 0, label: 'done with you' },
      ],
    },
    {
      key: 'purse',
      label: 'The purse',
      question: 'What is left in the strongbox, and whether anyone was paid out of it.',
      min: 0,
      max: 3,
      scoring: [
        { when: { resource: { id: 'coin', holder: 'you', gte: 240 } }, points: 3, note: 'the box is as heavy as it was this morning' },
        { when: { resource: { id: 'coin', holder: 'you', gte: 120, lt: 240 } }, points: 2, note: 'you spent some of what was left buying your way to an answer' },
        { when: { resource: { id: 'coin', holder: 'you', lt: 120 } }, points: 1, note: 'most of what was in the box went on one afternoon' },
      ],
      bands: [
        { at_least: 3, label: 'untouched' },
        { at_least: 2, label: 'lighter' },
        { at_least: 0, label: 'spent' },
      ],
    },
    {
      key: 'truth',
      label: 'What you knew',
      question: 'Whether you found out how it actually stood before you decided what to do about it.',
      min: -2,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'mutiny_driver', correct: true } }, points: 2, note: 'you found out who had actually got it up' },
        { when: { knows: { actor: 'you', fact: 'real_count', correct: true } }, points: 1, note: 'you found out how the vote really stood' },
        { when: { knows: { actor: 'you', fact: 'frigate_truth', correct: true } }, points: 1, note: 'you worked out that nobody had ever seen a frigate' },
        { when: { knows: { actor: 'you', fact: 'mutiny_driver', correct: false } }, points: -2, note: 'you decided while believing something about who was behind it that was not so' },
      ],
      bands: [
        { at_least: 4, label: 'you knew the ship' },
        { at_least: 2, label: 'you found some of it' },
        { at_least: 0, label: 'you decided blind' },
        { at_least: -2, label: 'you decided on something untrue' },
      ],
    },
  ],

  play_dimensions: [
    'force_diplomacy',
    'caution_boldness',
    'solo_coalition',
    'speed_deliberation',
    'control_delegation',
    'preserve_risk',
    'direct_cunning',
    'loyalty_opportunism',
  ],
  world_specific_dimensions: [
    {
      id: 'authority_consent',
      label_left: 'Rule By Right',
      label_right: 'Rule By Consent',
      measures: 'Whether you reached for the authority the articles give you or for the agreement of the men they give it over.',
    },
    {
      id: 'cabin_deck',
      label_left: 'Settle It In The Cabin',
      label_right: 'Take It To The Deck',
      measures: 'Whether you worked it out privately with three men or put it in front of all forty-one.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['turned', 'stood', 'proposed'], message: 'the day ends one way, not three' },
      { flags: ['turned_into_nothing', 'turned_into_it'], message: 'either there was a frigate out there or there was not' },
      { flags: ['stood_against_nothing', 'stood_against_someone'], message: 'either somebody got it up or nobody did' },
    ],
    forbidden: [
      {
        id: 'paid_without_paying',
        when: { all: [{ flag: 'tuck_paid', eq: true }, { resource: { id: 'coin', holder: 'tuck', lt: 1 } }] },
        message: 'the gunner cannot have been paid without coin having moved',
      },
    ],
  },

  content_descriptors: {
    depicted: [
      'a mutiny in prospect aboard a pirate ship, with no violence shown',
      'marooning discussed as a punishment under written articles',
      'bribery, coercion and manoeuvring between men who all signed the same document',
      'historical piracy treated as a workplace with rules',
    ],
    discussable: ['piracy', 'marooning', 'mutiny', 'unpaid men', 'the Royal Navy'],
    player_action_bounds: [
      'you may ask, press, read, pay, send a man on deck, call a chase, face the vote, or put a course to the company',
      'you may not harm anyone; nobody aboard can be hurt and the world will not resolve an attempt',
      'nobody aboard is a real person, and no real ship, crew or engagement is depicted',
    ],
    intensity: 'moderate',
    estimated_minutes: 14,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'That is not a thing this ship will let you do this afternoon.',
    'block.absent': '{name} is not in the cabin. Whatever that was going to be, it waits or it goes up the ladder.',
    'block.dead': 'That is past being any use to anyone.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not to hand, and going for it is its own decision.',
    'block.sealed': '{name} does not open for you — not quietly, and not without everyone hearing it.',
    'block.no_target': 'Somebody says it before you can. "{verb} {whom}?"',
    'block.broke': 'There is not that much left in the box. Every man aboard has a fair idea how much there is.',
    'block.short': 'You have {held} of that and not {wanted}, and there are men on this deck who can count better than you.',
    'block.cold': '{name} looks at you the way he looks at weather coming. Whatever this is, it costs you first.',
    clarify: 'Say which of us you are talking to. {present} — which one?',
    'clarify.2': 'You have to say who, and you have to say what you want out of him.',
    'clarify.3': 'Nobody aboard can read your mind and the light is going. Name one of us, or put your hands on something.',
    'narration.default': 'The cabin resettles around what just happened. Above the deckhead, nobody says anything.',
    'narration.success': 'It lands. Whatever you were reaching for, some of it is yours now.',
    'narration.partial': 'Half of it lands. The other half is still somewhere in this cabin.',
    'narration.failure': 'It does not land, and the light is that much further gone.',
    'narration.backfire': 'It goes wrong in the specific way you were afraid it would.',
    'narration.blocked': 'Nothing about that works, and the cabin lets you know without anybody saying so.',
    'narration.ended': 'It is over. Whatever this is now, it is not a decision any more.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 2 },
};

export default NO_PREY_NO_PAY;
