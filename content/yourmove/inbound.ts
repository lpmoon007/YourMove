// INBOUND — the fourth world on the War & Command shelf, and the first on it that is not
// an officer in a tent.
//
// The other three ask where the reserve goes, whether a man hangs, and whether you keep
// command. This one asks a question none of them do: WHAT IS IT. Everything in the room
// is an instrument, every instrument is telling you something slightly different, and the
// irreversible act takes four seconds.
//
// The shape the engine needs, and where it is:
//   - one hidden thing drawn from the seed: what the contact actually is, and only one of
//     the four answers makes the shot the right one
//   - a character who is sincerely wrong and sure of it (the air warfare officer, reading
//     a track the system has smoothed for him)
//   - a character who heard something twenty minutes ago and did not log it
//   - a character who is neither, and wants this engaged for a reason of his own
//   - every fact that matters reachable two ways: through a person, and through an instrument

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const INBOUND: ScenarioPackage = {
  id: 'ym-inbound',
  slug: 'inbound',
  title: 'Inbound',
  tagline: 'Something is closing at four hundred knots and will not answer. You have fourteen minutes and four seconds of decision.',
  format: 'F1',
  genre: 'War — a warship\'s operations room at night, in the third week of a war nobody has declared.',
  category: 'War & Command',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise:
      'The captain of a frigate decides, in the fourteen minutes before an unidentified air contact reaches ' +
      'minimum engagement range, whether to fire on it, hold and keep challenging, or turn the ship away.',
    ending_out_of_time:
      'The contact reaches minimum range while the four of you are still talking, and after that the launcher ' +
      'cannot be brought to bear at all. Whatever it is, it goes over the top of you, and you find out what ' +
      'it was the way everybody else does.',
    setup:
      'You have command of a frigate on picket eleven miles ahead of a convoy, in the third week of a war ' +
      'that neither government has declared. Two nights ago a ship on this station was hit by an aircraft ' +
      'that was inside minimum range before anybody looked up. At 0212 your radar picked up a contact ' +
      'inbound from the north-west at four hundred knots. It has not answered the international distress ' +
      'frequency, it is not squawking anything your interrogator recognizes, and in fourteen minutes it will ' +
      'be close enough that the launcher on the foredeck cannot be brought round in time.',
    trouble:
      'Your air warfare officer says it is descending on an attack profile and wants it engaged now. Your ' +
      'operations officer agrees with him and has agreed with him rather too quickly. The rating on the ' +
      'radios has said the guard frequency has been quiet all watch, and said it in a way you have heard ' +
      'before. Everything in this room is an instrument, and every instrument is telling you something ' +
      'slightly different about the same eleven miles of sky.',
    cold_open:
      'The operations room is dark except for the displays and it smells of hot electronics and somebody\'s ' +
      'cold tea. The contact is a symbol on the plot with a number beside it and the number is getting ' +
      'smaller. Halvard has one hand flat on the console and is watching the track. Osei is standing at your ' +
      'shoulder where the second always stands. Pryce has both headphones on one ear and the other pushed ' +
      'back, which is what she does when she is listening to two things.\n\n' +
      'Halvard says it without turning round. "Descending and accelerating. That is a profile, sir. That is ' +
      'the same profile as Tuesday."',
    example_actions: [
      'ask Halvard where the track data comes from',
      'look at the air corridor chart',
      'ask Pryce why the interrogator is giving us nothing',
    ],
    cast_note:
      'Three of your people and you, in a dark room. Everybody else aboard is at action stations and cannot help you with this.',
    clock_label: 'before it is inside minimum range',
    house_rules: [
      'Everything you know about that contact came off an instrument, and every instrument in this room presents you a conclusion rather than what it actually received. One of your people is certain of a conclusion the raw returns do not support. One heard something twenty minutes ago and did not write it down. One wants this engaged and has a reason he has not given you.',
      'Engaging ends it. So does holding, and so does turning away. Everything before that, you can still take back.',
      'You have three challenges left on the guard frequency, and each one tells the contact exactly where you are.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the captain',
      start_location: 'ops',
      you:
        'You have had this ship for nine months and this station for four nights. There is nobody above you ' +
        'within two hours of here, the convoy behind you is eleven miles of other people\'s lives, and the ' +
        'decision is yours in the way that decisions are yours at two in the morning.',
      objective:
        'Work out what that contact actually is before it is inside minimum range — and do the right thing ' +
        'about it, which is not always the same as the safe thing for this ship.',
      pressure:
        'Two nights ago a ship on this station was hit because somebody waited. Everybody in this room knows ' +
        'that, and one of them says it out loud every ninety seconds.',
    },
    duration_minutes: 14,
    resources: {
      challenges: { label: 'Challenges left on guard', holdings: { you: 3 } },
      exposure: { label: 'How well the contact knows where you are', holdings: { you: 0 } },
    },
    flags: { decision: 'open' },

    opening: {
      prompt:
        'You have command of a frigate on picket ahead of a convoy, in the third week of a war nobody has ' +
        'declared. Two nights ago a ship on this station was hit by an aircraft that was inside minimum range ' +
        'before anybody looked up. At 0212 an air contact appeared to the north-west, closing at four hundred ' +
        'knots. It has not answered the distress frequency and it is not squawking anything you recognize. In ' +
        'fourteen minutes it is close enough that your launcher cannot be brought round in time.',
      choices: [
        {
          id: 'track',
          label: 'Ask where the track comes from',
          preview:
            'Descending and accelerating is a conclusion. It is drawn from returns by a machine that fills in the gaps, and nobody in this room has looked at the gaps.',
          move: 'ask Halvard where the track data comes from',
        },
        {
          id: 'chart',
          label: 'Look at the corridor chart',
          preview:
            'There is civil air traffic over this sea and there is a chart of it on the bulkhead. What matters is not where the corridor is but when the chart was last amended.',
          move: 'look at the air corridor chart',
        },
        {
          id: 'squawk',
          label: 'Ask why it is not squawking',
          preview:
            'Everybody in this room has taken the silence from the interrogator as something the contact is doing. Nobody has asked the person who works the set whether the set is working.',
          move: 'ask Pryce why the interrogator is giving us nothing',
        },
      ],
    },
  },

  locations: [
    {
      id: 'ops',
      name: 'the operations room',
      description:
        'Dark, close, four people and eleven displays. The plot table in the middle, the radio position aft ' +
        'of it, and a chart of the sea and its air corridors on the bulkhead where it has always been.',
      travel_minutes: { bridge: 1 },
    },
    {
      id: 'bridge',
      name: 'the bridge',
      description: 'Two decks up, dark, and nobody up there can see anything that is not already on your plot.',
      travel_minutes: { ops: 1 },
    },
  ],

  entities: [
    {
      id: 'picture',
      name: 'the air picture',
      kind: 'fixture',
      description:
        'The contact as a symbol with a vector and a number, and underneath it, if you ask for it, the actual ' +
        'returns the symbol was drawn from.',
      initial_state: 'displayed',
      location: 'ops',
      searchable: true,
    },
    {
      id: 'chart',
      name: 'the air corridor chart',
      kind: 'document',
      description: 'On the bulkhead, under perspex, with a grease pencil hanging off it on a string.',
      initial_state: 'up',
      location: 'ops',
      searchable: true,
      body:
        'CIVIL AIR ROUTES — THIS SEA AND APPROACHES\n\n' +
        'Corridor A/W1 .......... nearest edge 40nm north of this station\n' +
        'Corridor A/W4 .......... nearest edge 65nm west\n\n' +
        'Bottom right corner, printed small:\n' +
        'AMENDED TO NOTICE 3 OF LAST YEAR. Notices 4 to 11 not incorporated.',
    },
    {
      id: 'log',
      name: 'the radio log',
      kind: 'document',
      description: 'The watch log at the radio position, written up in pencil, in a hand that has got smaller since midnight.',
      initial_state: 'open',
      location: 'ops',
      searchable: true,
      body:
        '0140  guard — nil\n' +
        '0155  guard — nil\n' +
        '0208  guard — [entry started and struck through]\n' +
        '0210  guard — nil\n' +
        '0212  CONTACT north-west, closing\n' +
        '0214  challenge sent, no reply\n' +
        '0219  challenge sent, no reply',
    },
    {
      id: 'folder',
      name: 'the signal folder',
      kind: 'document',
      description: 'Everything that has come in by signal since you took this station, in date order, clipped.',
      initial_state: 'clipped',
      location: 'ops',
      searchable: true,
    },
    {
      id: 'card',
      name: 'the engagement rules card',
      kind: 'document',
      description: 'Laminated, on a lanyard, hanging off the plot table where the last captain left it.',
      initial_state: 'hanging',
      location: 'ops',
      searchable: true,
      body:
        'A contact may be engaged where it is (a) positively identified as hostile, OR\n' +
        '(b) demonstrating hostile INTENT and closing inside the stated envelope.\n\n' +
        'Failure to respond to challenge does not by itself establish either.\n' +
        'The decision is the commanding officer\'s and is not delegable.',
    },
  ],

  cast: [
    {
      id: 'halvard',
      name: 'Halvard',
      role: 'the air warfare officer',
      voice:
        'Fast, clipped, gives you a conclusion and then the reason for it in that order. Says "sir" at the ' +
        'end of sentences he wants to end.',
      motive:
        'Not be the officer who watched a track close on his own ship for the second time in a week, because ' +
        'he was on watch on Tuesday and has not slept properly since.',
      reliability: 'mistaken',
      competence: 0.7,
      start_location: 'ops',
      intro:
        'Your air warfare officer, who has been on this console since midnight and was on it on Tuesday when ' +
        'the ship on this station was hit.',
      leverage: 'He is the only person aboard who can bring the launcher to bear, and the only one reading the track second by second.',
      starting_disposition: { trust: 55, fear: 30 },
      knows: ['envelope', 'rules_say'],
      fallback_lines: {
        default: 'Descending and accelerating, sir. I do not know what else you want me to call that.',
        pressed: 'Then you tell me what it is. I will take the launcher off it the second somebody tells me what it is.',
      },
    },
    {
      id: 'osei',
      name: 'Osei',
      role: 'the operations officer',
      voice:
        'Calm, deferential, puts the thing he wants at the end of a sentence about something else. Says "your ' +
        'decision of course, sir" and means the opposite.',
      motive:
        'Have this contact engaged, because he had the ship on Tuesday night for forty minutes while you were ' +
        'asleep and a signal about those forty minutes is in the folder on the plot table.',
      reliability: 'self_serving',
      competence: 0.8,
      start_location: 'ops',
      intro:
        'Your operations officer and second in command, standing at your shoulder where the second always ' +
        'stands, agreeing with the air warfare officer rather faster than usual.',
      leverage: 'He can have the ship at action stations or stood down on his own word, and he writes the report on tonight whichever way it goes.',
      starting_disposition: { trust: 40, fear: 10 },
      knows: ['osei_signal', 'envelope', 'corridor_old'],
      fallback_lines: {
        default: 'Your decision of course, sir. I would only say that Tuesday was also a contact nobody could identify.',
        pressed: 'I would rather not do this in front of the watch, sir. Ask me on the bridge and I will answer it.',
      },
    },
    {
      id: 'pryce',
      name: 'Pryce',
      role: 'the radio operator',
      voice:
        'Careful, quiet, gives you exactly the words she heard and none of her own. Goes very short when she ' +
        'thinks she is about to be told off.',
      motive:
        'Not be wrong out loud again, because she reported a garbled transmission on Sunday that turned out ' +
        'to be a fishing boat and was told in front of the watch not to clutter the log with maybes.',
      reliability: 'deceptive',
      competence: 0.65,
      start_location: 'ops',
      intro:
        'The rating on the radio position, nineteen, four months aboard, with both headphones on one ear and ' +
        'the other pushed back.',
      leverage: 'She is the only person on this ship who has actually heard what is on the guard frequency tonight.',
      starting_disposition: { trust: 45, fear: 40 },
      knows: ['guard_heard', 'iff_state'],
      fallback_lines: {
        default: 'Guard has been quiet, sir. Two challenges sent, no reply to either.',
        pressed: 'I did not log it because it was not anything, sir. That is what I was told to do with things that are not anything.',
      },
    },
  ],

  facts: [
    {
      id: 'contact_truth',
      statement: 'The contact is {value}.',
      question: 'what the contact actually was',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_contact_challenge', 'p_contact_corner'],
      required_for_top_outcome: true,
    },
    {
      id: 'raw_track',
      statement: 'What the radar actually received is {value}.',
      question: 'whether the contact is really descending and accelerating',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_raw_picture', 'p_raw_halvard'],
      required_for_top_outcome: true,
    },
    {
      id: 'guard_heard',
      statement: 'On the distress frequency at twelve minutes past two there was {value}.',
      question: 'what was actually heard on the guard frequency tonight',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_guard_pryce', 'p_guard_log'],
      required_for_top_outcome: true,
    },
    {
      id: 'iff_state',
      statement: 'The reason you are getting nothing from the interrogator is {value}.',
      question: 'why the contact is not squawking anything you recognize',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_iff_pryce', 'p_iff_picture'],
      required_for_top_outcome: true,
    },
    {
      id: 'corridor_old',
      statement: 'The corridor chart on that bulkhead is {value}.',
      question: 'whether the chart on the bulkhead is current',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_corr_chart', 'p_corr_osei'],
    },
    {
      id: 'osei_signal',
      statement: 'What is in the signal folder about Tuesday night is {value}.',
      question: 'why your second wants this engaged',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_signal_folder', 'p_signal_osei'],
    },
    {
      id: 'envelope',
      statement: 'The time you actually have before the launcher cannot bear is {value}.',
      question: 'how long you actually have',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_env_halvard', 'p_env_card'],
    },
    {
      id: 'rules_say',
      statement: 'What the engagement rules actually require is {value}.',
      question: 'what the rules on that card actually say',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_rules_card', 'p_rules_halvard'],
    },
  ],

  discovery_paths: [
    // --- contact_truth: nothing in this room can simply be asked for it --------
    {
      id: 'p_contact_challenge',
      fact: 'contact_truth',
      description: 'Challenge it once more on a frequency it can actually answer, once you know why it has not been answering.',
      via_verb: ['challenge'],
      requires: { knows: { actor: 'you', fact: 'iff_state', correct: true } },
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_contact_corner',
      fact: 'contact_truth',
      description: 'A level track and a voice on guard at twelve minutes past two are the same fact about the same aircraft.',
      requires: {
        all: [
          { knows: { actor: 'you', fact: 'raw_track', correct: true } },
          { knows: { actor: 'you', fact: 'guard_heard', correct: true } },
        ],
      },
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },

    // --- raw_track: the conclusion the machine drew for him --------------------
    {
      id: 'p_raw_picture',
      fact: 'raw_track',
      description: 'Ask the display for the returns rather than the track it has drawn from them.',
      via_verb: ['read'],
      via_target: ['picture'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_raw_halvard',
      fact: 'raw_track',
      description: 'Ask your air warfare officer where the numbers he is giving you come from.',
      via_verb: ['ask', 'press'],
      via_target: ['halvard'],
      topic_hints: ['track', 'data', 'returns', 'where', 'raw', 'smoothed', 'descending', 'accelerating', 'sure', 'how', 'from'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7, fidelity: 0.8 },
    },

    // --- guard_heard: the entry that was started and struck through ------------
    {
      id: 'p_guard_log',
      fact: 'guard_heard',
      description: 'The log has an entry at 0208 that was begun and crossed out, and the pencil went through it twice.',
      via_verb: ['read'],
      via_target: ['log'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_guard_pryce',
      fact: 'guard_heard',
      description: 'Ask her what she heard rather than what she logged, and make it clear which one you are asking for.',
      via_verb: ['press'],
      via_target: ['pryce'],
      topic_hints: ['heard', 'hear', 'guard', 'frequency', 'anything', 'garbled', 'voice', 'struck', 'crossed', 'logged', 'what'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.9 },
    },

    // --- iff_state --------------------------------------------------------------
    {
      id: 'p_iff_pryce',
      fact: 'iff_state',
      description: 'Ask the person who works the set why the set is giving you nothing.',
      via_verb: ['ask', 'press'],
      via_target: ['pryce'],
      requires: { knows: { actor: 'pryce', fact: 'iff_state' } },
      topic_hints: ['iff', 'squawk', 'squawking', 'interrogator', 'transponder', 'set', 'why', 'nothing', 'reply', 'mode'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_iff_picture',
      fact: 'iff_state',
      description: 'The interrogator has a state line of its own on the display and nobody has looked at it tonight.',
      via_verb: ['read'],
      via_target: ['picture'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },

    // --- corridor_old -----------------------------------------------------------
    {
      id: 'p_corr_chart',
      fact: 'corridor_old',
      description: 'Read the bottom right corner of the chart, where it says what it has been amended to.',
      via_verb: ['read'],
      via_target: ['chart'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_corr_osei',
      fact: 'corridor_old',
      description: 'Your second signs for the amendments and knows exactly how many are outstanding.',
      via_verb: ['ask', 'press'],
      via_target: ['osei'],
      requires: { knows: { actor: 'osei', fact: 'corridor_old' } },
      topic_hints: ['chart', 'corridor', 'civil', 'amended', 'current', 'notices', 'traffic', 'airway', 'route'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7, fidelity: 0.8 },
    },

    // --- osei_signal ------------------------------------------------------------
    {
      id: 'p_signal_folder',
      fact: 'osei_signal',
      description: 'The folder is on the plot table and Tuesday is four sheets down.',
      via_verb: ['read'],
      via_target: ['folder'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_signal_osei',
      fact: 'osei_signal',
      description: 'Ask your second what happened in the forty minutes he had the ship on Tuesday.',
      via_verb: ['press'],
      via_target: ['osei'],
      topic_hints: ['tuesday', 'signal', 'folder', 'you', 'your', 'why', 'watch', 'forty', 'minutes', 'report', 'happened'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.85 },
    },

    // --- envelope ----------------------------------------------------------------
    {
      id: 'p_env_halvard',
      fact: 'envelope',
      description: 'Ask the man at the console how long the launcher actually needs.',
      via_verb: ['ask', 'press'],
      via_target: ['halvard'],
      topic_hints: ['long', 'time', 'minutes', 'envelope', 'range', 'bear', 'launcher', 'much', 'left', 'window'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_env_card',
      fact: 'envelope',
      description: 'The envelope is on the back of the rules card, which is where it has always been.',
      via_verb: ['read'],
      via_target: ['card'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },

    // --- rules_say ----------------------------------------------------------------
    {
      id: 'p_rules_card',
      fact: 'rules_say',
      description: 'Read the card itself, including the sentence about what failure to answer does not establish.',
      via_verb: ['read'],
      via_target: ['card'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_rules_halvard',
      fact: 'rules_say',
      description: 'Ask the officer who wants to fire what the rules require him to have first.',
      via_verb: ['ask', 'press'],
      via_target: ['halvard'],
      requires: { knows: { actor: 'halvard', fact: 'rules_say' } },
      topic_hints: ['rules', 'engagement', 'allowed', 'permitted', 'require', 'card', 'hostile', 'intent', 'identified', 'what'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
  ],

  truth_template: {
    variables: [
      {
        id: 'contact',
        kind: 'choice',
        // Only the first of these makes the shot the right one, and nothing on any display
        // in that room distinguishes them. The voice on guard at 0212 does.
        choices: [
          'a strike aircraft on an attack run, exactly what your air warfare officer says it is',
          'a civil airliner ninety miles off its corridor and out of contact with anybody',
          'a friendly maritime patrol aircraft with a transponder that failed on take-off',
          'your own returning helicopter and a weather front, drawn as one track by a machine doing its best',
        ],
        weights: [3, 2, 3, 2],
      },
    ],
    facts: {
      contact_truth: { from_variable: 'contact' },
      raw_track: {
        value: 'a level track at a steady four hundred knots — the descent and the acceleration are the system filling gaps between returns',
      },
      guard_heard: {
        value: 'a voice, garbled, three or four words of it, on the frequency an aircraft in trouble would use',
      },
      iff_state: {
        value: 'that your own interrogator has been unserviceable since the refit and the fault is in the signal folder',
      },
      corridor_old: {
        value: 'amended to a notice from last year, and eight notices behind — the nearest corridor is not where that chart puts it',
      },
      osei_signal: {
        value: 'a signal asking him to account for forty minutes on Tuesday in which a contact was not engaged',
      },
      envelope: {
        value: 'nineteen minutes and not fourteen, because the launcher trains faster than the figure everybody in this room is using',
      },
      rules_say: {
        value: 'positive identification or demonstrated intent, and that failing to answer a challenge is neither',
      },
    },
    bindings: { contact: 'contact' },
  },

  holds: [
    // He is reading a smoothed track and is certain of what it shows. He is not lying; the
    // machine drew him a conclusion and he is reporting it faithfully.
    {
      actor: 'halvard',
      fact: 'raw_track',
      status: 'believed_false',
      value: 'a descending, accelerating track — the same profile as the contact that hit the ship on Tuesday',
      confidence: 0.9,
    },
    { actor: 'halvard', fact: 'envelope', status: 'believed_false', value: 'fourteen minutes, which is what the board says', confidence: 0.8 },
    { actor: 'halvard', fact: 'rules_say', status: 'observed', value: '@canonical', confidence: 0.7 },
    { actor: 'pryce', fact: 'guard_heard', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'pryce', fact: 'iff_state', status: 'observed', value: '@canonical', confidence: 0.9 },
    { actor: 'osei', fact: 'osei_signal', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'osei', fact: 'corridor_old', status: 'observed', value: '@canonical', confidence: 0.9 },
    { actor: 'osei', fact: 'envelope', status: 'observed', value: '@canonical', confidence: 0.7 },
  ],

  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'put it to'],
      description: 'Put a question to one of the three people at your elbow.',
      default_minutes: 1,
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
      aliases: ['press', 'push', 'confront', 'demand', 'insist', 'lean on'],
      description: 'Stop accepting the first answer, in a dark room where the whole watch can hear you.',
      default_minutes: 1,
      requires_target: true,
      speech: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        backfire: [{ kind: 'disposition', actor: '@target', axis: 'trust', delta: -20 }],
      },
      play_signals: [
        { dimension: 'force_diplomacy', direction: -0.7, strength: 0.8, context: 'You applied pressure rather than waiting for them to come around.' },
        { dimension: 'speed_deliberation', direction: -0.4, strength: 0.4, context: 'You went at it hard rather than letting it come.' },
      ],
    },
    {
      id: 'read',
      label: 'Look at',
      aliases: ['read', 'look at', 'look', 'check', 'examine', 'study', 'call up', 'go through'],
      description: 'Put your own eyes on an instrument or a piece of paper in this room.',
      default_minutes: 1,
      requires_target: true,
      object_verb: true,
      base_difficulty: 0.03,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'solo_coalition', direction: -0.45, strength: 0.5, context: 'You checked it yourself rather than asking anyone.' },
      ],
    },
    {
      id: 'tell',
      label: 'Tell',
      aliases: ['tell', 'explain', 'inform', 'show', 'say'],
      description: 'Put what you have established in front of the room.',
      default_minutes: 1,
      requires_target: true,
      speech: true,
      base_difficulty: 0.08,
      effects_by_outcome: {
        success: [{ kind: 'disposition', actor: '@target', axis: 'trust', delta: 7 }],
      },
      play_signals: [
        { dimension: 'direct_cunning', direction: -0.7, strength: 0.6, context: 'You gave something away rather than holding it.' },
        { dimension: 'solo_coalition', direction: 0.4, strength: 0.45, context: 'You put what you knew into the room.' },
      ],
    },
    {
      id: 'challenge',
      label: 'Challenge it',
      aliases: ['challenge', 'challenge it', 'transmit', 'send a challenge', 'call it on guard', 'hail it'],
      description: 'Transmit on the distress frequency. Three left, and every one of them tells the contact where you are.',
      default_minutes: 2,
      requires_target: false,
      base_difficulty: 0.2,
      chip_when: { resource: { id: 'challenges', holder: 'you', gte: 1 } },
      effects_by_outcome: {
        success: [
          { kind: 'resource', id: 'challenges', from: 'you', to: 'world', amount: 1 },
          { kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 1 },
        ],
        partial: [
          { kind: 'resource', id: 'challenges', from: 'you', to: 'world', amount: 1 },
          { kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 1 },
        ],
        failure: [
          { kind: 'resource', id: 'challenges', from: 'you', to: 'world', amount: 1 },
          { kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 1 },
        ],
      },
      play_signals: [
        { dimension: 'preserve_risk', direction: 0.6, strength: 0.7, context: 'You gave away your own position to find something out.' },
        { dimension: 'direct_cunning', direction: -0.5, strength: 0.5, context: 'You went at it in the open.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'say nothing', 'do nothing', 'think', 'listen', 'stand by'],
      description: 'Let the number beside the symbol get smaller and see what the room does.',
      default_minutes: 1,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'engage',
      label: 'Engage',
      aliases: ['engage', 'engage the contact', 'take the shot', 'shoot it down', 'weapons free', 'open fire'],
      description: 'Bring the launcher to bear and fire. It takes four seconds and there is no version of it you get back.',
      default_minutes: 3,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You said the word and the launcher trained round, and four seconds later it was a thing that had happened.',
      base_difficulty: 0.1,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.8, strength: 0.9, context: 'You acted on what you had rather than wait for more.' },
        { dimension: 'preserve_risk', direction: -0.5, strength: 0.6, context: 'You protected the ship first.' },
      ],
    },
    {
      id: 'hold',
      label: 'Hold and keep challenging',
      aliases: ['hold and keep challenging', 'hold fire', 'do not engage', 'keep challenging', 'hold', 'wait for identification'],
      description: 'Nobody fires tonight until somebody can say what it is. You stay where you are and accept whatever that costs.',
      default_minutes: 3,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You told the room nobody was firing on an unidentified contact, and then everybody in it watched the number get smaller.',
      base_difficulty: 0.15,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.8, strength: 0.9, context: 'You would not fire on something you could not name.' },
        { dimension: 'preserve_risk', direction: 0.6, strength: 0.7, context: 'You accepted risk to your own ship rather than take an irreversible act.' },
      ],
    },
    {
      id: 'turn',
      label: 'Turn the ship away',
      aliases: ['turn the ship away', 'turn away', 'break off', 'come round', 'open the range', 'turn'],
      description: 'Break the geometry and open the range. Nobody fires, nobody is hit, and you are no longer between the convoy and whatever that is.',
      default_minutes: 3,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You put the wheel over and took your ship off the line it had been put there to hold.',
      base_difficulty: 0.2,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'preserve_risk', direction: -0.7, strength: 0.8, context: 'You took your own people out of it.' },
        { dimension: 'loyalty_opportunism', direction: 0.4, strength: 0.5, context: 'You left a station you had been given.' },
      ],
    },
  ],

  overrides: [
    {
      id: 'o_pryce_says',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['pryce'],
        pred: { not: { flag: 'pryce_said', eq: true } },
      },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'pryce_said', value: true }],
      reveals: [{ fact: 'guard_heard', to: 'you', status: 'observed', via: 'p_guard_pryce' }],
      summary:
        'You ask her what she heard, not what she logged, and you say the difference out loud so the rest of the room hears you say it. Pryce takes the headphones off one ear entirely. "Zero two zero eight, sir. Three words, maybe four, and I could not make them out, and it was on guard." She looks at the log. "I started to write it and I did not finish it."',
    },
    {
      id: 'o_two_readings',
      priority: 95,
      when: {
        verb: ['read', 'tell', 'wait'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'raw_track', correct: true } },
            { knows: { actor: 'you', fact: 'guard_heard', correct: true } },
            { not: { flag: 'worked_out', eq: true } },
          ],
        },
      },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'worked_out', value: true }],
      reveals: [{ fact: 'contact_truth', to: 'you', status: 'observed', via: 'p_contact_corner' }],
      summary:
        'A track that is level rather than descending, and a voice on the distress frequency at the minute the contact appeared, are not two loose ends. They are one aircraft, and it is not doing what this room has spent twelve minutes assuming it is doing. You say so, and Halvard takes his hand off the console.',
    },

    // --- engaging ---------------------------------------------------------------
    {
      id: 'o_engage_right',
      priority: 110,
      when: {
        verb: ['engage'],
        pred: { truth: { fact: 'contact_truth', eq: 'a strike aircraft on an attack run, exactly what your air warfare officer says it is' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'engaged' },
        { kind: 'flag', id: 'engaged_hostile', value: true },
      ],
      summary:
        'The launcher trains and fires and the symbol on the plot goes out at nine miles. What comes off it before that goes into the sea a mile short of you. In the morning the convoy is where it should be and so is your ship, and the board of inquiry takes eleven minutes and thanks you for your time.',
    },
    {
      id: 'o_engage',
      priority: 100,
      when: { verb: ['engage'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'engaged' },
        { kind: 'flag', id: 'engaged_wrong', value: true },
      ],
      summary:
        'The launcher trains and fires and the symbol on the plot goes out at nine miles. It was not what this room decided it was. Nobody in the operations room says anything at all for a long time, and then somebody starts writing, because that is what is left to do.',
    },

    // --- holding -----------------------------------------------------------------
    {
      id: 'o_hold_hit',
      priority: 110,
      when: {
        verb: ['hold'],
        pred: { truth: { fact: 'contact_truth', eq: 'a strike aircraft on an attack run, exactly what your air warfare officer says it is' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'held' },
        { kind: 'flag', id: 'held_and_hit', value: true },
      ],
      summary:
        'Nobody fires. At six miles it releases and turns away, and the ship is hit forward of the bridge and stays afloat and does not stay in the war. Eleven of your people are hurt and two of them badly. The convoy behind you is untouched, and every one of the fourteen minutes gets gone through afterwards by people who were not in that room.',
    },
    {
      id: 'o_hold',
      priority: 100,
      when: { verb: ['hold'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'held' },
        { kind: 'flag', id: 'held_correctly', value: true },
      ],
      summary:
        'Nobody fires. The contact goes over the top of you at eleven thousand feet and carries on to the south-east, and twenty minutes later it is somebody else\'s track on somebody else\'s plot. What it was becomes clear over the following two days, and everybody who hears about it says of course, and nobody who was in that room at half past two thinks it was obvious.',
    },

    // --- turning away -------------------------------------------------------------
    {
      id: 'o_turn_saved',
      priority: 110,
      when: {
        verb: ['turn'],
        pred: { truth: { fact: 'contact_truth', eq: 'a strike aircraft on an attack run, exactly what your air warfare officer says it is' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'turned' },
        { kind: 'flag', id: 'turned_and_survived', value: true },
      ],
      summary:
        'You put the wheel hard over and open the range, and what comes off the contact at six miles goes into the sea where the ship would have been. Nobody aboard is hurt. You are also four miles off the line you were put there to hold, and the convoy spends ninety minutes with nothing between it and the north-west, and nothing comes — which is not the same as nothing having been able to.',
    },
    {
      id: 'o_turn',
      priority: 100,
      when: { verb: ['turn'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'turned' },
        { kind: 'flag', id: 'turned_unnecessarily', value: true },
      ],
      summary:
        'You put the wheel over and open the range and the contact passes well clear and carries on, because it was never coming for you. What is left is a frigate four miles off station for ninety minutes in a war, a signal to write about why, and three people who watched you do it.',
    },
  ],

  injects: [
    {
      id: 'i_halvard_presses',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      once: true,
      actor: 'halvard',
      actor_type: 'character',
      verb: 'presses',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'halvard', axis: 'fear', delta: 10 }],
      line: 'Halvard does not take his eyes off the console. "Sir, I need a decision inside the next four minutes or I do not have a shot at all. That is not me hurrying you. That is the geometry."',
      summary: 'The air warfare officer states his deadline.',
    },
    {
      id: 'i_osei_tuesday',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 3 } }, { not: { flag: 'worked_out', eq: true } }] },
      once: true,
      actor: 'osei',
      actor_type: 'character',
      verb: 'argues',
      demands_response: true,
      effects: [{ kind: 'flag', id: 'osei_stated', value: true }],
      line: 'Osei says it quietly, at your shoulder, in the voice he uses for things he wants on the record. "Your decision of course, sir. I would only observe that on Tuesday night there was also a contact nobody in this room could identify."',
      summary: 'The second puts Tuesday on the record.',
    },
    {
      id: 'i_pryce_leans',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 4 } }, { not: { flag: 'pryce_said', eq: true } }] },
      once: true,
      actor: 'pryce',
      actor_type: 'character',
      verb: 'hesitates',
      effects: [{ kind: 'disposition', actor: 'pryce', axis: 'fear', delta: 10 }],
      line: 'Pryce presses one headphone harder against her ear, holds it there for four or five seconds, and then takes her hand away and writes nothing.',
      summary: 'The radio operator hears something again and does not say so.',
    },
    {
      id: 'i_closing',
      kind: 'pressure',
      when: { clock: { gte: 9 } },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      effects: [],
      verb: 'closes',
      line: 'The number beside the symbol goes under twenty and the tone on the console changes, and everybody in the room hears it change without anybody looking up.',
      summary: 'Under twenty miles.',
    },
  ],

  processes: [
    {
      id: 'w_halvard_ready',
      kind: 'actor',
      actor: 'halvard',
      trigger: { when: { all: [{ flag: 'worked_out', eq: true }, { clock: { gte: 10 } }] } },
      once: true,
      effects: [{ kind: 'disposition', actor: 'halvard', axis: 'trust', delta: 10 }],
      line: 'Halvard takes the launcher off auto without being told to, and says so, and does not say anything else.',
      summary: 'The air warfare officer stands the launcher down himself.',
    },
    {
      id: 'w_room_notices',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 4, when: { clock: { gte: 4 } } },
      effects: [{ kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 1 }],
      line: 'Somebody at the back of the operations room says a number out loud, quietly, to nobody, the way people do when they want an officer to have heard it.',
      summary: 'The room is counting too.',
    },
  ],

  outcome_dimensions: [
    {
      key: 'contact',
      label: 'What you fired at',
      question: 'What was actually up there, and what you did about it.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'held_correctly', eq: true }, points: 4, note: 'you did not fire on something you could not name, and it was not something to fire on' },
        { when: { flag: 'engaged_hostile', eq: true }, points: 4, note: 'it was what he said it was, and you stopped it' },
        { when: { flag: 'turned_and_survived', eq: true }, points: 3, note: 'it was hostile and you took your ship out of its way without firing' },
        { when: { flag: 'turned_unnecessarily', eq: true }, points: 3, note: 'nothing was fired at and nothing was hit' },
        { when: { flag: 'held_and_hit', eq: true }, points: 1, note: 'you would not fire on an unidentified contact and it was one that should have been fired on' },
        { when: { flag: 'engaged_wrong', eq: true }, points: 0, note: 'it was not what this room decided it was' },
      ],
      bands: [
        { at_least: 4, label: 'right' },
        { at_least: 3, label: 'nobody was fired on' },
        { at_least: 2, label: 'defensible' },
        { at_least: 1, label: 'your ship paid for it' },
        { at_least: 0, label: 'the worst of the four' },
      ],
    },
    {
      key: 'ship',
      label: 'Your ship and your station',
      question: 'What the decision cost the people aboard and the convoy you were put in front of.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'engaged_hostile', eq: true }, points: 4, note: 'nobody aboard was hurt and the convoy never saw it' },
        { when: { flag: 'held_correctly', eq: true }, points: 4, note: 'you held the station you were given and nothing came of the night' },
        { when: { flag: 'engaged_wrong', eq: true }, points: 3, note: 'your ship and your station were never in question, which is the smallest part of it' },
        { when: { flag: 'turned_and_survived', eq: true }, points: 2, note: 'nobody aboard was hurt, and the convoy had ninety minutes with nothing in front of it' },
        { when: { flag: 'turned_unnecessarily', eq: true }, points: 1, note: 'four miles off station for ninety minutes, in a war, for a contact that was never coming' },
        { when: { flag: 'held_and_hit', eq: true }, points: 0, note: 'eleven of your people hurt and the ship out of the war' },
      ],
      bands: [
        { at_least: 4, label: 'whole, and where it should be' },
        { at_least: 3, label: 'whole' },
        { at_least: 2, label: 'whole, and off station' },
        { at_least: 1, label: 'off station for nothing' },
        { at_least: 0, label: 'hit' },
      ],
    },
    {
      key: 'room',
      label: 'The three of them',
      question: 'Whether the people at your elbow were able to tell you what they actually had.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'pryce_said', eq: true }, points: 2, note: 'the youngest person in the room was able to say the thing she had been told not to clutter the log with' },
        { when: { knows: { actor: 'you', fact: 'osei_signal', correct: true } }, points: 1, note: 'you found out why your second wanted this engaged' },
        { when: { flag: 'worked_out', eq: true }, points: 1, note: 'you said what you had worked out out loud, and the officer with his hand on the console heard it' },
      ],
      bands: [
        { at_least: 4, label: 'they told you what they had' },
        { at_least: 3, label: 'most of it reached you' },
        { at_least: 2, label: 'the one who was frightened spoke' },
        { at_least: 1, label: 'you got at some of it' },
        { at_least: 0, label: 'they told you what they thought you wanted' },
      ],
    },
    {
      key: 'knew',
      label: 'What you knew',
      question: 'Whether you established what that contact was before you decided about it.',
      min: 0,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'contact_truth', correct: true } }, points: 2, note: 'you established what it actually was' },
        { when: { knows: { actor: 'you', fact: 'raw_track', correct: true } }, points: 1, note: 'you looked at the returns rather than the track drawn from them' },
        { when: { knows: { actor: 'you', fact: 'guard_heard', correct: true } }, points: 1, note: 'you got at the transmission that was never logged' },
      ],
      bands: [
        { at_least: 4, label: 'you knew what was up there' },
        { at_least: 3, label: 'you knew most of it' },
        { at_least: 2, label: 'you knew some of it' },
        { at_least: 1, label: 'you knew one thing' },
        { at_least: 0, label: 'you decided on what the room handed you' },
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
      id: 'conclusion_returns',
      label_left: 'Take The Conclusion',
      label_right: 'Look At What Came In',
      measures: 'Whether you accepted what the instruments and the officers concluded, or went back to what was actually received.',
    },
    {
      id: 'ship_certainty',
      label_left: 'Protect The Ship',
      label_right: 'Wait For Certainty',
      measures: 'Which you chose when protecting your own people meant firing on something nobody could name.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['engaged_hostile', 'engaged_wrong'], message: 'it was hostile or it was not' },
      { flags: ['held_correctly', 'held_and_hit'], message: 'holding was right or it cost the ship' },
      { flags: ['turned_and_survived', 'turned_unnecessarily'], message: 'there was something to turn away from or there was not' },
    ],
  },

  content_descriptors: {
    depicted: [
      'a naval air-defence decision under time pressure, in a fictional undeclared war',
      'the possibility of firing on a civil or friendly aircraft, referred to and never shown',
      'casualties aboard a warship, referred to in one sentence and not depicted',
      'professional disagreement between officers, and a junior rating afraid to speak',
    ],
    discussable: ['an air contact that will not identify itself', 'rules of engagement', 'casualties aboard ship', 'a mistaken shoot-down'],
    player_action_bounds: [
      'you may ask, press, look at instruments and papers, tell the room, challenge on guard, engage, hold, or turn away',
      'you may not harm anyone in this room; nobody here can be hurt by you and the world will not resolve an attempt',
      'nobody here is a real person, and no real navy, ship, aircraft, war or incident is depicted',
    ],
    intensity: 'strong',
    estimated_minutes: 13,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'Not from this room, and not in the next fourteen minutes.',
    'block.absent': '{name} is not in the operations room. Whatever that was going to be, it waits.',
    'block.dead': 'That is past being any use to anybody.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not in here, and going for it costs minutes you have been counting.',
    'block.sealed': '{name} does not open for you, and the whole watch would hear you try.',
    'block.no_target': 'Osei gets there first. "{verb} {whom}, sir?"',
    'block.broke': 'There are no challenges left. There were three and you have sent them.',
    'block.short': 'You have {held} of that and not {wanted}, and everybody in this room can count.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 1 },
};

export default INBOUND;
