// THE FAIR COPY — the fifth world.
//
// A drumhead court-martial at two in the morning, 1777. A letter naming an officer of
// your own regiment as a spy, a man in the guardhouse, and a finding due at dawn.
//
// The premise hands the player a certainty on the way in — you know that hand, and it is
// not his — and one of the four things the seed draws is that the certainty is wrong. The
// other three make it a frame, and then the question is whose. Every other world here
// gives the mistaken belief to a character; this one offers it to the player and lets
// them find out whether they were the one holding it.
//
// Everything the run turns on is on the table in the marquee, because nothing in this
// engine moves a player between locations and a route through the guardhouse would be no
// route at all.

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const THE_FAIR_COPY: ScenarioPackage = {
  id: 'ym-the-fair-copy',
  slug: 'the-fair-copy',
  title: 'The Fair Copy',
  tagline: 'A letter naming a spy, in a hand you are certain you know. The finding is due at dawn.',
  format: 'F1',
  genre: 'War, 1777 — a night court-martial in a Continental Army camp. One tent, four men, and a hanging at dawn.',
  category: 'War & Command',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise: 'The president of a night court-martial decides what to do with a letter he believes is a forgery.',
    ending_out_of_time:
      'Dawn arrives while the court is still sitting, which under the articles of war means the court has returned no finding at all. The prisoner goes back to the guardhouse to wait for a court with somebody else at the head of it, and the letter goes into a bag with the general\'s morning mail.',
    setup:
      'It is a little after two in the morning in a Continental Army camp in New Jersey, in the autumn of 1777. ' +
      'Four hours ago a mounted courier was stopped at the picket line, and the letter he was carrying names an ' +
      'officer of your own regiment as a man who has been selling the general\'s dispositions to the British. ' +
      'You are the senior officer present, so the court is yours: it was convened at midnight, it sits in the ' +
      'marquee, and it must return a finding by dawn. The accused is in the guardhouse forty yards away. If the ' +
      'finding goes against him he will be hanged from the elm by the forage store at first light.\n\n' +
      'You have read the letter twice. You have seen that officer\'s handwriting on returns and requisitions ' +
      'for eleven months, and you are certain the letter is not in it.',
    trouble:
      'Being certain is not the same as being right, and it is not evidence either way. If the letter is a ' +
      'forgery then somebody in this camp wrote it, and that somebody is more probably in this tent than in the ' +
      'guardhouse. If it is not a forgery, then the only thing standing between a proven spy and a rope is a ' +
      'senior officer who thinks he recognizes a hand. You have until dawn, four men, and a table with the ' +
      'evidence on it.',
    cold_open:
      'The marquee smells of wet canvas and tallow, and the candles are the short ones because the long ones ' +
      'went to the hospital tent. The letter is on the table with the courier\'s pass beside it and the finding ' +
      'unsigned under both. Adair has not sat down since he brought it in. Kearns has his letter-books under ' +
      'his arm the way a man holds something he has been asked for. Purcell has already written the date at ' +
      'the top of the page.\n\n' +
      '"We can be finished in a quarter of an hour," Purcell says, without looking up. "The general wants it by ' +
      'dawn, and dawn is not a suggestion."',
    example_actions: [
      'hold the letter up to the candle',
      "ask Adair where the courier was riding from",
      "look at Kearns's letter-books",
    ],
    cast_note:
      'Three officers and the prisoner, who was brought up from the guardhouse when the court was convened. Nobody else is awake in this camp who outranks you.',
    clock_label: 'until the court must return a finding',
    house_rules: [
      'Nobody in this tent is neutral, and the man in irons is not automatically the one lying to you. One of them is certain about something and wrong. One of them shades everything he says.',
      'You brought a certainty in with you and the court cannot use it. What you think you recognize is not evidence, and the world will not treat it as any.',
      'Signing the finding ends the night. So does declaring the letter a forgery, and so does naming the man who wrote it. Everything before that, you can still take back.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the president of the court',
      start_location: 'marquee',
      you:
        'You are the senior officer awake in this camp, which is the entire qualification the articles of war ' +
        'require of you tonight. You have signed two findings before and neither of them was a capital one.',
      objective:
        'Return a finding you can live with at dawn — and know what was actually true before you sign it, ' +
        'rather than after.',
      pressure:
        'It is a little after two, the finding is due at dawn, and there is a man forty yards away who has been ' +
        'awake all night for the same reason you have.',
    },
    duration_minutes: 40,
    resources: {
      warrants: { label: 'Orders you can give before the court is no longer yours', holdings: { you: 2 } },
      noise: { label: 'How much of the camp has heard the court is stuck', holdings: { you: 0 } },
    },
    flags: { court_state: 'sitting' },

    opening: {
      prompt:
        'It is 1777, and a courier stopped at the picket line was carrying a letter that names an officer of ' +
        'your own regiment as a spy. You have seen that man\'s handwriting for eleven months and you are certain ' +
        'this is not it. You are the senior officer present, so the court is yours, and it must return a finding ' +
        'by dawn. If it goes against him he hangs at first light.',
      choices: [
        {
          id: 'candle',
          label: 'Hold the letter to the candle',
          preview:
            'Before anybody says anything else about it, you look at the thing itself — the paper, the watermark, the way the ink sat down.',
          move: 'hold the letter up to the candle',
        },
        {
          id: 'courier',
          label: 'Ask where the courier was riding from',
          preview:
            'The whole case is a man on a horse in the dark. You ask the officer who stopped him what road he was actually on.',
          move: 'ask Adair where the courier was riding from',
        },
        {
          id: 'books',
          label: 'Send for the letter-books',
          preview:
            'Every officer in this regiment has signed a return in the last eleven months, and the adjutant has all of them under his arm.',
          move: "look at Kearns's letter-books",
        },
      ],
    },
  },

  locations: [
    {
      id: 'marquee',
      name: 'the marquee',
      description:
        'A table, four candles burnt down to about two hours, the regimental colors rolled in the corner, and rain starting on the canvas.',
      travel_minutes: { camp: 1 },
    },
    {
      id: 'camp',
      name: 'the camp street outside',
      description: 'Mud, tent-lines, a guardhouse forty yards down, and a picket somewhere out in the dark who has been awake since ten.',
      travel_minutes: { marquee: 1 },
    },
  ],

  entities: [
    {
      id: 'letter',
      name: 'the letter',
      kind: 'document',
      description: 'One sheet, folded three times, no seal remaining. It is the whole of the case against him.',
      initial_state: 'on the table',
      location: 'marquee',
      searchable: true,
      portable: true,
      body:
        'Sir —\n\n' +
        'The disposition of the two regiments at the crossing is as I gave it you on the 14th, and is not\n' +
        'altered. He that furnishes it is a Lieutenant of the —— Regiment, and will continue to furnish it\n' +
        'for the consideration already agreed.\n\n' +
        'I am, &c.\n\n' +
        '[The hand is careful, upright and slow — the hand of a man copying rather than composing.]',
    },
    {
      id: 'books',
      name: "the regimental letter-books",
      kind: 'document',
      description: "Every return, requisition and receipt this regiment has filed since the spring, in the hands of the men who wrote them.",
      initial_state: 'under the adjutant\'s arm',
      location: 'marquee',
      searchable: true,
    },
    {
      id: 'pass',
      name: "the courier's pass",
      kind: 'document',
      description: 'Taken off the man at the picket line, along with his horse and his boots.',
      initial_state: 'on the table',
      location: 'marquee',
      searchable: true,
      body:
        'Pass, endorsed at the Trenton ferry, 9 o\'clock in the evening.\n' +
        'Bearer to proceed by the Trenton road on private business of no military character.\n' +
        'Countersigned by an officer whose name has run in the wet.',
    },
    {
      id: 'instructions',
      name: "the general's instructions",
      kind: 'document',
      description: 'Two lines convening the court, in a clerk\'s hand, with something added at the bottom in a different one.',
      initial_state: 'on the table',
      location: 'marquee',
      searchable: true,
      body:
        'A court to be convened this night upon the matter of the intercepted letter, and to return its\n' +
        'finding by dawn.\n\n' +
        '[Added below in a heavier hand:] If the evidence be sound. I will not hang a man upon one letter.',
    },
    {
      id: 'finding',
      name: 'the finding',
      kind: 'document',
      description: 'Written out fair, with the date at the top and a space at the bottom where your name goes.',
      initial_state: 'unsigned',
      location: 'marquee',
      searchable: true,
    },
  ],

  cast: [
    {
      id: 'adair',
      name: 'Adair',
      role: 'the officer who stopped the courier',
      voice:
        'Young, exact, still in his coat from the picket line. Gives you the time of everything to the quarter ' +
        'hour and is proud of it.',
      motive:
        'Have brought in the thing that mattered, and be right about what he saw, because a lieutenant who is ' +
        'right about something in front of the general does not stay a lieutenant.',
      reliability: 'mistaken',
      competence: 0.5,
      start_location: 'marquee',
      intro:
        'The officer of the picket, who stopped the courier at about ten and has been on his feet since. He ' +
        'carried the letter up here himself rather than sending it.',
      leverage: 'He is the only man who saw where the courier came from, and the pass in his pocket is the only paper that says otherwise.',
      starting_disposition: { trust: 30, fear: 20 },
      knows: ['courier_route', 'guard_hour', 'general_order'],
      fallback_lines: {
        default: 'I saw what I saw, sir, and I wrote the hour down at the time.',
        pressed: 'You may ask me again and I will give you the same answer, because it is the same answer.',
      },
    },
    {
      id: 'kearns',
      name: 'Kearns',
      role: 'the regimental adjutant',
      voice:
        'Careful, quiet, answers in the order the question was asked and no further. Says "as to that" before ' +
        'the parts he would rather not.',
      motive:
        'Keep anybody from going through the letter-books with a candle and a purpose, because eleven months of ' +
        'his own arithmetic is in them.',
      reliability: 'deceptive',
      competence: 0.75,
      start_location: 'marquee',
      intro:
        'The adjutant. He keeps the letter-books, the returns and the regiment\'s paper, and he has copied more ' +
        'officers\' hands into them than anybody alive.',
      leverage: 'Every specimen of every officer\'s handwriting in this regiment is under his arm, and he decides how quickly anybody gets to look at it.',
      starting_disposition: { trust: 15, fear: 10 },
      knows: ['whose_hand', 'letter_paper', 'vane_debt'],
      fallback_lines: {
        default: 'As to that, sir, I could not say without the books, and the books take an hour to go through.',
        pressed: 'I have kept this regiment\'s paper for two years without a word said. That is a thing you might weigh.',
      },
    },
    {
      id: 'purcell',
      name: 'Purcell',
      role: 'the judge advocate',
      voice:
        'Brisk, procedural, quotes the articles of war the way other men quote scripture. Ends sentences with ' +
        '"and that is the whole of it" when it is not.',
      motive:
        'Have a signed finding in the general\'s hand at dawn, because a court that returns nothing is a court ' +
        'that was badly run, and he is the man who ran it.',
      reliability: 'self_serving',
      competence: 0.8,
      start_location: 'marquee',
      intro:
        'The judge advocate, sent down from brigade to sit with the court and see that it is done properly. He ' +
        'has the general\'s instructions and he has already written out the finding.',
      leverage: 'He wrote the finding, he holds the general\'s instructions, and he decides what goes up to brigade about how this court was conducted.',
      starting_disposition: { trust: 10, fear: 0 },
      knows: ['general_order', 'guard_hour'],
      fallback_lines: {
        default: 'The articles are quite clear on that, and that is the whole of it.',
        pressed: 'You may take that tone with me. It will be in what I write about tonight, but you may take it.',
      },
    },
    {
      id: 'vane',
      name: 'Vane',
      role: 'the accused',
      voice:
        'Quiet, tired, answers the question asked and stops. Has been awake since the guard came for him and has ' +
        'not asked anybody for anything.',
      motive:
        'Not hang, and not say the one thing that would help him most, because saying it puts somebody else on ' +
        'the end of the same rope.',
      reliability: 'evasive',
      competence: 0.6,
      start_location: 'marquee',
      intro:
        'The lieutenant the letter names. He was brought up from the guardhouse when the court was convened and ' +
        'he is standing at the end of the table without his sword.',
      leverage: 'He knows why he was on the Trenton road in September, and he has decided not to say it.',
      starting_disposition: { trust: 5, fear: 45 },
      knows: ['vane_debt', 'vane_errand'],
      fallback_lines: {
        default: 'I did not write that letter, sir. I have said so and I will keep saying so.',
        pressed: 'Ask me a different question and I will answer it. Ask me that one again and I will not.',
      },
    },
  ],

  facts: [
    {
      id: 'whose_hand',
      statement: 'The letter was written by {value}.',
      question: 'whose hand actually wrote the letter',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_hand_books', 'p_hand_cornered'],
      required_for_top_outcome: true,
    },
    {
      id: 'courier_route',
      statement: 'The courier was riding from {value}.',
      question: 'where the courier had actually come from',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_route_pass', 'p_route_adair'],
      required_for_top_outcome: true,
    },
    {
      id: 'letter_paper',
      statement: 'The paper the letter is written on {value}.',
      question: 'where the paper itself came from',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_paper_candle', 'p_paper_kearns'],
      required_for_top_outcome: true,
    },
    {
      id: 'general_order',
      statement: "The general's instructions say {value}.",
      question: 'what the general actually asked this court for',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_order_read', 'p_order_purcell'],
    },
    {
      id: 'vane_debt',
      statement: 'The accused owes {value}.',
      question: 'what the accused owes and to whom',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_debt_vane', 'p_debt_kearns'],
    },
    {
      id: 'vane_errand',
      statement: 'The accused was on the Trenton road in September because {value}.',
      question: 'what the accused will not say about the Trenton road',
      category: 'supporting',
      sensitivity: 'hidden',
      discoverable_via: ['p_errand_vane'],
    },
    {
      id: 'guard_hour',
      statement: 'The courier was stopped at {value}.',
      question: 'what hour the courier was actually stopped',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_hour_adair'],
    },
  ],

  discovery_paths: [
    // --- whose_hand -----------------------------------------------------------
    {
      id: 'p_hand_books',
      fact: 'whose_hand',
      description: 'Go through the letter-books yourself with a candle, comparing the letter against eleven months of returns.',
      via_verb: ['read'],
      via_target: ['books'],
      requires: { knows: { actor: 'you', fact: 'letter_paper', correct: true } },
      cost_minutes: 4,
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_hand_cornered',
      fact: 'whose_hand',
      description: 'Put the paper and the road together in front of the man who keeps the regiment\'s paper, and let him answer both at once.',
      requires: {
        all: [
          { knows: { actor: 'you', fact: 'letter_paper', correct: true } },
          { knows: { actor: 'you', fact: 'courier_route', correct: true } },
        ],
      },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },
    {
      id: 'p_hand_kearns_free',
      fact: 'whose_hand',
      description: 'Ask the adjutant whose hand it is, and take the answer of a man who is one of the possible answers.',
      via_verb: ['ask'],
      via_target: ['kearns'],
      requires: { not: { knows: { actor: 'you', fact: 'letter_paper', correct: true } } },
      topic_hints: ['hand', 'handwriting', 'wrote', 'writing', 'whose', 'who', 'forged', 'forgery', 'copy'],
      disclosure: {
        status: 'told',
        value: 'a clerk at brigade whose name he would have to look up',
        confidence: 0.45,
        fidelity: 0.3,
        distortion: 'an answer that sends the court somewhere it cannot go tonight',
      },
    },

    // --- courier_route: the young officer's sincere mistake -------------------
    {
      id: 'p_route_pass',
      fact: 'courier_route',
      description: 'Read the pass that was taken off the courier, rather than the account of the man who took it.',
      via_verb: ['read'],
      via_target: ['pass'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_route_adair',
      fact: 'courier_route',
      description: 'Ask the officer of the picket what road the man was on, and listen for what he saw against what he concluded.',
      via_verb: ['ask', 'press'],
      via_target: ['adair'],
      requires: { knows: { actor: 'adair', fact: 'courier_route' } },
      topic_hints: ['road', 'riding', 'rode', 'from', 'where', 'came', 'direction', 'tent', 'lines', 'picket'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85, fidelity: 0.9 },
    },

    // --- letter_paper ---------------------------------------------------------
    {
      id: 'p_paper_candle',
      fact: 'letter_paper',
      description: 'Hold the letter up to a candle and look at the paper instead of the words on it.',
      via_verb: ['read'],
      via_target: ['letter'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_paper_kearns',
      fact: 'letter_paper',
      description: 'Ask the man who issues the regiment\'s paper where a sheet like that comes from.',
      via_verb: ['ask', 'press'],
      via_target: ['kearns'],
      requires: { knows: { actor: 'kearns', fact: 'letter_paper' } },
      topic_hints: ['paper', 'sheet', 'watermark', 'stock', 'issued', 'where', 'made', 'book'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },

    // --- the rest -------------------------------------------------------------
    {
      id: 'p_order_read',
      fact: 'general_order',
      description: "Read the general's instructions to the bottom, including the part added in a different hand.",
      via_verb: ['read'],
      via_target: ['instructions'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_order_purcell',
      fact: 'general_order',
      description: 'Ask the judge advocate what the general actually asked for, and make him say all of it.',
      via_verb: ['ask', 'press'],
      via_target: ['purcell'],
      topic_hints: ['general', 'order', 'orders', 'asked', 'wants', 'required', 'dawn', 'finding', 'instructed'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75 },
    },
    {
      id: 'p_debt_vane',
      fact: 'vane_debt',
      description: 'Ask the accused what he owes and to whom, which is a question he can answer without hurting anybody.',
      via_verb: ['ask', 'press'],
      via_target: ['vane'],
      topic_hints: ['owe', 'owes', 'debt', 'money', 'borrowed', 'pay', 'paid', 'card', 'cards'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_debt_kearns',
      fact: 'vane_debt',
      description: 'Ask the adjutant what is owed in this regiment and by whom, because he keeps that too.',
      via_verb: ['ask', 'press'],
      via_target: ['kearns'],
      topic_hints: ['owe', 'owes', 'debt', 'money', 'accounts', 'books', 'borrowed'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75 },
    },
    {
      id: 'p_errand_vane',
      fact: 'vane_errand',
      description: 'Give the accused your word about somebody else, and then ask him the question he has been refusing.',
      via_verb: ['ask', 'press'],
      via_target: ['vane'],
      requires: { flag: 'vane_assured', eq: true },
      topic_hints: ['trenton', 'road', 'september', 'why', 'doing', 'errand', 'business', 'there'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.9 },
    },
    {
      id: 'p_hour_adair',
      fact: 'guard_hour',
      description: 'Ask the officer of the picket what hour it was. He wrote it down at the time.',
      via_verb: ['ask', 'press'],
      via_target: ['adair'],
      topic_hints: ['hour', 'time', 'when', 'clock', 'stopped', 'ten', 'night'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.95 },
    },
  ],

  // --- canonical truth, drawn once from the seed ----------------------------
  truth_template: {
    variables: [
      {
        id: 'hand',
        kind: 'choice',
        // The last one is the answer the player walked in certain could not be true.
        choices: [
          'the adjutant, in a hand he has been practising out of his own letter-books',
          'a British officer at Perth Amboy who has never met any of you, and meant it to be found',
          'a woman in Trenton who was paid four dollars and told what to put in it',
          'the accused himself, written slowly and fair so that a clerk could read it',
        ],
        weights: [3, 3, 2, 2],
      },
    ],
    facts: {
      whose_hand: { from_variable: 'hand' },
      courier_route: {
        value: 'the Trenton road, which passes within a hundred yards of the tent lines and does not begin at any of them',
      },
      letter_paper: { value: 'was torn from a regimental letter-book, and the rule-lines still run across the back of it' },
      general_order: { value: 'a finding by dawn if the evidence be sound, and under it, in his own hand, that he will not hang a man upon one letter' },
      vane_debt: { value: 'the adjutant nineteen dollars, lost at cards in July and never asked for since' },
      vane_errand: { value: 'he was carrying money to a widow in Trenton whose husband died at his side, and told nobody' },
      guard_hour: { value: 'about ten in the evening, which the officer of the picket wrote down at the time' },
    },
    bindings: { forger: 'hand' },
  },

  // --- who holds what, before the first action ------------------------------
  holds: [
    // The officer of the picket is sincerely wrong about the one thing his whole account
    // rests on: he saw a rider near the tent lines and concluded a rider from them.
    {
      actor: 'adair',
      fact: 'courier_route',
      status: 'believed_false',
      value: "the accused's own tent, and he came out past the sentry at a walk",
      confidence: 0.9,
    },
    // The adjutant knows what the paper is, because he issues it.
    { actor: 'kearns', fact: 'letter_paper', status: 'observed', value: '@canonical', confidence: 1 },
    // Whoever wrote it knows perfectly well that they did.
    { actor: '@forger', fact: 'whose_hand', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'vane', fact: 'vane_errand', status: 'observed', value: '@canonical', confidence: 1 },
  ],

  // --- the action space -----------------------------------------------------
  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'examine him', 'put it to'],
      description: 'Put a question to one of the men in this tent.',
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
      aliases: ['press', 'push', 'confront', 'demand', 'insist', 'accuse of lying', 'lean on'],
      description: 'Stop being courteous about a question, in front of the whole court.',
      default_minutes: 4,
      requires_target: true,
      speech: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 1 }],
        backfire: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: -20 },
          { kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 2 },
        ],
      },
      play_signals: [
        { dimension: 'force_diplomacy', direction: -0.7, strength: 0.8, context: 'You applied pressure rather than waiting for them to come around.' },
        { dimension: 'direct_cunning', direction: -0.5, strength: 0.5, context: 'You made it obvious what you wanted.' },
      ],
    },
    {
      id: 'read',
      label: 'Look at',
      aliases: ['read', 'look at', 'look', 'check', 'examine', 'study', 'hold', 'search', 'go through', 'compare'],
      description: 'Put your own eyes on something on that table, with a candle if it needs one.',
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
      aliases: ['tell', 'explain', 'warn', 'show', 'inform', 'state'],
      description: 'Put something you have worked out in front of the court.',
      default_minutes: 3,
      requires_target: true,
      speech: true,
      base_difficulty: 0.08,
      effects_by_outcome: {
        success: [{ kind: 'disposition', actor: '@target', axis: 'trust', delta: 6 }],
      },
      play_signals: [
        { dimension: 'direct_cunning', direction: -0.7, strength: 0.6, context: 'You gave something away rather than holding it.' },
        { dimension: 'solo_coalition', direction: 0.4, strength: 0.45, context: 'You put what you knew into the room.' },
      ],
    },
    {
      id: 'assure',
      label: 'Give your word',
      aliases: ['assure', 'my word', 'give my word', 'give you my word', 'promise', 'guarantee', 'swear', 'undertake', 'protect'],
      description: 'Put your own word on the table for somebody else. It is the only thing in this tent that is yours to spend.',
      default_minutes: 3,
      requires_target: true,
      speech: true,
      base_difficulty: 0.15,
      chip_when: { turns: { gte: 1 } },
      play_signals: [
        { dimension: 'force_diplomacy', direction: 0.75, strength: 0.8, context: 'You gave something of your own instead of demanding.' },
        { dimension: 'loyalty_opportunism', direction: -0.5, strength: 0.6, context: 'You put yourself between somebody and the thing coming for them.' },
      ],
    },
    {
      id: 'order',
      label: 'Give an order',
      aliases: ['order', 'send for', 'summon', 'command', 'have him', 'direct', 'call for'],
      description: 'Use the authority the court gives you. You have two of these before it stops being yours.',
      default_minutes: 4,
      requires_target: true,
      base_difficulty: 0.2,
      chip_when: { resource: { id: 'warrants', holder: 'you', gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 1 }],
      },
      play_signals: [
        { dimension: 'control_delegation', direction: -0.7, strength: 0.7, context: 'You gave the order rather than asking whether it would be carried out.' },
        { dimension: 'force_diplomacy', direction: -0.4, strength: 0.5, context: 'You used the authority you had rather than persuading.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'say nothing', 'do nothing', 'think', 'listen', 'let it sit', 'adjourn a moment'],
      description: 'Let the tent go quiet and see who cannot stand it.',
      default_minutes: 3,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'sign',
      label: 'Sign the finding',
      aliases: ['sign', 'sign the finding', 'sign it', 'convict', 'find him guilty', 'let it stand', 'confirm the finding'],
      description: 'Put your name at the bottom of the page as it is written.',
      commitment_line:
        'You signed it, and Purcell blotted it and folded it and put it inside his coat, and at some point between here and first light it stops being a piece of paper and becomes a rope and an elm tree.',
      default_minutes: 2,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.05,
      chip_when: { clock: { gte: 8 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.4, strength: 0.7, context: 'You took the version of the night that was already written.' },
        { dimension: 'control_delegation', direction: -0.5, strength: 0.6, context: 'You settled it with your own name rather than reopening it.' },
      ],
    },
    {
      id: 'quash',
      label: 'Call it a forgery',
      aliases: ['quash', 'call it a forgery', 'declare it a forgery', 'it is a forgery', 'dismiss the charge', 'throw it out', 'acquit', 'find him not guilty', 'refuse to sign'],
      description: 'Declare the letter false, dismiss the charge, and answer for it at dawn yourself.',
      commitment_line:
        'You said the word forgery in front of a judge advocate who wrote it down, dismissed the charge, and sent a man back to his tent instead of to an elm. Whatever the truth turns out to be, that is now a thing you did and will keep having done.',
      default_minutes: 2,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.2,
      chip_when: { clock: { gte: 8 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.7, strength: 0.85, context: 'You put yourself between the court and its finding.' },
        { dimension: 'preserve_risk', direction: 0.6, strength: 0.7, context: 'You spent your own standing rather than the prisoner\'s neck.' },
      ],
    },
    {
      id: 'charge',
      label: 'Name the forger',
      aliases: ['name the forger', 'name him', 'charge', 'arrest', 'accuse', 'have him arrested', 'put him in irons'],
      description: 'Say who wrote it, in front of the court, and put him in the prisoner\'s place.',
      commitment_line:
        'You named him in front of the court and the judge advocate wrote the name down, and after that there was no version of the morning in which you had not.',
      default_minutes: 3,
      requires_target: true,
      commitment: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 3 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.8, strength: 0.9, context: 'You went further than the night required of you.' },
        { dimension: 'force_diplomacy', direction: -0.6, strength: 0.7, context: 'You settled it by naming somebody.' },
      ],
    },
  ],

  // --- the handful of beats the designer must control (L5) ------------------
  overrides: [
    {
      id: 'o_assure_vane',
      priority: 100,
      when: { verb: ['assure'], target: ['vane'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'vane_assured', value: true },
        { kind: 'disposition', actor: 'vane', axis: 'trust', delta: 30 },
        { kind: 'disposition', actor: 'vane', axis: 'fear', delta: -15 },
      ],
      play_signals: [
        { dimension: 'loyalty_opportunism', direction: -0.7, strength: 0.8, context: 'You gave your word to the person with the least to give you back.' },
      ],
      summary:
        'You say it plainly, to him and in front of all of them: that whatever he tells this court about September, no other name in it will leave this tent tonight. Vane looks at you for a long moment. "Then ask me," he says.',
    },
    {
      id: 'o_corner_kearns',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['kearns'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'letter_paper', correct: true } },
            { knows: { actor: 'you', fact: 'courier_route', correct: true } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'cornered', value: true },
        { kind: 'disposition', actor: 'kearns', axis: 'fear', delta: 30 },
        { kind: 'disposition', actor: 'kearns', axis: 'trust', delta: -10 },
      ],
      reveals: [{ fact: 'whose_hand', to: 'you', status: 'observed', via: 'p_hand_cornered' }],
      play_signals: [
        { dimension: 'force_diplomacy', direction: -0.6, strength: 0.7, context: 'You used what you had found as leverage the moment you had it.' },
        { dimension: 'caution_boldness', direction: -0.3, strength: 0.4, context: 'You made sure before you moved.' },
      ],
      summary:
        'You put the sheet down where the candle is behind it so the rule-lines show through, and next to it the pass endorsed at the Trenton ferry, and you ask the adjutant to account for both without moving your eyes off him. Adair says "the ferry?" quietly, to nobody. Kearns does not answer for rather a long time, and the answer is in how long.',
    },
    {
      id: 'o_sign_guilty',
      priority: 110,
      when: { verb: ['sign'], pred: { truth: { fact: 'whose_hand', eq: 'the accused himself, written slowly and fair so that a clerk could read it' } } },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'signed', value: true },
        { kind: 'flag', id: 'signed_the_guilty', value: true },
        { kind: 'flag', id: 'court_state', value: 'returned' },
      ],
      summary:
        'You sign it. The hand on the letter was his own after all, written slow and fair the way a man writes when he knows somebody else will have to read it, and the certainty you carried into this tent was the only forgery in it.',
    },
    {
      id: 'o_sign',
      priority: 100,
      when: { verb: ['sign'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'signed', value: true },
        { kind: 'flag', id: 'signed_the_innocent', value: true },
        { kind: 'flag', id: 'court_state', value: 'returned' },
      ],
      summary:
        'You sign it. Somewhere out in the dark the man who actually wrote that letter is going to hear at breakfast that the court sat all night and found for him.',
    },
    {
      id: 'o_quash_right',
      priority: 110,
      when: { verb: ['quash'], pred: { not: { truth: { fact: 'whose_hand', eq: 'the accused himself, written slowly and fair so that a clerk could read it' } } } },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'quashed', value: true },
        { kind: 'flag', id: 'quashed_a_forgery', value: true },
        { kind: 'flag', id: 'court_state', value: 'dismissed' },
      ],
      summary:
        'You call it a forgery and dismiss the charge, and you are right, and being right is going to be worth considerably less to you by nine o\'clock than it is at this moment.',
    },
    {
      id: 'o_quash',
      priority: 100,
      when: { verb: ['quash'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'quashed', value: true },
        { kind: 'flag', id: 'quashed_the_truth', value: true },
        { kind: 'flag', id: 'court_state', value: 'dismissed' },
      ],
      summary:
        'You call it a forgery and dismiss the charge. The letter was in his own hand and you have just sent it back out to a tent in the same camp as the general\'s dispositions.',
    },
    {
      id: 'o_charge_kearns_right',
      priority: 110,
      when: {
        verb: ['charge'],
        target: ['kearns'],
        pred: { truth: { fact: 'whose_hand', eq: 'the adjutant, in a hand he has been practising out of his own letter-books' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'charged', value: true },
        { kind: 'flag', id: 'charged_rightly', value: true },
        { kind: 'flag', id: 'court_state', value: 'turned' },
      ],
      summary:
        'You name him, and the thing that convinces the court is not your evidence. It is that the adjutant does not say a single word in his own defense, and every man in the tent notices at the same moment.',
    },
    {
      id: 'o_charge',
      priority: 100,
      when: { verb: ['charge'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'charged', value: true },
        { kind: 'flag', id: 'charged_wrongly', value: true },
        { kind: 'flag', id: 'court_state', value: 'turned' },
      ],
      summary:
        'You name him in front of the court. He denies it in the way an innocent man denies a thing, which is to say badly, and Purcell writes down both the name and the hour you said it.',
    },
  ],

  // --- the Director's library ------------------------------------------------
  injects: [
    {
      id: 'i_purcell_presses',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      once: true,
      actor: 'purcell',
      actor_type: 'character',
      verb: 'presses',
      demands_response: true,
      effects: [{ kind: 'flag', id: 'court_pressed', value: true }],
      line: 'Purcell turns the finding around so it is facing you and puts the pen down on top of it. "It wants a name at the bottom, sir. It has wanted one since midnight."',
      summary: 'The judge advocate puts the unsigned finding in front of you.',
    },
    {
      id: 'i_rain',
      kind: 'pressure',
      when: { always: true },
      min_clock: 12,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'rain',
      effects: [{ kind: 'flag', id: 'raining', value: true }],
      line: 'The rain comes on properly and the canvas begins to drum, and somebody outside starts moving the ammunition carts under cover, which means the whole camp is awake now and will want to know why the court is still sitting.',
      summary: 'The rain wakes the camp.',
    },
    {
      id: 'i_kearns_offers',
      kind: 'reveal',
      when: {
        all: [
          { turns: { gte: 3 } },
          { not: { knows: { actor: 'you', fact: 'letter_paper', correct: true } } },
        ],
      },
      once: true,
      actor: 'kearns',
      actor_type: 'character',
      verb: 'offers',
      demands_response: true,
      effects: [],
      line: 'Kearns shifts the letter-books from one arm to the other. "If the court wishes me to go through these, sir, I will, but it is an hour\'s work and there are two hours of candle. I would rather be told what we are looking for."',
      summary: 'The adjutant offers to search the books himself, and asks what for.',
    },
    {
      id: 'i_vane_speaks',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 4 } }, { not: { flag: 'vane_assured', eq: true } }] },
      once: true,
      actor: 'vane',
      actor_type: 'character',
      verb: 'speaks',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'vane', axis: 'fear', delta: 10 }],
      line: 'Vane speaks for the first time without being asked. "Sir. There is a thing I could tell this court that would answer it. I am not going to, and I would rather you did not spend the night working out why."',
      summary: 'The accused says there is something he will not tell the court.',
    },
    {
      id: 'i_pass_reversal',
      kind: 'reversal',
      when: { all: [{ clock: { gte: 18 } }, { not: { knows: { actor: 'you', fact: 'courier_route', correct: true } } }] },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'ferry',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'courier_route',
          status: 'observed',
          value: '@canonical',
          source: 'observation',
          fidelity: 1,
          confidence: 0.95,
        },
      ],
      line:
        'You pick up the courier\'s pass to move it off the finding and read it properly for the first time: endorsed at the Trenton ferry at nine in the evening, to proceed by the Trenton road. The Trenton road runs a hundred yards outside the tent lines. A man on it passes the lines. He does not come out of them.',
      summary: 'The pass surfaces: the courier was on the Trenton road, not riding out of the camp.',
    },
    {
      id: 'i_adair_recovery',
      kind: 'recovery',
      when: {
        all: [
          { pressure: { gte: 0.6 } },
          { turns: { gte: 4 } },
          { not: { knows: { actor: 'you', fact: 'general_order' } } },
        ],
      },
      once: true,
      is_rescue: true,
      actor: 'adair',
      actor_type: 'character',
      verb: 'reads',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'general_order',
          status: 'told',
          value: '@canonical',
          source: 'adair',
          fidelity: 1,
          confidence: 0.85,
        },
      ],
      line:
        'Adair, who has been reading the general\'s instructions upside down for an hour because there is nowhere else to look, says: "Sir — there is a line under it in a different hand. It says if the evidence be sound. It says he will not hang a man upon one letter."',
      summary: 'Adair reads out the line the general added under the instructions.',
    },
  ],

  // --- what the world does on its own ---------------------------------------
  processes: [
    {
      id: 'w_kearns_steps_out',
      kind: 'actor',
      actor: 'kearns',
      trigger: { when: { all: [{ flag: 'cornered', eq: true }, { clock: { gte: 24 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'position', entity: 'kearns', location: 'camp' },
      ],
      line: 'Kearns says he will fetch the older books, and goes out into the rain still carrying the ones he had.',
      summary: 'The adjutant leaves the marquee.',
    },
    {
      id: 'w_camp_wakes',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 10, when: { clock: { gte: 10 } } },
      effects: [{ kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 1 }],
      line: 'Somewhere down the tent-line a man asks another man what is happening in the marquee, loudly enough to carry.',
      summary: 'Word of the court spreads through the camp.',
    },
  ],

  // --- outcome: four axes that move independently ---------------------------
  outcome_dimensions: [
    {
      key: 'finding',
      label: 'The finding',
      question: 'What the court actually returned, measured against what was true.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'quashed_a_forgery', eq: true }, points: 4, note: 'you called a forgery a forgery and a man went back to his tent' },
        { when: { flag: 'charged_rightly', eq: true }, points: 4, note: 'you named the man who wrote it, and it was the man who wrote it' },
        { when: { flag: 'signed_the_guilty', eq: true }, points: 3, note: 'you signed, and the hand on the letter really was his' },
        { when: { flag: 'charged_wrongly', eq: true }, points: 1, note: 'you named somebody, and it was not who wrote it' },
        { when: { flag: 'quashed_the_truth', eq: true }, points: 0, note: 'you dismissed a charge that was true and sent him back to camp' },
        { when: { flag: 'signed_the_innocent', eq: true }, points: 0, note: 'you signed, and the man will hang for a letter he never wrote' },
      ],
      bands: [
        { at_least: 4, label: 'right, and provably' },
        { at_least: 3, label: 'right' },
        { at_least: 1, label: 'half of it' },
        { at_least: 0, label: 'wrong, and at dawn' },
      ],
    },
    {
      key: 'standing',
      label: 'Your standing',
      question: 'What brigade will hear about how this court was run.',
      min: 0,
      max: 4,
      scoring: [
        { when: { resource: { id: 'noise', holder: 'you', lt: 3 } }, points: 2, note: 'the camp went back to sleep without a story' },
        { when: { disposition: { actor: 'purcell', axis: 'trust', gte: 10 } }, points: 1, note: 'the judge advocate will write that the court was properly run' },
        { when: { resource: { id: 'warrants', holder: 'you', gte: 1 } }, points: 1, note: 'you did not spend all of your authority in one night' },
      ],
      bands: [
        { at_least: 4, label: 'unmarked' },
        { at_least: 2, label: 'talked about' },
        { at_least: 0, label: 'answered for' },
      ],
    },
    {
      key: 'word',
      label: 'Your word',
      question: 'Whether the promise you made in this tent is one you could still keep in the morning.',
      min: 0,
      max: 3,
      scoring: [
        { when: { not: { flag: 'vane_assured', eq: true } }, points: 2, note: 'you promised nobody anything' },
        { when: { all: [{ flag: 'vane_assured', eq: true }, { not: { flag: 'charged_wrongly', eq: true } }] }, points: 3, note: 'you gave your word and did not have to break it' },
        { when: { all: [{ flag: 'vane_assured', eq: true }, { flag: 'charged_wrongly', eq: true }] }, points: 0, note: 'you gave your word and then put the wrong name in front of the court anyway' },
      ],
      bands: [
        { at_least: 3, label: 'kept' },
        { at_least: 2, label: 'unspent' },
        { at_least: 0, label: 'broken' },
      ],
    },
    {
      key: 'truth',
      label: 'What you knew',
      question: 'Whether you found out whose hand it was before you decided what to do about it.',
      min: -2,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'whose_hand', correct: true } }, points: 2, note: 'you found out whose hand it actually was' },
        { when: { knows: { actor: 'you', fact: 'courier_route', correct: true } }, points: 1, note: 'you worked out that the courier was never riding out of this camp' },
        { when: { knows: { actor: 'you', fact: 'letter_paper', correct: true } }, points: 1, note: 'you saw where the paper itself had come from' },
        { when: { knows: { actor: 'you', fact: 'whose_hand', correct: false } }, points: -2, note: 'you decided while believing something about the hand that was not so' },
      ],
      bands: [
        { at_least: 4, label: 'you knew the tent' },
        { at_least: 2, label: 'you found some of it' },
        { at_least: 0, label: 'you decided on a feeling' },
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
      id: 'procedure_conscience',
      label_left: 'Follow The Procedure',
      label_right: 'Answer For It Yourself',
      measures: 'Whether you let the court do what courts do or put your own name in front of it.',
    },
    {
      id: 'paper_people',
      label_left: 'Believe The Paper',
      label_right: 'Believe The Men',
      measures: 'Whether you settled it out of documents on a table or out of what people told you.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['signed', 'quashed', 'charged'], message: 'a court returns one finding, not three' },
      { flags: ['signed_the_guilty', 'signed_the_innocent'], message: 'the hand was his or it was not' },
      { flags: ['quashed_a_forgery', 'quashed_the_truth'], message: 'the letter was false or it was not' },
      { flags: ['charged_rightly', 'charged_wrongly'], message: 'the name was the right one or it was not' },
    ],
    forbidden: [
      {
        id: 'assured_without_promising',
        when: { all: [{ flag: 'vane_assured', eq: true }, { disposition: { actor: 'vane', axis: 'trust', lt: 6 } }] },
        message: 'a man cannot have been given your word and be no readier to speak than before',
      },
    ],
  },

  content_descriptors: {
    depicted: [
      'a military court-martial with a capital sentence in prospect, and no execution shown',
      'a man held in irons and questioned by officers who outrank him',
      'coercion, procedural pressure and a possible frame-up between officers',
      'the American Revolutionary War treated as a workplace with rules',
    ],
    discussable: ['espionage', 'hanging as a sentence', 'debt', 'perjury', 'a soldier killed in an earlier action'],
    player_action_bounds: [
      'you may question, press, read, give your word, give an order, sign the finding, call the letter a forgery, or name the man who wrote it',
      'you may not harm anyone; nobody in this tent can be hurt and the world will not resolve an attempt',
      'nobody here is a real person, and no real regiment, officer or trial is depicted',
    ],
    intensity: 'strong',
    estimated_minutes: 15,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'That is not a thing this court can do at two in the morning.',
    'block.absent': '{name} is not in the marquee. Whatever that was going to be, it waits or it goes out into the rain.',
    'block.dead': 'That is past being any use to anyone.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not on this table, and going for it is its own decision.',
    'block.sealed': '{name} does not open for you, and every man here would see you try.',
    'block.no_target': 'Purcell lets the pause run and then says it for you. "{verb} {whom}, sir?"',
    'block.broke': 'You have nothing like that left to give tonight, and everybody in this tent has been counting.',
    'block.short': 'You have {held} of that and not {wanted}, and this is a room full of men who keep books.',
    'block.cold': '{name} looks at you the way a man looks at weather he has to stand in. Whatever this is, it costs you first.',
    clarify: 'Say which of us you are addressing. {present} — which?',
    'clarify.2': 'You have to say who, sir, and you have to say what you want of him.',
    'clarify.3': 'Nobody in this tent can read your mind and there are two hours of candle. Name one of us, or pick something up off that table.',
    'narration.default': 'The marquee resettles around what just happened. The rain keeps on at the canvas.',
    'narration.success': 'It lands. Whatever you were reaching for, some of it is yours now.',
    'narration.partial': 'Half of it lands. The other half is still somewhere in this tent.',
    'narration.failure': 'It does not land, and the candle is that much shorter.',
    'narration.backfire': 'It goes wrong in the specific way you were afraid it would.',
    'narration.blocked': 'Nothing about that works, and the tent lets you know without anybody saying so.',
    'narration.ended': 'It is over. Whatever this is now, it is not a decision any more.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 2 },
};

export default THE_FAIR_COPY;
