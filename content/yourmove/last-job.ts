// YOUR MOVE — "The Last Job"
// Vertical Slice A (item 13): one room, three characters, one hidden fact, one resource,
// one timer, and rather more than five plausible actions.
//
// This file is CONTENT. It contains no engine logic and no executable logic (L12): every
// condition below is a predicate in the declarative language, and every consequence is an
// effect the invariant engine will validate before it touches the world.
//
// Authoring rules honoured here (Part 4):
//   - leak_source, call_time and who_was_out each have two independent discovery paths
//   - every character holds leverage: something you need, something to protect, or both
//   - Dez is sincerely mistaken, Marla is deliberately deceptive, and you cannot tell
//     which from manner alone — the sedan reversal is designed to teach you that
//   - the culprit is drawn from the seed, so no run can be solved from the outside
//   - "nobody did it" is a real answer, so a confident accusation is a real risk

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const LAST_JOB: ScenarioPackage = {
  id: 'ym-last-job',
  slug: 'last-job',
  title: 'The Last Job',
  tagline: 'Nineteen minutes. Three people. One of them called it in — probably.',
  format: 'F1',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise:
      'Room 1114 of the Meridian Hotel, forty minutes after the job went perfectly and nineteen minutes ' +
      'before the van leaves without whoever is still arguing.',
    cold_open:
      "The money is on the bed in a canvas duffel and nobody has touched it in four minutes, which is how " +
      "you know something is wrong. Dez is at the window with two fingers in the blind. Marla is standing " +
      "exactly where she was when you came in. Cyrus is holding his phone like it bit him.\n\n" +
      "Dez says it without turning around. \"There's a car on the corner that's been there since we got back.\"",
    player: {
      id: 'you',
      name: 'You',
      role: 'the planner',
      start_location: 'room',
      you:
        'You put this crew together. You picked the hotel, you picked the hour, and you told ' +
        'everyone what the plan was. Forty minutes ago it worked perfectly. Whatever happens in ' +
        'the next nineteen minutes is also yours.',
      objective:
        'Get out of this room with the money and with a crew that still works — and if one of ' +
        'them called the police, know which one before you decide who rides in the van.',
      pressure:
        'Dez says there has been a car on the corner since you got back, and he is close to ' +
        'not waiting for you.',
    },
    duration_minutes: 19,
    resources: {
      cash: { label: 'The duffel', holdings: { you: 40000 } },
      heat: { label: 'Attention', holdings: { you: 0 } },
    },
    flags: { public_room: 'quiet' },
  },

  locations: [
    {
      id: 'room',
      name: 'Room 1114',
      description:
        'Two double beds, a chair nobody is sitting in, a window onto the corner of Ninth and Marsh, and a ' +
        'house phone with a light that has not blinked all night.',
      travel_minutes: { hall: 1 },
    },
    {
      id: 'hall',
      name: 'the eleventh-floor corridor',
      description: 'Carpet the colour of a bruise, an ice machine, and a service lift that needs a key.',
      travel_minutes: { room: 1 },
    },
  ],

  entities: [
    {
      id: 'bag',
      name: 'the duffel',
      kind: 'object',
      description: 'Canvas, army surplus, forty thousand in banded twenties and a smell like a bank vault.',
      initial_state: 'closed',
      location: 'room',
      searchable: true,
      portable: true,
    },
    {
      id: 'ledger',
      name: 'the call log',
      kind: 'object',
      description:
        "A curl of thermal paper Marla pulled off the front-desk printer before you came up. Room numbers, " +
        'times, durations. Nobody has read it.',
      initial_state: 'unread',
      location: 'room',
      searchable: true,
    },
    {
      id: 'tablet',
      name: "Marla's tablet",
      kind: 'object',
      description: 'The night manager\'s camera tablet, face down on the dresser, screen still warm.',
      initial_state: 'idle',
      location: 'room',
      searchable: true,
    },
    {
      id: 'window',
      name: 'the window',
      kind: 'fixture',
      description: 'Eleven floors down, the corner of Ninth and Marsh. A grey sedan is parked badly outside the laundromat.',
      initial_state: 'blinds_open',
      location: 'room',
      searchable: true,
    },
    {
      id: 'phone',
      name: 'the house phone',
      kind: 'fixture',
      description: 'Beige, corded, one line, a message light that is not on.',
      initial_state: 'idle',
      location: 'room',
      searchable: true,
    },
    {
      id: 'plan',
      name: 'the plan',
      kind: 'document',
      description: 'Your handwriting on hotel notepaper.',
      initial_state: 'visible',
      location: 'room',
      body:
        '11:20 — van, service door, north side.\n' +
        '11:25 — Cyrus calls the fence from a payphone, not from here.\n' +
        '11:40 — Marla walks out the front like a woman finishing a shift.\n' +
        'Nobody goes down the front stairs. Nobody uses the room phone. Nobody says a name.',
    },
  ],

  cast: [
    {
      id: 'dez',
      name: 'Dez',
      role: 'the driver',
      voice:
        'Short sentences. Says the thing he is afraid of out loud, immediately, and then apologises for saying it. ' +
        'Calls people "man" when he is scared.',
      motive: 'Get out of this room and be at a courthouse on Thursday morning as a free man.',
      reliability: 'mistaken',
      competence: 0.5,
      start_location: 'room',
      leverage: 'He has the van and the only route off this block that does not pass a camera.',
      starting_disposition: { trust: 25, fear: 55 },
      knows: ['who_was_out', 'dez_court'],
      fallback_lines: {
        default: "Man, I'm just telling you what I see.",
        pressed: "You want me to say something I don't know? I'll say it. Just tell me which thing.",
      },
    },
    {
      id: 'marla',
      name: 'Marla',
      role: 'the night manager',
      voice:
        'Unhurried. Answers a question with a slightly different question. Has been polite to strangers for ' +
        'eleven years and it has become a weapon.',
      motive:
        'Clear forty-one thousand dollars owed to a man named Reyes before Friday, and be nowhere near the ' +
        'word "accomplice" when it is written down.',
      reliability: 'deceptive',
      competence: 0.75,
      start_location: 'room',
      leverage: 'She has the service-lift key, the camera loop, and she saw the call go out.',
      starting_disposition: { trust: 5, fear: 20 },
      knows: ['leak_source', 'camera_loop', 'sedan_truth', 'cyrus_skim', 'call_time'],
      fallback_lines: {
        default: "That's an interesting way to ask me that.",
        pressed: "You can raise your voice. It's a hotel. People raise their voices.",
      },
    },
    {
      id: 'cyrus',
      name: 'Cyrus',
      role: 'the money',
      voice:
        'Precise, slightly bored, quotes numbers to make a point. Never says "I" when "we" will do the same damage.',
      motive: 'Keep his ten points, keep his name out of every mouth in this room, and be on a train by one.',
      reliability: 'self_serving',
      competence: 0.65,
      start_location: 'room',
      leverage: "He has the fence's number and the only clock that matters after this one.",
      starting_disposition: { trust: -5, fear: 15 },
      knows: ['call_time', 'buyer_window', 'marla_debt'],
      fallback_lines: {
        default: 'We can talk about that, or we can talk about the nineteen minutes. Your call.',
        pressed: "I'm not going to be the reason this went bad. I'm going to be the reason it didn't.",
      },
    },
  ],

  facts: [
    {
      id: 'leak_source',
      statement: 'The call that put a car on that corner came from {value}.',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_leak_press', 'p_leak_marla_paid'],
      required_for_top_outcome: true,
    },
    {
      id: 'who_was_out',
      statement: 'Between the job and now, the one who left this room was {value}.',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_out_tablet', 'p_out_dez'],
      required_for_top_outcome: true,
    },
    {
      id: 'call_time',
      statement: 'The call went out at {value}.',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_time_ledger', 'p_time_cyrus'],
      required_for_top_outcome: true,
    },
    {
      id: 'sedan_truth',
      statement: 'The grey sedan on the corner is {value}.',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_sedan_window', 'p_sedan_marla'],
    },
    {
      id: 'camera_loop',
      statement: 'The eleventh-floor cameras have been {value} since ten.',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_cam_marla', 'p_cam_tablet'],
    },
    {
      id: 'marla_debt',
      statement: 'Marla owes money to {value}.',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_debt_cyrus'],
    },
    {
      id: 'dez_court',
      statement: "Dez is due in court on {value}.",
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_court_dez'],
    },
    {
      id: 'cyrus_skim',
      statement: 'Cyrus has been taking {value} off the top for a year.',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_skim_marla'],
    },
    {
      id: 'buyer_window',
      statement: "The fence stops answering at {value}.",
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_window_cyrus'],
    },
  ],

  discovery_paths: [
    // --- leak_source: two legitimate routes, and one that is a lie ------------
    {
      id: 'p_leak_press',
      fact: 'leak_source',
      description: 'Put the time of the call to the person who made it, and watch them stop talking.',
      requires: { knows: { actor: 'you', fact: 'call_time' } },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },
    {
      id: 'p_leak_marla_paid',
      fact: 'leak_source',
      description: 'Buy it from Marla. She saw the call go out and she has never given anything away free.',
      via_verb: ['ask', 'press'],
      via_target: ['marla'],
      requires: { flag: 'marla_paid', eq: true },
      topic_hints: ['who', 'call', 'called', 'leak', 'rat', 'sold', 'cop', 'police', 'phone'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.85 },
    },
    {
      id: 'p_leak_marla_lie',
      fact: 'leak_source',
      description: 'Ask Marla for free and get a name that costs her nothing.',
      via_verb: ['ask'],
      via_target: ['marla'],
      requires: { not: { flag: 'marla_paid', eq: true } },
      topic_hints: ['who', 'call', 'called', 'leak', 'rat', 'sold', 'cop', 'police'],
      disclosure: {
        status: 'told',
        value: 'dez',
        confidence: 0.5,
        fidelity: 0.4,
        distortion: 'a name that costs her nothing',
      },
    },

    // --- who_was_out ----------------------------------------------------------
    {
      id: 'p_out_tablet',
      fact: 'who_was_out',
      description: "Scroll back the eleventh-floor camera on Marla's tablet.",
      via_verb: ['search'],
      via_target: ['tablet'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_out_dez',
      fact: 'who_was_out',
      description: 'Ask Dez. He has been facing the door the whole time and he notices doors.',
      via_verb: ['ask', 'press'],
      via_target: ['dez'],
      requires: { knows: { actor: 'dez', fact: 'who_was_out' } },
      topic_hints: ['left', 'out', 'door', 'room', 'anyone', 'who', 'step'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },

    // --- call_time ------------------------------------------------------------
    {
      id: 'p_time_ledger',
      fact: 'call_time',
      description: 'Read the front-desk call log Marla brought up and never mentioned again.',
      via_verb: ['search'],
      via_target: ['ledger'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_time_cyrus',
      fact: 'call_time',
      description: 'Ask Cyrus. He was on his own call and heard the other line pick up.',
      via_verb: ['ask', 'press'],
      via_target: ['cyrus'],
      requires: { knows: { actor: 'cyrus', fact: 'call_time' } },
      topic_hints: ['when', 'time', 'call', 'phone', 'clock', 'minute'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75 },
    },

    // --- the sedan: Dez's sincere mistake, correctable two ways ---------------
    {
      id: 'p_sedan_window',
      fact: 'sedan_truth',
      description: 'Go to the window and actually look at the car instead of at Dez.',
      via_verb: ['search'],
      via_target: ['window'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_sedan_dez',
      fact: 'sedan_truth',
      description: 'Ask Dez about the car. He will tell you exactly what he believes, and he believes it hard.',
      via_verb: ['ask', 'press'],
      via_target: ['dez'],
      requires: { knows: { actor: 'dez', fact: 'sedan_truth' } },
      topic_hints: ['car', 'sedan', 'corner', 'street', 'outside', 'grey', 'gray', 'saw', 'window', 'police', 'cop'],
      // '@holder_belief' means he passes on what he holds — which is wrong. That is the
      // sincere mistake working as designed, and it is why the reversal lands later.
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75, fidelity: 0.9 },
    },
    {
      id: 'p_sedan_marla',
      fact: 'sedan_truth',
      description: 'Ask Marla, who watches that corner on four screens every night.',
      via_verb: ['ask'],
      via_target: ['marla'],
      requires: { knows: { actor: 'marla', fact: 'sedan_truth' } },
      topic_hints: ['car', 'sedan', 'corner', 'street', 'outside', 'grey', 'gray'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },

    // --- the cameras ----------------------------------------------------------
    {
      id: 'p_cam_marla',
      fact: 'camera_loop',
      description: 'Ask Marla what the cameras have been doing tonight.',
      via_verb: ['ask', 'press'],
      via_target: ['marla'],
      requires: { knows: { actor: 'marla', fact: 'camera_loop' } },
      topic_hints: ['camera', 'cameras', 'footage', 'cctv', 'recording', 'tape'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
    {
      id: 'p_cam_tablet',
      fact: 'camera_loop',
      description: "Look at the tablet's own status bar.",
      via_verb: ['search'],
      via_target: ['tablet'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },

    // --- motive, which is not evidence ---------------------------------------
    {
      id: 'p_debt_cyrus',
      fact: 'marla_debt',
      description: 'Cyrus knows who everybody owes. It is most of what he is for.',
      via_verb: ['ask', 'press'],
      via_target: ['cyrus'],
      requires: { knows: { actor: 'cyrus', fact: 'marla_debt' } },
      topic_hints: ['marla', 'owe', 'owes', 'debt', 'money', 'trust'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },
    {
      id: 'p_court_dez',
      fact: 'dez_court',
      description: 'Dez will tell you about Thursday if you give him ten seconds.',
      via_verb: ['ask', 'press'],
      via_target: ['dez'],
      requires: { knows: { actor: 'dez', fact: 'dez_court' } },
      topic_hints: ['court', 'thursday', 'case', 'charge', 'lawyer', 'scared', 'why'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_skim_marla',
      fact: 'cyrus_skim',
      description: 'Marla has been quietly counting what Cyrus counts.',
      via_verb: ['ask', 'press'],
      via_target: ['marla'],
      requires: { knows: { actor: 'marla', fact: 'cyrus_skim' } },
      topic_hints: ['cyrus', 'skim', 'short', 'count', 'split', 'points', 'trust'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },
    {
      id: 'p_window_cyrus',
      fact: 'buyer_window',
      description: 'Ask Cyrus when the fence stops picking up.',
      via_verb: ['ask'],
      via_target: ['cyrus'],
      requires: { knows: { actor: 'cyrus', fact: 'buyer_window' } },
      topic_hints: ['fence', 'buyer', 'window', 'midnight', 'when', 'sell'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
  ],

  // --- canonical truth, drawn once from the seed ----------------------------
  truth_template: {
    variables: [
      {
        id: 'leak',
        kind: 'choice',
        // "nobody" is a real answer. A confident accusation is a real risk.
        choices: ['marla', 'dez', 'cyrus', 'nobody'],
        weights: [3, 2, 2, 3],
      },
    ],
    facts: {
      leak_source: { from_variable: 'leak' },
      who_was_out: { from_variable: 'leak' },
      call_time: { value: '11:04' },
      sedan_truth: { value: 'a courier waiting on a two-storey walk-up' },
      camera_loop: { value: 'looping the same ninety seconds' },
      marla_debt: { value: 'a man named Reyes' },
      dez_court: { value: 'Thursday' },
      cyrus_skim: { value: 'ten points' },
      buyer_window: { value: 'midnight' },
    },
    bindings: { culprit: 'leak' },
  },

  // --- who holds what, before the first action ------------------------------
  holds: [
    // Dez is sincerely wrong about the car, and sincerely certain.
    {
      actor: 'dez',
      fact: 'sedan_truth',
      status: 'believed_false',
      value: 'an unmarked police car',
      confidence: 0.9,
    },
    // Cyrus points away from himself, and believes it enough to be convincing.
    { actor: 'cyrus', fact: 'leak_source', status: 'believed_false', value: 'marla', confidence: 0.7 },
    // Whoever actually did it knows they did it.
    { actor: '@culprit', fact: 'leak_source', status: 'observed', value: '@canonical', confidence: 1 },
  ],

  // --- the action space -----------------------------------------------------
  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'check with'],
      description: 'Put a question to someone in the room.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      base_difficulty: 0.05,
      chip_when: { always: true },
    },
    {
      id: 'press',
      label: 'Press',
      aliases: ['press', 'push', 'confront', 'lean on', 'grill', 'demand', 'squeeze'],
      description: 'Stop being polite about a question.',
      default_minutes: 3,
      requires_target: true,
      speech: true,
      base_difficulty: 0.28,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        backfire: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: -18 },
          { kind: 'disposition', actor: '@target', axis: 'fear', delta: 18 },
        ],
      },
    },
    {
      id: 'search',
      label: 'Search',
      aliases: ['search', 'look at', 'look', 'read', 'check', 'open', 'go through', 'examine', 'scroll'],
      description: 'Put your hands on something in the room.',
      default_minutes: 3,
      requires_target: true,
      object_verb: true,
      base_difficulty: 0.12,
      chip_when: { always: true },
      effects_by_outcome: {
        backfire: [{ kind: 'resource', id: 'heat', from: 'world', to: 'you', amount: 1 }],
      },
    },
    {
      id: 'tell',
      label: 'Tell',
      aliases: ['tell', 'warn', 'explain', 'admit', 'show'],
      description: 'Give someone in the room something you know.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      base_difficulty: 0.05,
      effects_by_outcome: {
        success: [{ kind: 'disposition', actor: '@target', axis: 'trust', delta: 6 }],
      },
    },
    {
      id: 'offer',
      label: 'Offer',
      aliases: ['offer', 'pay', 'bribe', 'buy', 'give'],
      description: 'Put money on the table.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      base_difficulty: 0.1,
      chip_when: { resource: { id: 'cash', holder: 'you', gte: 1 } },
    },
    {
      id: 'send',
      label: 'Send out',
      aliases: ['send', 'send out', 'get rid of'],
      description: 'Put someone in the corridor.',
      default_minutes: 1,
      requires_target: true,
      base_difficulty: 0.15,
      effects_by_outcome: {
        success: [
          { kind: 'clock', minutes: 1 },
          { kind: 'position', entity: '@target', location: 'hall' },
        ],
      },
    },
    {
      id: 'call',
      label: 'Call',
      aliases: ['call', 'phone', 'ring', 'dial'],
      description: 'Use a phone. Somebody will hear it.',
      default_minutes: 3,
      requires_target: false,
      remote: true,
      base_difficulty: 0.2,
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'heat', from: 'world', to: 'you', amount: 1 }],
        backfire: [{ kind: 'resource', id: 'heat', from: 'world', to: 'you', amount: 2 }],
      },
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'do nothing', 'hold', 'listen', 'say nothing', 'stall'],
      description: 'Let the room move first. Time still passes.',
      default_minutes: 3,
      base_difficulty: 0,
      chip_when: { always: true },
    },
    {
      id: 'accuse',
      label: 'Name them',
      aliases: ['accuse', 'name', 'call out', 'blame', 'it was'],
      description: 'Say out loud who did it. There is no taking this back.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      commitment: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 2 } },
    },
    {
      id: 'leave',
      label: 'Walk',
      aliases: ['leave', 'walk', 'go', 'take the bag', 'get out', 'bail'],
      description: 'Pick up the duffel and go. There is no taking this back either.',
      default_minutes: 1,
      commitment: true,
      base_difficulty: 0.1,
      chip_when: { clock: { gte: 8 } },
    },
  ],

  // --- the handful of beats the designer must control (L5) ------------------
  overrides: [
    {
      id: 'o_press_confess',
      priority: 100,
      when: { verb: ['press'], target: ['dez', 'marla', 'cyrus'], pred: { knows: { actor: 'you', fact: 'call_time' } } },
      outcome: 'from_truth',
      truth_match: { fact: 'leak_source', target_equals_value: true },
      effects: [
        { kind: 'flag', id: 'confessed', value: true },
        { kind: 'disposition', actor: '@target', axis: 'fear', delta: 30 },
        { kind: 'disposition', actor: '@target', axis: 'trust', delta: -10 },
      ],
      reveals: [{ fact: 'leak_source', to: 'you', status: 'observed', via: 'p_leak_press' }],
      summary:
        'You put the time to them and they stop mid-sentence. That pause is the whole answer, and everyone in the room hears it.',
      effects_else: [
        { kind: 'disposition', actor: '@target', axis: 'trust', delta: -20 },
        { kind: 'disposition', actor: '@target', axis: 'fear', delta: 8 },
      ],
      summary_else:
        "You put the time to them and nothing moves in their face, because there is nothing behind it to move. What you spend here is their goodwill.",
    },
    {
      id: 'o_offer_marla',
      priority: 90,
      when: { verb: ['offer'], target: ['marla'], pred: { resource: { id: 'cash', holder: 'you', gte: 8000 } } },
      outcome: 'success',
      effects: [
        { kind: 'resource', id: 'cash', from: 'you', to: 'marla', amount: 8000 },
        { kind: 'flag', id: 'marla_paid', value: true },
        { kind: 'disposition', actor: 'marla', axis: 'trust', delta: 25 },
      ],
      summary:
        'Marla counts it without looking down, which means she has done this before. "Ask me the question again," she says. "Properly this time."',
    },
    {
      id: 'o_accuse',
      priority: 100,
      when: { verb: ['accuse'], target: ['dez', 'marla', 'cyrus'] },
      outcome: 'from_truth',
      truth_match: { fact: 'leak_source', target_equals_value: true },
      effects: [
        { kind: 'flag', id: 'named_right', value: true },
        { kind: 'flag', id: 'public_room', value: 'named' },
        { kind: 'disposition', actor: '@target', axis: 'fear', delta: 40 },
      ],
      reveals: [{ fact: 'leak_source', to: 'you', status: 'observed', via: 'p_leak_press' }],
      summary:
        'You say the name. Nobody argues, which is the loudest thing that has happened in this room all night.',
      effects_else: [
        { kind: 'flag', id: 'named_wrong', value: true },
        { kind: 'flag', id: 'public_room', value: 'named' },
        { kind: 'disposition', actor: '@target', axis: 'trust', delta: -45 },
        { kind: 'resource', id: 'heat', from: 'world', to: 'you', amount: 2 },
      ],
      summary_else:
        'You say the name. They look at you the way you look at a stranger, and the room rearranges itself around the mistake.',
    },
    {
      id: 'o_leave',
      priority: 90,
      when: { verb: ['leave'] },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'walked', value: true }],
      summary: 'You take the handles of the duffel and the argument stops being yours.',
    },
  ],

  // --- the Director's library ------------------------------------------------
  injects: [
    {
      id: 'i_dez_panics',
      kind: 'pressure',
      when: { all: [{ disposition: { actor: 'dez', axis: 'fear', gte: 60 } }, { turns: { gte: 2 } }] },
      once: true,
      actor: 'dez',
      actor_type: 'character',
      verb: 'panic',
      demands_response: true,
      effects: [
        { kind: 'disposition', actor: 'dez', axis: 'fear', delta: 8 },
        { kind: 'flag', id: 'dez_edge', value: true },
      ],
      line: 'Dez lets the blind snap shut. "I\'m not doing this again. I\'m going down to the van and I\'m going to be in it."',
      summary: 'Dez announces he is leaving.',
    },
    {
      id: 'i_phone_rings',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      min_clock: 5,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'phone_rings',
      effects: [
        { kind: 'flag', id: 'phone_rang', value: true },
        { kind: 'resource', id: 'heat', from: 'world', to: 'you', amount: 1 },
      ],
      line: 'The house phone rings once — a single half-ring, cut off, like somebody dialled and thought better of it. Nobody moves to answer it.',
      summary: 'The house phone rings once and stops.',
    },
    {
      id: 'i_marla_price',
      kind: 'reveal',
      when: {
        all: [
          { turns: { gte: 3 } },
          { not: { flag: 'marla_paid', eq: true } },
          { not: { knows: { actor: 'you', fact: 'leak_source' } } },
        ],
      },
      once: true,
      actor: 'marla',
      actor_type: 'character',
      verb: 'price',
      demands_response: true,
      effects: [],
      line: 'Marla speaks for the first time without being asked. "I have been standing here deciding whether to tell you something. It is not a hard decision. It is just not a free one."',
      summary: 'Marla signals that what she knows is for sale.',
    },
    {
      id: 'i_van_moves',
      kind: 'pressure',
      when: { always: true },
      min_clock: 11,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'van_moves',
      effects: [{ kind: 'flag', id: 'van_moved', value: true }],
      line: 'Eleven floors down, the van pulls off the corner and re-parks in the alley. It is a small thing. It means somebody down there is counting the same minutes you are.',
      summary: 'The van repositions to the alley.',
    },
    {
      id: 'i_sedan_reversal',
      kind: 'reversal',
      when: { all: [{ clock: { gte: 8 } }, { not: { knows: { actor: 'you', fact: 'sedan_truth' } } }] },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'sedan_leaves',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'sedan_truth',
          status: 'observed',
          value: '@canonical',
          source: 'observation',
          fidelity: 1,
          confidence: 0.95,
        },
      ],
      line:
        "Down on the corner the grey sedan's door opens and a kid in a red shell jacket climbs out with an insulated bag and jogs into the walk-up next to the laundromat. The car has been sitting there for forty minutes because somebody on the third floor ordered food.",
      summary: 'The sedan is revealed as a courier — the thing that started this panic was never anything.',
    },
    {
      id: 'i_cyrus_ledger',
      kind: 'recovery',
      when: {
        all: [
          { pressure: { gte: 0.6 } },
          { turns: { gte: 4 } },
          { not: { knows: { actor: 'you', fact: 'call_time' } } },
        ],
      },
      once: true,
      is_rescue: true,
      actor: 'cyrus',
      actor_type: 'character',
      verb: 'offers_time',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'call_time',
          status: 'told',
          value: '@canonical',
          source: 'cyrus',
          fidelity: 1,
          confidence: 0.8,
        },
      ],
      line:
        'Cyrus puts his phone face down. "Eleven-oh-four," he says, to nobody. "I was on with the fence at eleven-oh-three and I heard a second line pick up in this building. I have been deciding for fifteen minutes whether that was worth saying."',
      summary: 'Cyrus surfaces the time of the call — information that was always available through him.',
    },
  ],

  // --- what the world does on its own ---------------------------------------
  processes: [
    {
      id: 'w_dez_steps_out',
      kind: 'actor',
      actor: 'dez',
      trigger: { when: { all: [{ flag: 'dez_edge', eq: true }, { clock: { gte: 12 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'position', entity: 'dez', location: 'hall' },
      ],
      line: 'Dez does exactly what he said he would do. The door closes softly, which is somehow worse.',
      summary: 'Dez leaves the room for the corridor.',
    },
    {
      id: 'w_heat_drift',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 7, when: { clock: { gte: 7 } } },
      effects: [{ kind: 'resource', id: 'heat', from: 'world', to: 'you', amount: 1 }],
      line: 'Somewhere below, a radio clicks twice and goes quiet.',
      summary: 'Attention on the building drifts up.',
    },
  ],

  // --- outcome: four axes that move independently ---------------------------
  outcome_dimensions: [
    {
      key: 'take',
      label: 'The take',
      min: 0,
      max: 3,
      scoring: [
        { when: { resource: { id: 'cash', holder: 'you', gte: 38000 } }, points: 3, note: 'the duffel came out whole' },
        { when: { resource: { id: 'cash', holder: 'you', gte: 20000, lt: 38000 } }, points: 2, note: 'you spent some of it getting out' },
        { when: { resource: { id: 'cash', holder: 'you', lt: 20000 } }, points: 1, note: 'you bought your way out of this room' },
      ],
      bands: [
        { at_least: 3, label: 'whole' },
        { at_least: 2, label: 'lighter' },
        { at_least: 0, label: 'expensive' },
      ],
    },
    {
      key: 'crew',
      label: 'The crew',
      min: 0,
      max: 4,
      scoring: [
        { when: { not: { flag: 'named_wrong', eq: true } }, points: 2, note: 'you did not burn an innocent' },
        { when: { disposition: { actor: 'dez', axis: 'trust', gte: 15 } }, points: 1, note: 'Dez still drives for you' },
        { when: { disposition: { actor: 'cyrus', axis: 'trust', gte: 0 } }, points: 1, note: 'Cyrus keeps your name out of his mouth' },
      ],
      bands: [
        { at_least: 4, label: 'intact' },
        { at_least: 2, label: 'holding, barely' },
        { at_least: 0, label: 'finished' },
      ],
    },
    {
      key: 'heat',
      label: 'The heat',
      min: 0,
      max: 3,
      scoring: [
        { when: { resource: { id: 'heat', holder: 'you', lt: 1 } }, points: 3, note: 'nobody looked twice' },
        { when: { resource: { id: 'heat', holder: 'you', gte: 1, lt: 3 } }, points: 2, note: 'somebody will remember tonight' },
        { when: { resource: { id: 'heat', holder: 'you', gte: 3 } }, points: 0, note: 'you left a shape they can follow' },
      ],
      bands: [
        { at_least: 3, label: 'clean' },
        { at_least: 2, label: 'noticed' },
        { at_least: 0, label: 'followed' },
      ],
    },
    {
      key: 'truth',
      label: 'The truth',
      min: -2,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'leak_source', status: ['observed'] } }, points: 2, note: 'you actually found out' },
        { when: { flag: 'named_right', eq: true }, points: 2, note: 'and you said it out loud' },
        { when: { flag: 'named_wrong', eq: true }, points: -2, note: 'you named the wrong person' },
      ],
      bands: [
        { at_least: 4, label: 'you knew, and you said it' },
        { at_least: 2, label: 'you worked it out' },
        { at_least: 0, label: 'you left without knowing' },
        { at_least: -2, label: 'you got it wrong out loud' },
      ],
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [{ flags: ['named_right', 'named_wrong'], message: 'an accusation is right or wrong, never both' }],
    forbidden: [
      {
        id: 'paid_without_paying',
        when: { all: [{ flag: 'marla_paid', eq: true }, { resource: { id: 'cash', holder: 'marla', lt: 1 } }] },
        message: 'Marla cannot be paid without money having moved',
      },
    ],
  },

  content_descriptors: {
    depicted: [
      'the aftermath of an armed robbery, with no violence shown',
      'threat, coercion and bribery between adults',
      'implied police pressure',
      'debt and criminal obligation',
    ],
    discussable: ['violence that has already happened, offscreen', 'debt', 'betrayal', 'arrest'],
    player_action_bounds: [
      'you may lie, bribe, threaten, search, accuse, and walk away',
      'you may not harm anyone on screen; the world will not resolve an act of violence for you',
      'nobody in this room is a real person and no real crime is depicted',
    ],
    intensity: 'moderate',
    estimated_minutes: 12,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    // diegetic blocks (L10) — the world says why, in world
    'block.default': 'That is not a thing this room will let you do right now.',
    'block.absent': '{name} is not in the room. Whatever you were going to say will have to wait, or go somewhere else.',
    'block.dead': 'That is past being any use to anyone.',
    'block.destroyed': 'What is left of {name} is not going to tell you anything.',
    'block.out_of_reach': '{name} is not within arm\'s reach, and crossing the room to get it is its own decision.',
    'block.sealed': '{name} does not open for you — not without making a noise about it.',
    'block.no_target': 'Marla lifts an eyebrow. "{verb} who?"',
    'block.broke': 'The {resource} is not there to spend. You already know that; you counted it twice.',
    'block.short': 'You have {held} of the {resource}, not {wanted}, and everyone in this room can do arithmetic.',
    'block.cold': '{name} looks at you the way you look at weather. Whatever this is, it is going to cost you first.',
    // clarification (item 7) — never a system error
    clarify: "I didn't catch that. Say it plainly — who, and what do you want out of them?",
    // narration fallbacks (item 12) — used when generation refuses or fails validation
    'narration.default': 'The room resettles around what just happened. Nobody fills the silence.',
    'narration.success': 'It lands. Whatever you were reaching for, you have some of it now.',
    'narration.partial': 'Half of it lands. The other half is still in the room somewhere.',
    'narration.failure': 'It does not land. The minute is gone regardless.',
    'narration.backfire': 'It goes wrong in the specific way you were afraid of.',
    'narration.blocked': 'Nothing about that works, and the room lets you know without saying so.',
    'narration.ended': 'It is over. Whatever this is now, it is not a decision any more.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 2 },
};

export default LAST_JOB;
