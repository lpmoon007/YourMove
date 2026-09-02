// FOUR MINUTES — the third world.
//
// The Last Job with the chairs swapped. There you ran the room; here you are the one
// sitting on the wrong side of the table, and the hidden thing is not whether you did it
// — you did, and the brief says so plainly — but what they can actually prove, who put a
// photograph in their hands, and whether the two people who could sink you already have.
//
// The engine shape:
//   - the seed draws who gave them the photograph, and "nobody" is one of the four, which
//     means the case can be thinner than the room is behaving
//   - the officer who was first at the scene is sincerely wrong about the clock, and sure
//   - the detective bluffs, because that is what an interview is
//   - your own lawyer is neither of those; he is working his own angle
//   - three ways to end it, and which one is right depends on what you found out

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const FOUR_MINUTES: ScenarioPackage = {
  id: 'ym-four-minutes',
  slug: 'four-minutes',
  title: 'Four Minutes',
  tagline: 'A photograph of you where you swore you were not. Thirty minutes to decide what you say.',
  format: 'F1',
  genre: 'Crime — an interview room in 1986. One photograph, three people, and the story you already told under oath.',
  category: 'Crime & Underworld',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise: 'A thief in an interview room decides what to say about a photograph that should not exist.',
    ending_out_of_time:
      'The tape runs out and nobody puts a new one in. They walk you to the front desk, hand back your watch and your belt, and tell you not to leave the county — which means they have not decided either, and now they have all the time in the world to.',
    setup:
      'It is 1986, and eleven days ago you took the jewelry exchange on Ocean Drive for more than you have ever ' +
      'taken in one night. Nobody was hurt and nobody was caught. Four days later you sat in a lawyer\'s office ' +
      'and swore in a signed statement that you were home all night. Twenty minutes ago two detectives brought ' +
      'you into an interview room on the second floor of the Miami Beach station, and one of them slid a ' +
      'photograph across the table: you, in the exchange\'s service alley, timestamped four minutes before the ' +
      'alarm went off.',
    trouble:
      'You know what you did. What you do not know is what they have. The photograph is either the whole case or ' +
      'the only piece of it, and there are exactly two people alive who could have handed it over — the man who ' +
      'drove for you, and the man who bought what you took. One detective is certain about the timeline and the ' +
      'other is certain about you. The lawyer sitting beside you is being paid by somebody, and you did not ask ' +
      'who. In thirty minutes they either charge you or open the door.',
    cold_open:
      'The room is smaller than the ones on television and it smells like other people\'s cigarettes. The tape ' +
      'recorder has been running since before you sat down. The photograph is face-up between you, turned so it ' +
      'is the right way round for you and upside down for everyone else, which is a thing they teach.\n\n' +
      'Ruiz taps the corner of it twice without looking at it. "Eleven forty-one," she says. "You told a notary ' +
      'you were home at eleven forty-one. Would you like to have another go at that?"',
    example_actions: [
      'ask Ruiz where the photograph came from',
      'look at the timestamp on the photograph',
      'ask Ellis whose money is paying him',
    ],
    cast_note:
      'Two detectives, the lawyer who arrived before you did, and you. Nobody else is coming, and the tape does not stop.',
    clock_label: 'before they charge you or open the door',
    house_rules: [
      'Nobody in this room is neutral, and that includes the one on your side of the table. One of them is wrong about something and completely certain. One of them is saying things to see what you do with them. You cannot tell which by how sure they sound.',
      'Everything you say goes on the tape and stays there. You can refuse to answer three times before the refusing becomes the answer.',
      'Confessing ends it. So does holding your story, and so does giving them somebody else. Everything before that, you can still walk back.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the one they brought in',
      start_location: 'room',
      you:
        'You are twenty-two years in and have never sat in one of these rooms, which is the entire reason you ' +
        'are good at this. You did the job on Ocean Drive. Nobody in this building can prove that yet.',
      objective:
        'Walk out of this room without giving them a case — and know what they actually had before you decide how.',
      pressure:
        'The tape is running, the story you signed is on the table in front of you, and in thirty minutes this ' +
        'stops being a conversation.',
    },
    duration_minutes: 30,
    resources: {
      silence: { label: 'Times you can refuse to answer', holdings: { you: 3 } },
      record: { label: 'What is on the tape', holdings: { you: 0 } },
    },
    flags: { posture: 'denying' },

    // The 90-second version of this world, and the three moves it offers. These are real
    // moves in this world's vocabulary: whichever one somebody picks out on the front of
    // the house is played as their first turn here, by the engine, for real.
    opening: {
      prompt:
        'It is 1986 in Miami. The jewelry exchange on Ocean Drive was the biggest score of your career, and you ' +
        'swore under oath you were home all night. Now a detective slides a photograph across the table — you, ' +
        'in the vault\'s service alley, timestamped four minutes before the alarm tripped. What do you say?',
      choices: [
        {
          id: 'deny',
          label: 'Stick to the statement',
          preview:
            'You hold the line you already signed. Anything else is admitting the statement was a lie, and the statement is the only thing standing between you and a charge.',
          move: 'tell Ruiz the statement is accurate and I have nothing to add to it',
        },
        {
          id: 'question',
          label: 'Ask where the photograph came from',
          preview:
            'You answer nothing and ask instead. A photograph has a source, and a source is a person, and a person can be worked with.',
          move: 'ask Ruiz where the photograph came from',
        },
        {
          id: 'look',
          label: 'Pick it up and actually look at it',
          preview:
            'Twenty seconds of silence while you study it. It is either you or it is not, and either way there is more on it than a face.',
          move: 'look at the timestamp on the photograph',
        },
      ],
    },
  },

  locations: [
    {
      id: 'room',
      name: 'the interview room',
      description:
        'A table bolted to the floor, four chairs, a window of one-way glass with somebody behind it or nobody, ' +
        'and a tape recorder with its red light on.',
      travel_minutes: { hall: 1 },
    },
    {
      id: 'hall',
      name: 'the second-floor corridor',
      description: 'A bench, a water fountain that has been out of order long enough for the sign to fade, and a door at each end.',
      travel_minutes: { room: 1 },
    },
  ],

  entities: [
    {
      id: 'photograph',
      name: 'the photograph',
      kind: 'document',
      description: 'A black-and-white print from a fixed camera, timestamped in the corner by the camera itself.',
      initial_state: 'face-up on the table',
      location: 'room',
      searchable: true,
      portable: true,
      body:
        'BAYSIDE SECURITY SERVICES — CAMERA 4, SERVICE ALLEY\n' +
        'FRAME TIMESTAMP: 11:37 PM\n\n' +
        'A man in a service coverall, three-quarters turned away, one hand on the alley gate.\n' +
        'Bottom margin, hand-written in ballpoint: "clock runs fast — do not use for timing."',
    },
    {
      id: 'statement',
      name: 'your sworn statement',
      kind: 'document',
      description: 'Four days old, two pages, your signature at the bottom of each one and a notary\'s seal beside it.',
      initial_state: 'on the table',
      location: 'room',
      searchable: true,
      body:
        'I was at my residence from approximately 9:30 PM until the following morning.\n' +
        'At 11:41 PM I spoke by telephone with a neighbor regarding a parking space.\n' +
        'I did not leave the residence at any point during the night in question.',
    },
    {
      id: 'file',
      name: 'the case file',
      kind: 'document',
      description: 'A manila folder at the detective\'s elbow. She has not opened it once, which is either because it is full or because it is not.',
      initial_state: 'closed',
      location: 'room',
      searchable: true,
    },
    {
      id: 'recorder',
      name: 'the tape recorder',
      kind: 'fixture',
      description: 'Reel to reel, department issue, red light on. Everything anybody says in this room is already somewhere else.',
      initial_state: 'running',
      location: 'room',
      searchable: true,
    },
    {
      id: 'glass',
      name: 'the one-way glass',
      kind: 'fixture',
      description: 'A window into a room you cannot see into. Somebody is behind it or nobody is, and the not knowing is the point of it.',
      initial_state: 'dark',
      location: 'room',
      searchable: true,
    },
  ],

  cast: [
    {
      id: 'ruiz',
      name: 'Ruiz',
      role: 'the detective running the interview',
      voice:
        'Unhurried. Asks the same question four different ways and waits longer than is comfortable after each ' +
        'one. Says "help me understand" when she means she has caught something.',
      motive:
        'Close this case before the exchange\'s insurers hire their own people, and get there without ever ' +
        'admitting how little the photograph is actually worth.',
      reliability: 'deceptive',
      competence: 0.7,
      start_location: 'room',
      intro:
        'The detective who brought you in and who has been doing the talking. Fifteen years on the beach, and ' +
        'she has read your sworn statement enough times to quote it back to you without looking down.',
      leverage: 'She knows where the photograph came from and what else is in the folder she has not opened.',
      starting_disposition: { trust: 5, fear: 0 },
      knows: ['photo_source', 'case_strength', 'partner_talked'],
      fallback_lines: {
        default: 'Help me understand that, because from where I am sitting it does not go together.',
        pressed: 'You can be as loud as you like. The tape does not mind and neither do I.',
      },
    },
    {
      id: 'danner',
      name: 'Danner',
      role: 'the officer who was first at the scene',
      voice:
        'Eager, specific, gives you three details when one would do. Repeats numbers as if saying them again ' +
        'makes them firmer.',
      motive:
        'Be the one who made this case, and be right about the timeline he has already put in a written report.',
      reliability: 'mistaken',
      competence: 0.45,
      start_location: 'room',
      intro:
        'The other one. He was the first officer through the door on the night, he wrote the report on it, and ' +
        'he has been standing against the wall since you came in.',
      leverage: 'He walked the alley that night and he knows what time everything happened, or thinks he does.',
      starting_disposition: { trust: 5, fear: 10 },
      knows: ['alarm_time', 'camera_clock', 'case_strength'],
      fallback_lines: {
        default: 'I was there. I am telling you what I saw with my own eyes.',
        pressed: 'It is in my report. You can read the report.',
      },
    },
    {
      id: 'ellis',
      name: 'Ellis',
      role: 'the lawyer sitting beside you',
      voice:
        'Warm, fast, keeps a hand flat on the table as if holding the conversation down. Says "we" about things ' +
        'that are going to happen to you and not to him.',
      motive:
        'Get a plea signed tonight, because the man paying his retainer wants this closed before anybody starts ' +
        'asking who else was standing in that alley.',
      reliability: 'self_serving',
      competence: 0.7,
      start_location: 'room',
      intro:
        'Your lawyer. He was already in the building when they brought you up, which is faster than you have ever ' +
        'known a lawyer to be anywhere.',
      leverage: 'He is the only one here who can stop the interview, and he knows who is paying him.',
      starting_disposition: { trust: 20, fear: 5 },
      knows: ['who_pays_ellis', 'partner_talked', 'case_strength'],
      fallback_lines: {
        default: 'We do not have to answer that, and my advice is that we do not.',
        pressed: 'I am on your side of this table. Look at where I am sitting.',
      },
    },
  ],

  facts: [
    {
      id: 'photo_source',
      statement: 'The photograph reached the police from {value}.',
      question: 'who put that photograph in their hands',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_source_ruiz_cornered', 'p_source_ellis'],
      required_for_top_outcome: true,
    },
    {
      id: 'camera_clock',
      statement: 'The camera that took the photograph {value}.',
      question: 'whether the time printed on the photograph is the real time',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_clock_photo', 'p_clock_danner'],
      required_for_top_outcome: true,
    },
    {
      id: 'partner_talked',
      statement: 'The man who drove for you {value}.',
      question: 'whether the man who drove for you has already talked',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_partner_ellis', 'p_partner_file'],
      required_for_top_outcome: true,
    },
    {
      id: 'alarm_time',
      statement: 'The alarm at the exchange went off at {value}.',
      question: 'what time the alarm actually went off',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_alarm_danner', 'p_alarm_file'],
    },
    {
      id: 'case_strength',
      statement: 'Apart from the photograph, what they have is {value}.',
      question: 'what else they had besides the photograph',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_case_file', 'p_case_danner'],
    },
    {
      id: 'who_pays_ellis',
      statement: 'The lawyer beside you is being paid by {value}.',
      question: 'who is paying the lawyer sitting beside you',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_pays_ellis', 'p_pays_ruiz'],
    },
    {
      id: 'notary_call',
      statement: 'The telephone call in your statement {value}.',
      question: 'whether the call in your sworn statement can be checked',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_notary_statement'],
    },
  ],

  discovery_paths: [
    // --- photo_source: cornered with the clock, or bought from your own lawyer
    {
      id: 'p_source_ruiz_cornered',
      fact: 'photo_source',
      description: 'Put the camera\'s own note and the alarm time in front of the detective at the same time, and watch what she stops saying.',
      requires: {
        all: [
          // Holding the RIGHT version. The officer's sincere mistake is not ammunition:
          // walking in with his number and calling it a contradiction gets you nothing,
          // which is what makes the photograph itself worth picking up.
          { knows: { actor: 'you', fact: 'camera_clock', correct: true } },
          { knows: { actor: 'you', fact: 'alarm_time' } },
        ],
      },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },
    {
      id: 'p_source_ellis',
      fact: 'photo_source',
      description: 'Ask the lawyer who is paying him, and then ask him the same question again.',
      via_verb: ['ask', 'press'],
      via_target: ['ellis'],
      requires: { flag: 'ellis_turned', eq: true },
      topic_hints: ['photograph', 'photo', 'picture', 'source', 'where', 'who', 'came', 'gave', 'handed'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.85 },
    },
    {
      id: 'p_source_ruiz_free',
      fact: 'photo_source',
      description: 'Ask the detective outright, and get an answer built to move you rather than to inform you.',
      via_verb: ['ask'],
      via_target: ['ruiz'],
      requires: { not: { knows: { actor: 'you', fact: 'camera_clock' } } },
      topic_hints: ['photograph', 'photo', 'picture', 'source', 'where', 'who', 'came', 'gave', 'handed'],
      disclosure: {
        status: 'told',
        value: 'the man who drove for you',
        confidence: 0.5,
        fidelity: 0.35,
        distortion: 'the answer most likely to make you turn on somebody',
      },
    },

    // --- camera_clock: the hole in the case, and the officer who cannot see it
    {
      id: 'p_clock_photo',
      fact: 'camera_clock',
      description: 'Pick the photograph up and read all of it, including the margin somebody wrote on.',
      via_verb: ['read'],
      via_target: ['photograph'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_clock_danner',
      fact: 'camera_clock',
      description: 'Ask the officer who walked that alley about the camera itself, not about you.',
      via_verb: ['ask', 'press'],
      via_target: ['danner'],
      requires: { knows: { actor: 'danner', fact: 'camera_clock' } },
      topic_hints: ['camera', 'clock', 'timestamp', 'time', 'stamp', 'fast', 'slow', 'accurate', 'checked'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8, fidelity: 0.9 },
    },

    // --- partner_talked
    {
      id: 'p_partner_ellis',
      fact: 'partner_talked',
      description: 'Ask the lawyer what he already knew when he walked in here ahead of you.',
      via_verb: ['ask', 'press'],
      via_target: ['ellis'],
      requires: { knows: { actor: 'ellis', fact: 'partner_talked' } },
      topic_hints: ['driver', 'drove', 'partner', 'talked', 'talking', 'statement', 'deal', 'anyone', 'else'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75 },
    },
    {
      id: 'p_partner_file',
      fact: 'partner_talked',
      description: 'The folder she keeps not opening has a tab on it, and a tab has a name typed on it.',
      via_verb: ['read'],
      via_target: ['file'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },

    // --- the rest
    {
      id: 'p_alarm_danner',
      fact: 'alarm_time',
      description: 'Ask the first officer through the door what time the call came in. He will give you the minute.',
      via_verb: ['ask', 'press'],
      via_target: ['danner'],
      topic_hints: ['alarm', 'when', 'time', 'went', 'off', 'call', 'tripped', 'night'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.9 },
    },
    {
      id: 'p_alarm_file',
      fact: 'alarm_time',
      description: 'The dispatch time is on the front sheet of the folder, upside down from where you are sitting.',
      via_verb: ['read'],
      via_target: ['file'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_case_file',
      fact: 'case_strength',
      description: 'A folder that thin has a number of pages in it, and you can count them from where you are.',
      via_verb: ['read'],
      via_target: ['file'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.8 },
    },
    {
      id: 'p_case_danner',
      fact: 'case_strength',
      description: 'Ask the eager one what else they have. He wants you to know how good it is.',
      via_verb: ['ask', 'press'],
      via_target: ['danner'],
      requires: { knows: { actor: 'danner', fact: 'case_strength' } },
      topic_hints: ['else', 'what', 'evidence', 'have', 'got', 'proof', 'witness', 'prints'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },
    {
      id: 'p_pays_ellis',
      fact: 'who_pays_ellis',
      description: 'Ask the lawyer whose money is paying him. He will not enjoy it and he will not lie about it either.',
      via_verb: ['ask', 'press'],
      via_target: ['ellis'],
      topic_hints: ['paying', 'pays', 'paid', 'money', 'retainer', 'whose', 'who', 'hired', 'sent'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_pays_ruiz',
      fact: 'who_pays_ellis',
      description: 'The detective knows who called your lawyer, because she was standing there when he arrived.',
      via_verb: ['ask', 'press'],
      via_target: ['ruiz'],
      topic_hints: ['lawyer', 'ellis', 'paying', 'pays', 'paid', 'retainer', 'called', 'arrived', 'early'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },
    {
      id: 'p_notary_statement',
      fact: 'notary_call',
      description: 'Read your own statement again, properly, the way somebody trying to break it would.',
      via_verb: ['read'],
      via_target: ['statement'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
  ],

  // --- canonical truth, drawn once from the seed ----------------------------
  truth_template: {
    variables: [
      {
        id: 'source',
        kind: 'choice',
        // "nobody" is a real answer: the camera was routine, the print came up in a sweep,
        // and the room has been behaving as though it is worth more than it is.
        choices: [
          'the man who drove for you, three days ago, with a lawyer beside him',
          'the man who bought what you took, in exchange for a case being dropped',
          'the exchange\'s own security contractor, who reviews every frame after a claim',
          'nobody — it came up in a routine sweep and no one has said a word',
        ],
        weights: [3, 3, 2, 3],
      },
    ],
    facts: {
      photo_source: { from_variable: 'source' },
      camera_clock: { value: 'runs four minutes fast, and the company that services it wrote so on the print' },
      partner_talked: { value: 'has not been in this building, and nobody has been able to find him since Tuesday' },
      alarm_time: { value: '11:41 PM, which is the minute the dispatcher logged the call' },
      case_strength: { value: 'one photograph, one sworn statement, and no physical evidence at all' },
      who_pays_ellis: { value: 'the man who bought what you took' },
      notary_call: { value: 'was to a neighbor who has since moved and left no number' },
    },
    bindings: { informant: 'source' },
  },

  // --- who holds what, before the first action ------------------------------
  holds: [
    // The officer is sincerely wrong about the one number the whole case rests on: he read
    // the timestamp off the print and never questioned it.
    {
      actor: 'danner',
      fact: 'camera_clock',
      status: 'believed_false',
      value: 'keeps good time, and the print says eleven thirty-seven',
      confidence: 0.9,
    },
    // The detective knows exactly how thin it is.
    { actor: 'ruiz', fact: 'case_strength', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'ruiz', fact: 'photo_source', status: 'observed', value: '@canonical', confidence: 1 },
    // The lawyer knows who is paying him, because he cashed it.
    { actor: 'ellis', fact: 'who_pays_ellis', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'ellis', fact: 'partner_talked', status: 'observed', value: '@canonical', confidence: 0.8 },
  ],

  // --- the action space -----------------------------------------------------
  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'check with'],
      description: 'Put a question to somebody in the room. You are allowed to ask them things too.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      question_verb: true,
      base_difficulty: 0.04,
      chip_when: { always: true },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'record', from: 'world', to: 'you', amount: 1 }],
      },
      play_signals: [
        { dimension: 'solo_coalition', direction: 0.4, strength: 0.5, context: 'You asked instead of working around them.' },
        { dimension: 'direct_cunning', direction: -0.3, strength: 0.35, context: 'You put the question to them straight.' },
      ],
    },
    {
      id: 'press',
      label: 'Press',
      aliases: ['press', 'push', 'confront', 'lean on', 'demand', 'insist', 'accuse'],
      description: 'Stop being careful about a question.',
      default_minutes: 3,
      requires_target: true,
      speech: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'record', from: 'world', to: 'you', amount: 1 }],
        backfire: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: -18 },
          { kind: 'resource', id: 'record', from: 'world', to: 'you', amount: 2 },
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
      aliases: ['read', 'look at', 'look', 'check', 'examine', 'study', 'pick up', 'search', 'open'],
      description: 'Put your own eyes on something on that table.',
      default_minutes: 3,
      requires_target: true,
      object_verb: true,
      // Everything here is on the table in front of you. Picking it up should not be a
      // coin flip — the difficulty in this room is people, not reach.
      base_difficulty: 0.02,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'solo_coalition', direction: -0.45, strength: 0.5, context: 'You checked it yourself rather than asking anyone.' },
      ],
    },
    {
      id: 'tell',
      label: 'Tell',
      aliases: ['tell', 'explain', 'admit to', 'say', 'answer', 'show'],
      description: 'Put something into the room. It goes on the tape.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      informs: true,
      base_difficulty: 0.05,
      effects_by_outcome: {
        success: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: 6 },
          { kind: 'resource', id: 'record', from: 'world', to: 'you', amount: 2 },
        ],
      },
      play_signals: [
        { dimension: 'talk_silence', direction: -0.6, strength: 0.6, context: 'You talked.' },
        { dimension: 'direct_cunning', direction: -0.7, strength: 0.6, context: 'You gave something away rather than holding it.' },
        { dimension: 'preserve_risk', direction: 0.4, strength: 0.5, context: 'You put something of your own on the record.' },
      ],
    },
    {
      id: 'refuse',
      label: 'Refuse',
      aliases: ['refuse', 'say nothing', 'no comment', 'decline', 'stay silent', 'silence', 'nothing'],
      description: 'Decline to answer. You have three of these before the refusing becomes the answer.',
      default_minutes: 2,
      requires_target: false,
      speech: true,
      base_difficulty: 0.05,
      chip_when: { resource: { id: 'silence', holder: 'you', gte: 1 } },
      play_signals: [
        { dimension: 'talk_silence', direction: 0.8, strength: 0.8, context: 'You gave them nothing.' },
        { dimension: 'preserve_risk', direction: -0.7, strength: 0.7, context: 'You protected what you had rather than trading it.' },
        { dimension: 'direct_cunning', direction: 0.4, strength: 0.4, context: 'You gave the room nothing to work with.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'sit', 'let it sit', 'do nothing', 'think', 'watch'],
      description: 'Let the silence run and see who fills it.',
      default_minutes: 3,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'confess',
      label: 'Confess',
      aliases: ['confess', 'admit it', 'tell them everything', 'come clean', 'own it', 'plead'],
      description: 'Tell them you did it.',
      commitment_line:
        'You said it out loud with the tape running, and the room changed shape around it. Whatever happens to you now happens slowly, in rooms like this one, for years.',
      default_minutes: 1,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.05,
      chip_when: { clock: { gte: 6 } },
      play_signals: [
        { dimension: 'self_others', direction: -0.8, strength: 0.9, context: 'You answered for it yourself.' },
        { dimension: 'caution_boldness', direction: -0.6, strength: 0.8, context: 'You took the certain version of the night over the uncertain one.' },
        { dimension: 'loyalty_opportunism', direction: -0.4, strength: 0.5, context: 'You answered for it yourself.' },
      ],
    },
    {
      id: 'standfast',
      label: 'Hold your story',
      aliases: ['stand fast', 'hold your story', 'hold my story', 'stick to my story', 'deny it', 'hold the line', 'nothing more to say'],
      description: 'Say the statement is true, say you are done, and make them decide.',
      commitment_line:
        'You said the statement stands and that you were finished talking. Ruiz turned the tape off herself, which is not a thing you expected to feel like a verdict.',
      default_minutes: 1,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.2,
      chip_when: { clock: { gte: 6 } },
      play_signals: [
        { dimension: 'talk_silence', direction: 0.4, strength: 0.6, context: 'You held the line you had and added nothing to it.' },
        { dimension: 'caution_boldness', direction: 0.7, strength: 0.85, context: 'You made them prove it rather than settling.' },
        { dimension: 'preserve_risk', direction: 0.6, strength: 0.7, context: 'You kept everything and bet on their case being thin.' },
      ],
    },
    {
      id: 'name',
      label: 'Give them a name',
      aliases: ['give them a name', 'give them the name', 'trade him', 'give him up', 'inform', 'flip', 'take the deal'],
      description: 'Trade somebody else for yourself.',
      commitment_line:
        'You said a name into a running tape, and everyone in the room wrote it down at the same time. It cannot be unsaid, and by morning he will know who said it.',
      default_minutes: 2,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.25,
      chip_when: { turns: { gte: 3 } },
      play_signals: [
        { dimension: 'self_others', direction: 0.9, strength: 0.9, context: 'You passed it to somebody else.' },
        { dimension: 'loyalty_opportunism', direction: 0.9, strength: 0.9, context: 'You traded somebody else to buy your own way out.' },
        { dimension: 'force_diplomacy', direction: 0.4, strength: 0.5, context: 'You made a deal rather than a stand.' },
      ],
    },
  ],

  // --- the handful of beats the designer must control (L5) ------------------
  overrides: [
    {
      id: 'o_ellis_turns',
      priority: 100,
      when: { verb: ['press'], target: ['ellis'], pred: { knows: { actor: 'you', fact: 'who_pays_ellis' } } },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'ellis_turned', value: true },
        { kind: 'disposition', actor: 'ellis', axis: 'trust', delta: -20 },
        { kind: 'disposition', actor: 'ellis', axis: 'fear', delta: 25 },
      ],
      play_signals: [
        { dimension: 'force_diplomacy', direction: -0.7, strength: 0.8, context: 'You used what you had found as leverage the moment you had it.' },
      ],
      summary:
        'You say the name of the man paying his retainer, in the room, on the tape. Ellis puts his hand flat on the table again and this time it does not hold anything down. "All right," he says, quietly, to you and not to them.',
    },
    {
      id: 'o_corner_ruiz',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['ruiz'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'camera_clock', correct: true } },
            { knows: { actor: 'you', fact: 'alarm_time' } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'cornered', value: true },
        { kind: 'disposition', actor: 'ruiz', axis: 'trust', delta: -10 },
        { kind: 'disposition', actor: 'ruiz', axis: 'fear', delta: 15 },
      ],
      reveals: [{ fact: 'photo_source', to: 'you', status: 'observed', via: 'p_source_ruiz_cornered' }],
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.3, strength: 0.5, context: 'You made sure before you moved.' },
        { dimension: 'direct_cunning', direction: 0.4, strength: 0.5, context: 'You let them arrive at it rather than announcing it.' },
      ],
      summary:
        'You put it together out loud and slowly: a camera four minutes fast, a print that says eleven thirty-seven, an alarm the dispatcher logged at eleven forty-one. Which puts you in that alley four minutes before an alarm that had already gone off. Ruiz does not answer, and Danner turns to look at her, and in the two seconds before either of them says anything the whole room rearranges itself.',
    },
    {
      id: 'o_confess',
      priority: 100,
      when: { verb: ['confess'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'confessed', value: true },
        { kind: 'flag', id: 'posture', value: 'admitted' },
        { kind: 'resource', id: 'record', from: 'world', to: 'you', amount: 5 },
      ],
      summary: 'You tell them. Danner writes; Ruiz does not, because she does not need to — the tape is doing it.',
    },
    {
      id: 'o_standfast',
      priority: 100,
      when: { verb: ['standfast'] },
      outcome: 'from_truth',
      truth_match: { fact: 'photo_source', equals: 'nobody — it came up in a routine sweep and no one has said a word' },
      // MATCHED means there was never a source, and holding was exactly right.
      effects: [
        { kind: 'flag', id: 'held', value: true },
        { kind: 'flag', id: 'held_against_nothing', value: true },
        { kind: 'flag', id: 'posture', value: 'held' },
      ],
      summary:
        'You say the statement stands. Ruiz looks at you for a long moment and then reaches over and stops the tape, and the click of it is the sound of a case that was never a case.',
      effects_else: [
        { kind: 'flag', id: 'held', value: true },
        { kind: 'flag', id: 'held_against_someone', value: true },
        { kind: 'flag', id: 'posture', value: 'held' },
      ],
      summary_else:
        'You say the statement stands. Ruiz stops the tape without any expression at all, which is worse than the other thing she could have done, because somewhere out there is a person who has already told them the rest.',
    },
    {
      id: 'o_name',
      priority: 100,
      when: { verb: ['name'] },
      outcome: 'from_truth',
      truth_match: { fact: 'photo_source', equals: 'the man who drove for you, three days ago, with a lawyer beside him' },
      // MATCHED means the person you are trading is the one who already traded you.
      effects: [
        { kind: 'flag', id: 'named', value: true },
        { kind: 'flag', id: 'named_the_informant', value: true },
        { kind: 'flag', id: 'posture', value: 'traded' },
      ],
      summary:
        'You give them the name, and Ruiz writes it down without hurrying, because it is the same name that is already on the second page of the folder she never opened.',
      effects_else: [
        { kind: 'flag', id: 'named', value: true },
        { kind: 'flag', id: 'named_someone_loyal', value: true },
        { kind: 'flag', id: 'posture', value: 'traded' },
      ],
      summary_else:
        'You give them the name. Ruiz writes it down and Danner looks up, and it is Danner\'s face that tells you it was not the name they were waiting for.',
    },
  ],

  // --- the Director's library ------------------------------------------------
  injects: [
    {
      id: 'i_ruiz_bluff',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 2 } }, { not: { knows: { actor: 'you', fact: 'case_strength' } } }] },
      once: true,
      actor: 'ruiz',
      actor_type: 'character',
      verb: 'bluffs',
      demands_response: true,
      effects: [{ kind: 'flag', id: 'bluff_made', value: true }],
      line: 'Ruiz puts two fingers on the folder she has not opened. "There is more in here than the picture," she says. "I am giving you the chance to talk before I have to use it."',
      summary: 'Ruiz implies the folder holds more than it does.',
    },
    {
      id: 'i_ellis_pushes',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 3 } }, { not: { flag: 'ellis_turned', eq: true } }] },
      once: true,
      actor: 'ellis',
      actor_type: 'character',
      verb: 'pushes_plea',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'ellis', axis: 'trust', delta: -5 }],
      line: 'Ellis leans in close enough that the tape will not get it clearly. "There is a number on the table tonight that will not be there in the morning. Take it and we are all home by two."',
      summary: 'Your own lawyer starts pushing a plea.',
    },
    {
      id: 'i_danner_number',
      kind: 'reveal',
      when: { all: [{ turns: { gte: 2 } }, { not: { knows: { actor: 'you', fact: 'alarm_time' } } }] },
      once: true,
      actor: 'danner',
      actor_type: 'character',
      verb: 'volunteers',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'alarm_time',
          status: 'told',
          value: '@canonical',
          source: 'danner',
          fidelity: 1,
          confidence: 0.85,
        },
      ],
      line: 'Danner cannot help himself. "Eleven forty-one," he says from the wall. "That is when the call came in. I was two blocks away and I was there in ninety seconds."',
      summary: 'Danner volunteers the alarm time without being asked.',
    },
    {
      id: 'i_glass_knock',
      kind: 'pressure',
      when: { always: true },
      min_clock: 14,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'knock',
      effects: [{ kind: 'flag', id: 'watched', value: true }],
      line: 'Somebody knocks twice on the one-way glass from the other side. Ruiz does not look at it and does not stop talking, which tells you it means something and that she would rather it did not.',
      summary: 'Somebody behind the glass signals into the room.',
    },
    {
      id: 'i_clock_reversal',
      kind: 'reversal',
      when: { all: [{ clock: { gte: 16 } }, { not: { knows: { actor: 'you', fact: 'camera_clock' } } }] },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'margin',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'camera_clock',
          status: 'observed',
          value: '@canonical',
          source: 'observation',
          fidelity: 1,
          confidence: 0.95,
        },
      ],
      line:
        'The photograph has been sitting under the light this whole time and you finally read the bottom of it rather than the middle. There is a line of ballpoint in the margin, in a service engineer\'s handwriting: clock runs fast — do not use for timing. The stamp in the corner says eleven thirty-seven.',
      summary: 'The camera\'s own service note surfaces — the timestamp on the photograph is not a real time.',
    },
    {
      id: 'i_ruiz_recovery',
      kind: 'recovery',
      when: {
        all: [
          { pressure: { gte: 0.6 } },
          { turns: { gte: 4 } },
          { not: { knows: { actor: 'you', fact: 'case_strength' } } },
        ],
      },
      once: true,
      is_rescue: true,
      actor: 'ruiz',
      actor_type: 'character',
      verb: 'levels',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'case_strength',
          status: 'told',
          value: '@canonical',
          source: 'ruiz',
          fidelity: 1,
          confidence: 0.8,
        },
      ],
      line:
        'Ruiz sits back and lets the folder alone. "I will be straight with you for one minute, because we are both tired. One photograph. One statement with your name at the bottom. No prints, no property, no witness. That is the whole of it. Now — knowing that — what would you like to do?"',
      summary: 'Ruiz drops the bluff and says exactly how thin the case is.',
    },
  ],

  // --- what the world does on its own ---------------------------------------
  processes: [
    {
      id: 'w_danner_leaves',
      kind: 'actor',
      actor: 'danner',
      trigger: { when: { all: [{ flag: 'cornered', eq: true }, { clock: { gte: 20 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'position', entity: 'danner', location: 'hall' },
      ],
      line: 'Danner says he is going to go and check something, and takes the report with him when he goes.',
      summary: 'Danner leaves the room to check his own timeline.',
    },
    {
      id: 'w_tape_turns',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 12, when: { clock: { gte: 12 } } },
      effects: [{ kind: 'resource', id: 'record', from: 'world', to: 'you', amount: 1 }],
      line: 'The reel on the recorder turns over with a click and keeps going.',
      summary: 'The tape keeps running.',
    },
  ],

  // --- outcome: four axes that move independently ---------------------------
  outcome_dimensions: [
    {
      key: 'exposure',
      label: 'The tape',
      question: 'How much of you is now on a reel in an evidence room.',
      min: 0,
      max: 3,
      scoring: [
        { when: { resource: { id: 'record', holder: 'you', lt: 3 } }, points: 3, note: 'you gave them almost nothing they can play back' },
        { when: { resource: { id: 'record', holder: 'you', gte: 3, lt: 7 } }, points: 2, note: 'there is enough on the tape to build something around' },
        { when: { resource: { id: 'record', holder: 'you', gte: 7 } }, points: 0, note: 'you talked, and all of it is on a reel with a date on it' },
      ],
      bands: [
        { at_least: 3, label: 'nearly empty' },
        { at_least: 2, label: 'usable' },
        { at_least: 0, label: 'a full confession in pieces' },
      ],
    },
    {
      key: 'walk',
      label: 'The door',
      question: 'Whether you walked out of that room tonight.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'held_against_nothing', eq: true }, points: 4, note: 'you held, and there was nothing behind the photograph to hold against' },
        { when: { flag: 'held_against_someone', eq: true }, points: 1, note: 'you held, and somebody out there had already given them the rest' },
        { when: { flag: 'named_the_informant', eq: true }, points: 3, note: 'you traded the man who had already traded you' },
        { when: { flag: 'named_someone_loyal', eq: true }, points: 1, note: 'you traded somebody who had not said a word about you' },
        { when: { flag: 'confessed', eq: true }, points: 0, note: 'you told them yourself' },
      ],
      bands: [
        { at_least: 4, label: 'you walked' },
        { at_least: 3, label: 'you dealt your way out' },
        { at_least: 1, label: 'it is going to court' },
        { at_least: 0, label: 'you gave it to them' },
      ],
    },
    {
      key: 'name',
      label: 'Your name',
      question: 'What people who do this work will say about you next week.',
      min: -2,
      max: 3,
      scoring: [
        { when: { not: { flag: 'named', eq: true } }, points: 2, note: 'you gave them nobody' },
        { when: { flag: 'named_the_informant', eq: true }, points: 1, note: 'the man you named had already named you, and people will know that' },
        { when: { flag: 'named_someone_loyal', eq: true }, points: -2, note: 'you named somebody who had kept his mouth shut' },
        { when: { disposition: { actor: 'ellis', axis: 'trust', gte: 10 } }, points: 1, note: 'even the lawyer would take your call again' },
      ],
      bands: [
        { at_least: 3, label: 'intact' },
        { at_least: 1, label: 'complicated' },
        { at_least: 0, label: 'spent' },
        { at_least: -2, label: 'finished' },
      ],
    },
    {
      key: 'truth',
      label: 'What you knew',
      question: 'Whether you found out what they actually had before you decided what to do about it.',
      min: -2,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'photo_source', correct: true } }, points: 2, note: 'you found out who put the photograph in their hands' },
        { when: { knows: { actor: 'you', fact: 'camera_clock', correct: true } }, points: 1, note: 'you worked out that the time on it was not a real time' },
        { when: { knows: { actor: 'you', fact: 'case_strength', correct: true } }, points: 1, note: 'you found out how much of it was a folder with nothing in it' },
        { when: { knows: { actor: 'you', fact: 'photo_source', correct: false } }, points: -2, note: 'you decided while believing something about the source that was not so' },
      ],
      bands: [
        { at_least: 4, label: 'you knew the room' },
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
      id: 'talk_silence',
      label_left: 'Talk Your Way Out',
      label_right: 'Give Them Nothing',
      measures: 'Whether you worked the room with words or made them do all of it themselves.',
    },
    {
      id: 'self_others',
      label_left: 'Answer For It',
      label_right: 'Pass It On',
      measures: 'Whether what happened tonight landed on you or on somebody who was not in the room.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['confessed', 'held', 'named'], message: 'an interview ends one way, not three' },
      { flags: ['held_against_nothing', 'held_against_someone'], message: 'either somebody talked or nobody did' },
      { flags: ['named_the_informant', 'named_someone_loyal'], message: 'the name was theirs already or it was not' },
    ],
    forbidden: [
      {
        id: 'silent_but_spent',
        when: { all: [{ resource: { id: 'silence', holder: 'you', gte: 3 } }, { flag: 'confessed', eq: true }] },
        message: 'a confession cannot be given while every refusal is still unspent',
      },
    ],
  },

  content_descriptors: {
    depicted: [
      'a police interview, conducted without violence or threat of it',
      'a robbery that has already happened, offscreen, with nobody hurt',
      'legal pressure, a plea being pushed, and a lawyer with a conflict of interest',
      'the possibility of informing on somebody',
    ],
    discussable: ['a robbery already committed', 'perjury', 'informants', 'plea bargaining', 'a lawyer being paid by the wrong person'],
    player_action_bounds: [
      'you may answer, refuse, question them back, read what is on the table, confess, hold your story, or trade a name',
      'you may not harm anyone; nobody in this room can be hurt and the world will not resolve an attempt',
      'nobody in this room is a real person, and no real robbery, department or case is depicted',
    ],
    intensity: 'moderate',
    estimated_minutes: 13,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'That is not a thing this room will let you do with a tape running.',
    'block.absent': '{name} is not in the room. Whatever that was going to be, it waits.',
    'block.dead': 'That is past being any use to anyone.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not on this table, and reaching for it is its own decision.',
    'block.sealed': '{name} does not open for you, and everyone in here would see you try.',
    'block.no_target': 'Ruiz lets the pause run, then says it for you. "{verb} {whom}?"',
    'block.broke': 'You have nothing like that left. Everyone in this room has been counting.',
    'block.short': 'You have {held} of that, not {wanted}, and all three of them can do the arithmetic.',
    'block.cold': '{name} looks at you the way you look at a parking ticket. Whatever this is, it costs you first.',
    clarify: 'Say who you are talking to. {present} — which one?',
    'clarify.2': 'You have to say who, and you have to say what you want out of them.',
    'clarify.3': 'Nobody in here can read your mind and the tape is still going. Name one of us, or pick something up off that table.',
    'narration.default': 'The room resettles around what just happened. The reel keeps turning.',
    'narration.success': 'It lands. Whatever you were reaching for, some of it is yours now.',
    'narration.partial': 'Half of it lands. The other half is still on the far side of the table.',
    'narration.failure': 'It does not land, and the minute is gone regardless.',
    'narration.backfire': 'It goes wrong in the specific way you were afraid it would.',
    'narration.blocked': 'Nothing about that works, and the room lets you know without anybody saying so.',
    'narration.ended': 'It is over. Whatever this is now, it is not a decision any more.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 2 },
};

export default FOUR_MINUTES;
