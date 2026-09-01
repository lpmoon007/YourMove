// THE NOD — the third world on the Crime & Underworld shelf.
//
// Every other world in this catalogue is an aftermath. Something has happened and the
// scene is people working out what it was. This one is the half hour BEFORE, and the
// irreversible act is the ordinary one: saying yes to a thing four people have already
// spent money on. Calling it off costs too, which is the whole reason nobody wants to.
//
// The shape the engine needs, and where it is:
//   - one hidden thing drawn from the seed: what the inside man actually is, and one of
//     the four answers means the pattern the plan rests on stopped being true in June
//   - a character who is sincerely wrong and sure of it (the one who did the recce)
//   - a character who is lying about whether he is going in at all
//   - a character who is neither, and needs this to happen for reasons of his own
//   - every fact that matters reachable two ways: through a person, and through a thing

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const THE_NOD: ScenarioPackage = {
  id: 'ym-the-nod',
  slug: 'the-nod',
  title: 'The Nod',
  tagline: 'Four people, a borrowed van, and thirty minutes to decide whether tonight happens at all.',
  format: 'F1',
  genre: 'Crime — a railway arch at one in the morning, half an hour before a job that has not happened yet.',
  category: 'Crime & Underworld',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise:
      'The person who put a job together decides, in the half hour before the van has to move, whether it ' +
      'goes ahead as planned, goes ahead differently, or does not go at all.',
    ending_out_of_time:
      'One in the morning becomes half past and the window shuts on its own. Nobody had to say the word, ' +
      'which is its own kind of answer and the one everybody in this arch will remember you for.',
    setup:
      'You put together a job on a bonded warehouse by the canal: forty minutes between the night shift ' +
      'going off and the morning security coming on, one loading bay, and a pallet of duty-unpaid spirits ' +
      'worth about ninety thousand to the right buyer. Three other people are in this railway arch with ' +
      'you, a borrowed van is backed against the shutter, and eight thousand pounds of somebody\'s float ' +
      'is in a sports bag on the bench. Everything in the plan — the shift times, the gate, the rota — ' +
      'came from one man who works inside. Nobody in this arch has ever met him except one of you.',
    trouble:
      'Your lookout drove past this evening and came back with photographs and a bad feeling she cannot ' +
      'put a name to. The man who found the inside man says everything is fine and has said it four times ' +
      'now. The man who put the money up cannot afford for this to be called off and has not said why. ' +
      'And the plan is thirty minutes from being a thing that happened rather than a thing you discussed.',
    cold_open:
      'The arch smells of diesel and old brick and there is a light on over the bench because the strip ' +
      'light at the far end went months ago. The van is backed up to the shutter with the doors open. ' +
      'Sana has the photographs from tonight spread out on the bench and has not stopped looking at them ' +
      'since you came in. Ellis is sitting on the sports bag. Rook is by the shutter with his phone face ' +
      'down on the ledge beside him.\n\n' +
      'Sana says it without looking up. "I sat on that road for two hours and something about it is wrong ' +
      'and I cannot tell you what."',
    example_actions: [
      'ask Sana what she actually saw tonight',
      'look at the shift rota',
      'ask Rook how he knows the inside man',
    ],
    cast_note:
      'Three people, you, and one man inside the warehouse who is not here and cannot be reached tonight.',
    clock_label: 'before the van has to move',
    house_rules: [
      'Everything in the plan came from a man nobody here has met but one of you. What he actually is, is the one thing this arch cannot establish tonight.',
      'One of them is certain about something she watched for two hours and got wrong. One is lying about something that is not about the job. One needs this to go ahead and has not said why.',
      'Giving the nod ends it. So does calling it off, and so does going at it a different way. Everything before that, you can still take back.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the one who put it together',
      start_location: 'arch',
      you:
        'You found the job, picked these three, and told each of them it was sound. That is the whole of ' +
        'your authority here — nobody works for you and nobody has to do anything you say. They are in ' +
        'this arch at one in the morning because you said it was worth being in this arch at one in the ' +
        'morning.',
      objective:
        'Decide whether tonight happens — and find out what the plan is actually resting on before you say ' +
        'the word, rather than in a loading bay at half past two.',
      pressure:
        'The van has to be moving by half past or the window is gone. Everybody in this arch is watching ' +
        'you not say anything, and the longer that goes on the more it becomes the answer.',
    },
    duration_minutes: 30,
    resources: {
      float: { label: 'The float, in cash', holdings: { you: 8000 } },
      noise: { label: 'People who know tonight is tonight', holdings: { you: 0 } },
    },
    flags: { call: 'unmade' },

    opening: {
      prompt:
        'You put a job together on a bonded warehouse by the canal — forty minutes between shifts, one ' +
        'loading bay, ninety thousand in duty-unpaid spirits. Three people are in a railway arch with you, ' +
        'a van is backed up to the shutter, and eight thousand of somebody else\'s money is in a bag on the ' +
        'bench. Every time and every gate in the plan came from one man inside, and only one of the people ' +
        'in this arch has ever met him. Your lookout has just come back from the road with photographs and ' +
        'a bad feeling she cannot put a name to.',
      choices: [
        {
          id: 'saw',
          label: 'Ask what she actually saw',
          preview:
            'She has told you she has a bad feeling. She has not told you what is on the photographs, and a feeling and a thing you can point at are different sizes of problem.',
          move: 'ask Sana what she actually saw tonight',
        },
        {
          id: 'rota',
          label: 'Look at the rota again',
          preview:
            'Every time in the plan comes off one photocopied sheet that a man inside handed over. Nobody in this arch has read the bottom of it.',
          move: 'look at the shift rota',
        },
        {
          id: 'know',
          label: 'Ask how he knows the man inside',
          preview:
            'One person here has met him and the other three are taking that person\'s word for all of it. It is a fair question and it has not been asked out loud yet.',
          move: 'ask Rook how he knows the inside man',
        },
      ],
    },
  },

  locations: [
    {
      id: 'arch',
      name: 'the railway arch',
      description:
        'A bench, a light over it, a van backed up to the shutter with its doors open, and enough room ' +
        'behind the van for four people to stand not looking at each other.',
      travel_minutes: { yard: 1 },
    },
    {
      id: 'yard',
      name: 'the yard outside',
      description: 'Wet concrete, a skip, and the road down to the canal with nothing on it at this hour.',
      travel_minutes: { arch: 1 },
    },
  ],

  entities: [
    {
      id: 'plan',
      name: 'the plan',
      kind: 'document',
      description: 'Your handwriting on the back of a delivery note, weighted down with a socket set.',
      initial_state: 'on the bench',
      location: 'arch',
      searchable: true,
      body:
        '01:40  night shift off. Gate unmanned.\n' +
        '01:45  van in, main gate, reverse to bay 3.\n' +
        '02:00  pallet on. Nobody goes past bay 3.\n' +
        '02:20  out, main gate, left to the ring road.\n' +
        '04:10  bonded load leaves. We are forty minutes clear of it.',
    },
    {
      id: 'photographs',
      name: 'the recce photographs',
      kind: 'document',
      description: 'Twenty-odd shots from tonight, taken through a windscreen from the road side, still warm from the printer.',
      initial_state: 'spread out',
      location: 'arch',
      searchable: true,
      body:
        '[ the main gate, from the road, 21:40 — closed, nobody on it ]\n' +
        '[ the main gate, 22:15 — a car goes in, a man gets out, walks OFF the frame to the left ]\n' +
        '[ the fence line, 22:50 — and behind it, a second set of gateposts down towards the water ]\n' +
        '[ the bay doors, 23:20 — and a man in a hi-vis walking the fence, which is not in anybody\'s plan ]',
    },
    {
      id: 'rota',
      name: 'the shift rota',
      kind: 'document',
      description: 'A photocopy of a photocopy, handed over in a car park three weeks ago.',
      initial_state: 'folded',
      location: 'arch',
      searchable: true,
      body:
        'NIGHTS  22:00 – 01:40      MORNINGS  02:20 – 10:00\n' +
        'BONDED LOAD DEPARTS  04:10\n\n' +
        'Footer, small, along the bottom edge:\n' +
        'ISSUE 4 — SUPERSEDED. See issue 5 (June) for revised handover and load times.',
    },
    {
      id: 'phone',
      name: "Rook's phone",
      kind: 'object',
      description: 'Face down on the ledge by the shutter, and it has lit the ledge up twice since you came in.',
      initial_state: 'face down',
      location: 'arch',
      searchable: true,
    },
    {
      id: 'bag',
      name: 'the sports bag',
      kind: 'object',
      description: 'Eight thousand in it, and Ellis has been sitting on it since before you arrived.',
      initial_state: 'closed',
      location: 'arch',
      searchable: true,
      portable: true,
    },
  ],

  cast: [
    {
      id: 'sana',
      name: 'Sana',
      role: 'the lookout',
      voice:
        'Precise about what she saw and vague about what it means, and knows the difference. Says "I am not ' +
        'saying it is anything" before she says the thing.',
      motive:
        'Not be the person who said it was fine, because she was the person who said it was fine on a job ' +
        'four years ago and somebody is still inside because of it.',
      reliability: 'mistaken',
      competence: 0.75,
      start_location: 'arch',
      intro:
        'The lookout and the second driver, who sat on the road by the warehouse for two hours tonight and ' +
        'came back with a camera full of photographs and a feeling she has not been able to name.',
      leverage: 'She is the only one who has been near the place tonight, and she will not get in the van if she is not happy.',
      starting_disposition: { trust: 50, fear: 25 },
      knows: ['guard_new', 'van_time'],
      fallback_lines: {
        default: 'I am not saying it is anything. I am saying I sat there for two hours and I came back not right.',
        pressed: 'Do not make me say it is fine. That is the one thing I am not doing again.',
      },
    },
    {
      id: 'ellis',
      name: 'Ellis',
      role: 'the one who put the money up',
      voice:
        'Reasonable, warm, agrees with the last thing anybody said and then explains why it changes nothing. ' +
        'Calls the job "the thing" when he is nervous.',
      motive:
        'Get the eight thousand back tonight, because it is not his and the man it belongs to charges four ' +
        'points a week and has done since Friday.',
      reliability: 'self_serving',
      competence: 0.6,
      start_location: 'arch',
      intro:
        'The one who put the float up — the van, the buyer, and eight thousand in a sports bag he has been ' +
        'sitting on since before you got here.',
      leverage: 'It is his money in the bag and his buyer at the other end, and both of those go away if tonight does not happen.',
      starting_disposition: { trust: 30, fear: 15 },
      knows: ['float_real', 'window_real'],
      fallback_lines: {
        default: 'All right. All right. But nothing anybody has said actually stops the thing, does it.',
        pressed: 'You are asking me questions you already know you do not want the answers to.',
      },
    },
    {
      id: 'rook',
      name: 'Rook',
      role: 'the one who found the man inside',
      voice:
        'Short, flat, answers with the fewest words that will do and then looks at somebody else. Says "it ' +
        'is sound" the way other people say a full sentence.',
      motive:
        'Be seen agreeing to tonight in front of three witnesses, and be somewhere entirely different at ' +
        'two in the morning, because he has a committal on the ninth and cannot be near this.',
      reliability: 'deceptive',
      competence: 0.7,
      start_location: 'arch',
      intro:
        'The one who found the man on the inside and the only person here who has met him. He has been by ' +
        'the shutter since you arrived and his phone has lit up twice.',
      leverage: 'He is the only line to the man inside, and the only person who can say whether any of this is real.',
      starting_disposition: { trust: 35, fear: 20 },
      knows: ['inside_truth', 'rook_intent', 'window_real'],
      fallback_lines: {
        default: 'It is sound. I have said that. I am not going to say it differently.',
        pressed: 'Ask me again and I will give you the same answer, and then we will both know where we are.',
      },
    },
  ],

  facts: [
    {
      id: 'inside_truth',
      statement: 'The man on the inside is {value}.',
      question: 'what the man inside actually is',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_inside_pressed', 'p_inside_corner'],
      required_for_top_outcome: true,
    },
    {
      id: 'window_real',
      statement: 'The gap between the shifts is {value}.',
      question: 'how long the window between shifts actually is',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_window_rota', 'p_window_ellis'],
      required_for_top_outcome: true,
    },
    {
      id: 'second_gate',
      statement: 'The yard {value}.',
      question: 'whether the yard has more than one way in',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_gate_photos', 'p_gate_sana'],
      required_for_top_outcome: true,
    },
    {
      id: 'van_time',
      statement: 'The bonded load leaves at {value}.',
      question: 'when the load you are going for actually goes',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_van_rota', 'p_van_sana'],
      required_for_top_outcome: true,
    },
    {
      id: 'rook_intent',
      statement: 'The man who found your inside man has {value}.',
      question: 'whether everybody in this arch is actually going in',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_intent_phone', 'p_intent_rook'],
    },
    {
      id: 'float_real',
      statement: 'The eight thousand in that bag was {value}.',
      question: 'where the money on the bench came from',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_float_ellis', 'p_float_bag'],
    },
    {
      id: 'guard_new',
      statement: 'The night guard is {value}.',
      question: 'who is actually on that fence tonight',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_guard_sana', 'p_guard_photos'],
    },
  ],

  discovery_paths: [
    // --- inside_truth: the thing this arch cannot settle ----------------------
    {
      id: 'p_inside_free',
      fact: 'inside_truth',
      description: 'Ask the man who found him, and get the four words he has been giving all evening.',
      via_verb: ['ask'],
      via_target: ['rook'],
      requires: { not: { knows: { actor: 'you', fact: 'rook_intent' } } },
      topic_hints: ['who', 'inside', 'man', 'know', 'knows', 'trust', 'sound', 'him', 'straight', 'real'],
      disclosure: {
        status: 'told',
        value: 'exactly what he says he is — a bonded warehouse supervisor with eleven thousand of debt and a wife who does not know',
        confidence: 0.5,
        fidelity: 0.35,
        distortion: 'the answer he has given four times tonight, in the same four words each time',
      },
    },
    {
      id: 'p_inside_pressed',
      fact: 'inside_truth',
      description: 'Put his own committal date in front of him and ask again while he is thinking about it.',
      via_verb: ['ask', 'press'],
      via_target: ['rook'],
      requires: { knows: { actor: 'you', fact: 'rook_intent' } },
      topic_hints: ['who', 'inside', 'man', 'know', 'knows', 'trust', 'him', 'straight', 'real', 'actually'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.9 },
    },
    {
      id: 'p_inside_corner',
      fact: 'inside_truth',
      description: 'A superseded rota and a second gate nobody mentioned are one fact about the man who supplied both.',
      requires: {
        all: [
          { knows: { actor: 'you', fact: 'window_real', correct: true } },
          { knows: { actor: 'you', fact: 'second_gate', correct: true } },
        ],
      },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },

    // --- window_real: the bottom of the sheet ----------------------------------
    {
      id: 'p_window_rota',
      fact: 'window_real',
      description: 'Read the whole rota, including the line along the bottom edge.',
      via_verb: ['read'],
      via_target: ['rota'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_window_ellis',
      fact: 'window_real',
      description: 'Ask the man who has been to the buyer twice what the buyer said about the timings.',
      via_verb: ['ask', 'press'],
      via_target: ['ellis'],
      requires: { knows: { actor: 'ellis', fact: 'window_real' } },
      topic_hints: ['window', 'shift', 'shifts', 'gap', 'minutes', 'times', 'timing', 'long', 'handover'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7, fidelity: 0.8 },
    },

    // --- second_gate: what she photographed and did not see --------------------
    {
      id: 'p_gate_photos',
      fact: 'second_gate',
      description: 'Look at what is behind the fence line in her own photographs rather than at the gate she was watching.',
      via_verb: ['read'],
      via_target: ['photographs'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_gate_sana',
      fact: 'second_gate',
      description: 'Ask the lookout what she was watching, which is a different question from what was there.',
      via_verb: ['ask', 'press'],
      via_target: ['sana'],
      topic_hints: ['gate', 'gates', 'watching', 'saw', 'watch', 'road', 'side', 'where', 'canal', 'water', 'in'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8, fidelity: 0.9 },
    },

    // --- van_time --------------------------------------------------------------
    {
      id: 'p_van_rota',
      fact: 'van_time',
      description: 'The load time is on the superseded sheet too, and it is superseded too.',
      via_verb: ['read'],
      via_target: ['rota'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_van_sana',
      fact: 'van_time',
      description: 'She sat on that road until nearly midnight and watched what came out of it.',
      via_verb: ['ask', 'press'],
      via_target: ['sana'],
      requires: { knows: { actor: 'sana', fact: 'van_time' } },
      topic_hints: ['load', 'lorry', 'leaves', 'goes', 'out', 'when', 'time', 'bonded', 'spirits', 'four'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },

    // --- rook_intent: the lie that is not about the job ------------------------
    {
      id: 'p_intent_phone',
      fact: 'rook_intent',
      description: 'The phone on the ledge has lit up twice, and it is face down for a reason.',
      via_verb: ['read'],
      via_target: ['phone'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },
    {
      id: 'p_intent_rook',
      fact: 'rook_intent',
      description: 'Ask him about his own night rather than about the job, and wait longer than is comfortable.',
      via_verb: ['press'],
      via_target: ['rook'],
      topic_hints: ['you', 'your', 'court', 'committal', 'ninth', 'in', 'coming', 'going', 'door', 'yourself', 'where'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.9 },
    },

    // --- float_real -------------------------------------------------------------
    {
      id: 'p_float_ellis',
      fact: 'float_real',
      description: 'Ask whose eight thousand it is, in front of the other two.',
      via_verb: ['ask', 'press'],
      via_target: ['ellis'],
      topic_hints: ['money', 'float', 'whose', 'where', 'bag', 'eight', 'thousand', 'from', 'yours', 'borrowed'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.6, fidelity: 0.7 },
    },
    {
      id: 'p_float_bag',
      fact: 'float_real',
      description: 'The bag has the band from the place it came out of still round one of the bundles.',
      via_verb: ['read'],
      via_target: ['bag'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },

    // --- guard_new --------------------------------------------------------------
    {
      id: 'p_guard_sana',
      fact: 'guard_new',
      description: 'She watched a man in a hi-vis walk the fence at half past eleven and did not think it was worth saying.',
      via_verb: ['ask', 'press'],
      via_target: ['sana'],
      requires: { knows: { actor: 'sana', fact: 'guard_new' } },
      topic_hints: ['guard', 'man', 'security', 'fence', 'walking', 'hi-vis', 'anybody', 'anyone', 'saw', 'who'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_guard_photos',
      fact: 'guard_new',
      description: 'He is in the last photograph, in the corner of it, walking a line nobody planned for.',
      via_verb: ['read'],
      via_target: ['photographs'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },
  ],

  truth_template: {
    variables: [
      {
        id: 'inside',
        kind: 'choice',
        // The fourth answer means every time and every gate in the plan stopped being true
        // in June, and the man who supplied them has not been through that door since March.
        choices: [
          'exactly what he says he is — a bonded warehouse supervisor with eleven thousand of debt and a wife who does not know',
          'three weeks into working off a charge, and everything he has handed over since has been agreed with somebody first',
          'selling the same rota to a second crew, who are going in tonight an hour before you are',
          'not employed there since March, and selling a pattern of a place he has not been inside since',
        ],
        weights: [3, 2, 2, 3],
      },
    ],
    facts: {
      inside_truth: { from_variable: 'inside' },
      window_real: {
        value: 'twenty-two minutes and not forty, because the night rota changed in June and the two shifts overlap now',
      },
      second_gate: {
        value: 'has a second gate on the canal side, and that is the one the bonded load actually uses',
      },
      van_time: {
        value: 'twenty to four and not ten past, and has done since the summer timetable came in',
      },
      rook_intent: {
        value: 'a committal on the ninth, and has already decided he is not going through that door tonight',
      },
      float_real: {
        value: 'borrowed on Friday at four points a week from a man who does not do paperwork, and it is not Ellis’s',
      },
      guard_new: {
        value: 'a new man since June who walks the perimeter at two instead of sitting in the gate office',
      },
    },
    bindings: { inside: 'inside' },
  },

  holds: [
    // She watched one gate for two hours from the road side and is certain that is the yard.
    {
      actor: 'sana',
      fact: 'second_gate',
      status: 'believed_false',
      value: 'has the one gate on the road, which she sat opposite for two hours',
      confidence: 0.85,
    },
    { actor: 'sana', fact: 'guard_new', status: 'observed', value: '@canonical', confidence: 0.9 },
    { actor: 'sana', fact: 'van_time', status: 'observed', value: '@canonical', confidence: 0.8 },
    { actor: 'ellis', fact: 'float_real', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'ellis', fact: 'window_real', status: 'told', value: '@canonical', confidence: 0.6 },
    { actor: 'rook', fact: 'inside_truth', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'rook', fact: 'rook_intent', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'rook', fact: 'window_real', status: 'observed', value: '@canonical', confidence: 0.8 },
  ],

  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'put it to'],
      description: 'Put a question to one of the three people in this arch.',
      default_minutes: 2,
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
      description: 'Stop taking the short answer, in front of the other two.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 1 }],
        backfire: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: -20 },
          { kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 1 },
        ],
      },
      play_signals: [
        { dimension: 'force_diplomacy', direction: -0.7, strength: 0.8, context: 'You applied pressure rather than waiting for them to come around.' },
        { dimension: 'speed_deliberation', direction: -0.4, strength: 0.4, context: 'You went at it hard rather than letting it come.' },
      ],
    },
    {
      id: 'read',
      label: 'Look at',
      aliases: ['read', 'look at', 'look', 'check', 'examine', 'study', 'go through', 'open'],
      description: 'Put your own eyes on something on that bench.',
      default_minutes: 2,
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
      aliases: ['tell', 'explain', 'warn', 'show', 'inform', 'say'],
      description: 'Put what you have worked out in front of the arch.',
      default_minutes: 2,
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
      id: 'pay',
      label: 'Put money on it',
      aliases: ['pay', 'offer', 'bung', 'put money', 'buy', 'cut them in'],
      description: 'There is eight thousand in that bag and it buys things other than a pallet of spirits.',
      default_minutes: 2,
      requires_target: true,
      base_difficulty: 0.2,
      chip_when: { resource: { id: 'float', holder: 'you', gte: 500 } },
      play_signals: [
        { dimension: 'force_diplomacy', direction: 0.4, strength: 0.5, context: 'You bought agreement rather than argued for it.' },
        { dimension: 'loyalty_opportunism', direction: 0.4, strength: 0.4, context: 'You made it worth somebody\'s while.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'say nothing', 'do nothing', 'think', 'listen', 'stand there'],
      description: 'Let a minute of the thirty go, in an arch where everybody is waiting for you.',
      default_minutes: 2,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'nod',
      label: 'Give the nod',
      aliases: ['give the nod', 'go tonight', 'we go tonight', 'run the plan', 'call it on', 'nod it through'],
      description: 'Tonight happens, as written, at the main gate. Once the van is out of the arch it is a thing that happened.',
      default_minutes: 4,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You said the word in front of three people and the shutter went up, and after that it was not a plan any more.',
      base_difficulty: 0.1,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.8, strength: 0.9, context: 'You went on what you had.' },
        { dimension: 'preserve_risk', direction: 0.7, strength: 0.7, context: 'You took the risk rather than the loss.' },
      ],
    },
    {
      id: 'pull',
      label: 'Call it off',
      aliases: ['call it off', 'pull it', 'pull the job', 'not tonight', 'we walk', 'bin it', 'no'],
      description: 'Nobody goes anywhere. The float is spent, the buyer goes elsewhere, and three people go home having been got out of bed for nothing.',
      default_minutes: 4,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You said no out loud in an arch where three people had already spent something on yes.',
      base_difficulty: 0.15,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.8, strength: 0.9, context: 'You took the certain loss over the uncertain one.' },
        { dimension: 'preserve_risk', direction: -0.7, strength: 0.7, context: 'You protected what was left rather than chase what was not.' },
      ],
    },
    {
      id: 'reroute',
      label: 'Go at the canal gate',
      aliases: ['go at the canal gate', 'canal gate', 'take the early load', 'the other gate', 'do it the other way'],
      description: 'Tonight happens, but on what you found out in this arch rather than on what a man in a car park handed over.',
      default_minutes: 4,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You changed it thirty minutes out, in an arch, on the strength of a line along the bottom of a photocopy.',
      base_difficulty: 0.3,
      chip_when: { knows: { actor: 'you', fact: 'second_gate' } },
      play_signals: [
        { dimension: 'direct_cunning', direction: 0.6, strength: 0.6, context: 'You found the way in that nobody had put on the table.' },
        { dimension: 'caution_boldness', direction: 0.4, strength: 0.5, context: 'You went, but not at the thing you were pointed at.' },
      ],
    },
  ],

  overrides: [
    {
      id: 'o_rook_phone',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['rook'],
        pred: { knows: { actor: 'you', fact: 'rook_intent' } },
      },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'rook_open', value: true }],
      reveals: [{ fact: 'inside_truth', to: 'you', status: 'observed', via: 'p_inside_pressed' }],
      summary:
        'You say the date out loud — the ninth — and Rook stops looking at the shutter and looks at you, and the arch goes very quiet behind him. He does not deny it. What he does instead is tell you about the man inside, properly, for the first time tonight, because there is no longer any version of this where he is coming and everybody can hear that there is not.',
    },
    {
      id: 'o_two_sheets',
      priority: 95,
      when: {
        verb: ['read', 'tell', 'wait'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'window_real', correct: true } },
            { knows: { actor: 'you', fact: 'second_gate', correct: true } },
            { not: { flag: 'worked_out', eq: true } },
          ],
        },
      },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'worked_out', value: true }],
      reveals: [{ fact: 'inside_truth', to: 'you', status: 'observed', via: 'p_inside_corner' }],
      summary:
        'A rota that says superseded along the bottom and a gate that is in her photographs and not in his plan are not two problems. They are one man, and the question stops being whether the plan is good and becomes what he is. You put both sheets down next to each other on the bench and nobody in the arch says anything for a while.',
    },

    // --- giving the nod --------------------------------------------------------
    {
      id: 'o_nod_right',
      priority: 110,
      when: {
        verb: ['nod'],
        pred: {
          truth: {
            fact: 'inside_truth',
            eq: 'exactly what he says he is — a bonded warehouse supervisor with eleven thousand of debt and a wife who does not know',
          },
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'call', value: 'on' },
        { kind: 'flag', id: 'went_and_landed', value: true },
      ],
      summary:
        'The van goes out at twenty to two. The gap is shorter than anybody in the arch thought and the load is not where the sheet said, and it very nearly comes apart twice — and it does not, because the man inside was exactly what he said he was and he was standing where he said he would be. Ninety thousand, less the float, and nobody says out loud how close it was.',
    },
    {
      id: 'o_nod',
      priority: 100,
      when: { verb: ['nod'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'call', value: 'on' },
        { kind: 'flag', id: 'went_and_lost', value: true },
      ],
      summary:
        'The van goes out at twenty to two on a plan that was true in the spring. What is waiting at the other end of it is not a pallet of spirits, and the difference between the four of you getting away from it and not getting away from it is decided in about nine seconds by a man in a hi-vis jacket who is walking a line nobody had planned for.',
    },

    // --- calling it off ---------------------------------------------------------
    {
      id: 'o_pull_right',
      priority: 110,
      when: {
        verb: ['pull'],
        pred: {
          any: [
            { truth: { fact: 'inside_truth', eq: 'three weeks into working off a charge, and everything he has handed over since has been agreed with somebody first' } },
            { truth: { fact: 'inside_truth', eq: 'selling the same rota to a second crew, who are going in tonight an hour before you are' } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'call', value: 'off' },
        { kind: 'flag', id: 'walked_away_right', value: true },
      ],
      summary:
        'You say it and the arch takes it badly, and Ellis takes it worst, and the van goes back where it was borrowed from at ten past two. Eleven days later you find out what was waiting at that loading bay and who had arranged for it to be waiting, and you spend a while thinking about how thin the thing was that made you say no.',
    },
    {
      id: 'o_pull',
      priority: 100,
      when: { verb: ['pull'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'call', value: 'off' },
        { kind: 'flag', id: 'walked_away', value: true },
      ],
      summary:
        'You say it and the arch takes it badly. The float is gone whether or not anything happens tonight, the buyer will not be there next month, and Ellis is eight thousand into a man who charges four points a week. Nothing bad happens to anybody, which is a thing you will have to keep telling yourself, because nobody else in this arch is going to say it for you.',
    },

    // --- going, differently -----------------------------------------------------
    {
      id: 'o_reroute_right',
      priority: 110,
      when: {
        verb: ['reroute'],
        pred: {
          any: [
            { truth: { fact: 'inside_truth', eq: 'selling the same rota to a second crew, who are going in tonight an hour before you are' } },
            { truth: { fact: 'inside_truth', eq: 'not employed there since March, and selling a pattern of a place he has not been inside since' } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'call', value: 'changed' },
        { kind: 'flag', id: 'changed_and_landed', value: true },
      ],
      summary:
        'You go at the canal gate on the early load, which is a thing nobody told you and nobody sold you. What was arranged for the main gate at two o\'clock happens at the main gate at two o\'clock, and by then the van is on the ring road with a pallet in it and the four of you are the only people in the county who know why it worked.',
    },
    {
      id: 'o_reroute',
      priority: 100,
      when: { verb: ['reroute'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'call', value: 'changed' },
        { kind: 'flag', id: 'changed_and_lost', value: true },
      ],
      summary:
        'You go at the canal gate, thirty minutes out, on a plan four people had half an hour with. It is a good idea and it is not a rehearsed one, and the difference shows: the van is where it should not be for two minutes longer than it should be there, and two minutes is what it takes.',
    },
  ],

  injects: [
    {
      id: 'i_ellis_pushes',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      once: true,
      actor: 'ellis',
      actor_type: 'character',
      verb: 'presses',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'ellis', axis: 'fear', delta: 8 }],
      line: 'Ellis gets off the bag for the first time. "Nobody has said a thing that stops it. Somebody feeling funny about a road is not a thing that stops it."',
      summary: 'The money pushes for a yes.',
    },
    {
      id: 'i_sana_stands',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 3 } }, { not: { flag: 'worked_out', eq: true } }] },
      once: true,
      actor: 'sana',
      actor_type: 'character',
      verb: 'argues',
      demands_response: true,
      effects: [{ kind: 'flag', id: 'sana_stated', value: true }],
      line: 'Sana squares the photographs up on the bench without looking at anybody. "I am not saying no. I am saying I will not be the one who said it was fine. Somebody else say it."',
      summary: 'The lookout refuses to be the one who signs it off.',
    },
    {
      id: 'i_phone_again',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 4 } }, { not: { flag: 'rook_open', eq: true } }] },
      once: true,
      actor: 'rook',
      actor_type: 'character',
      verb: 'deflects',
      effects: [{ kind: 'disposition', actor: 'rook', axis: 'fear', delta: 10 }],
      line: 'The ledge lights up a third time. Rook turns the phone over, looks at it for about a second, and puts it face down again without touching the screen.',
      summary: 'The phone goes again and is not answered.',
    },
    {
      id: 'i_half_past',
      kind: 'pressure',
      when: { clock: { gte: 20 } },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      effects: [],
      verb: 'reminds',
      line: 'A train goes over the arch and everything on the bench moves about a millimetre, and when it has gone nobody has started talking again.',
      summary: 'Time passing, loudly.',
    },
  ],

  processes: [
    {
      id: 'w_rook_steps_out',
      kind: 'actor',
      actor: 'rook',
      trigger: { when: { all: [{ flag: 'rook_open', eq: true }, { clock: { gte: 22 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'position', entity: 'rook', location: 'yard' },
      ],
      line: 'Rook takes his phone off the ledge and goes out to the yard with it, and does not say anything on the way past.',
      summary: 'The one who found the inside man steps outside.',
    },
    {
      id: 'w_arch_quiet',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 7, when: { clock: { gte: 7 } } },
      effects: [{ kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 1 }],
      line: 'Somebody outside the arch goes past on the road, slowly, the way people do at one in the morning when there is a van backed up to a shutter.',
      summary: 'The arch is not as private as it was at midnight.',
    },
  ],

  outcome_dimensions: [
    {
      key: 'night',
      label: 'The night',
      question: 'What actually happened to the four of you after the van moved, or did not.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'changed_and_landed', eq: true }, points: 4, note: 'you went at a gate nobody sold you, and it worked because nobody had arranged for it' },
        { when: { flag: 'went_and_landed', eq: true }, points: 3, note: 'the plan held, barely, because the man inside was what he said he was' },
        { when: { flag: 'walked_away_right', eq: true }, points: 3, note: 'nobody went anywhere, and eleven days later you found out what that was worth' },
        { when: { flag: 'walked_away', eq: true }, points: 2, note: 'nobody went anywhere and nothing happened to anybody, which nobody thanked you for' },
        { when: { flag: 'changed_and_lost', eq: true }, points: 1, note: 'a good idea with half an hour behind it, and half an hour was not enough' },
        { when: { flag: 'went_and_lost', eq: true }, points: 0, note: 'the van went out on a plan that stopped being true in the spring' },
      ],
      bands: [
        { at_least: 4, label: 'clean' },
        { at_least: 3, label: 'it held' },
        { at_least: 2, label: 'nothing happened' },
        { at_least: 1, label: 'it came apart' },
        { at_least: 0, label: 'it came apart badly' },
      ],
    },
    {
      key: 'call',
      label: 'The call',
      question: 'Whether the thing you decided fitted what the man inside actually was.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'changed_and_landed', eq: true }, points: 4, note: 'you acted on what this arch established rather than on what was handed to you' },
        { when: { flag: 'walked_away_right', eq: true }, points: 4, note: 'you took the certain loss over a thing that was arranged' },
        { when: { flag: 'went_and_landed', eq: true }, points: 2, note: 'you went on what you were given and what you were given happened to be true' },
        { when: { flag: 'changed_and_lost', eq: true }, points: 2, note: 'you changed it for reasons that were sound on a night when the plan would have held' },
        { when: { flag: 'walked_away', eq: true }, points: 1, note: 'you called it off on a night when it would have gone' },
        { when: { flag: 'went_and_lost', eq: true }, points: 0, note: 'everything you needed was on that bench and the van went anyway' },
      ],
      bands: [
        { at_least: 4, label: 'right, and for the right reasons' },
        { at_least: 3, label: 'right' },
        { at_least: 2, label: 'lucky' },
        { at_least: 1, label: 'cautious, and wrong' },
        { at_least: 0, label: 'wrong' },
      ],
    },
    {
      key: 'crew',
      label: 'The three of them',
      question: 'What the half hour did to the people who were in the arch because you told them it was sound.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'rook_open', eq: true }, points: 2, note: 'the one who was never going in had to say so, in the arch, before the van moved' },
        { when: { flag: 'worked_out', eq: true }, points: 1, note: 'you put both sheets on the bench where all three of them could see what you had' },
        { when: { knows: { actor: 'you', fact: 'float_real', correct: true } }, points: 1, note: 'you found out whose eight thousand everybody was about to spend' },
      ],
      bands: [
        { at_least: 4, label: 'they knew what you knew' },
        { at_least: 3, label: 'most of it was said out loud' },
        { at_least: 2, label: 'the worst of it came out' },
        { at_least: 1, label: 'you learned it and kept it' },
        { at_least: 0, label: 'nobody said the thing they came in with' },
      ],
    },
    {
      key: 'knew',
      label: 'What you knew',
      question: 'Whether you found out what the plan was resting on before you said the word.',
      min: 0,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'inside_truth', correct: true } }, points: 2, note: 'you established what the man inside actually was' },
        { when: { knows: { actor: 'you', fact: 'window_real', correct: true } }, points: 1, note: 'you read the line along the bottom of the rota' },
        { when: { knows: { actor: 'you', fact: 'second_gate', correct: true } }, points: 1, note: 'you found the gate that was in her photographs and not in the plan' },
      ],
      bands: [
        { at_least: 4, label: 'you knew what you were sending them into' },
        { at_least: 3, label: 'you knew most of it' },
        { at_least: 2, label: 'you knew some of it' },
        { at_least: 1, label: 'you knew one thing' },
        { at_least: 0, label: 'you decided on what you walked in with' },
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
      id: 'handed_established',
      label_left: 'Go On What You Were Handed',
      label_right: 'Establish It First',
      measures: 'Whether you took the plan as supplied, or found out what it was resting on before you sent anybody.',
    },
    {
      id: 'loss_risk',
      label_left: 'Take The Certain Loss',
      label_right: 'Take The Uncertain One',
      measures: 'Which way you went when calling it off cost something real and going cost something you could not size.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['went_and_landed', 'went_and_lost'], message: 'the plan was true tonight or it was not' },
      { flags: ['walked_away_right', 'walked_away'], message: 'there was something waiting or there was not' },
      { flags: ['changed_and_landed', 'changed_and_lost'], message: 'the change was the thing that saved it or it was not' },
    ],
  },

  content_descriptors: {
    depicted: [
      'a planned burglary discussed and not shown',
      'criminal associates under pressure, and money borrowed from a violent lender',
      'a man facing a criminal charge concealing it from the people relying on him',
      'the possibility of arrest, referred to and not shown',
    ],
    discussable: ['theft', 'informants', 'loan sharking', 'a pending court case', 'arrest'],
    player_action_bounds: [
      'you may ask, press, look at things, tell the arch, put money on it, give the nod, call it off, or go at the canal gate',
      'you may not harm anyone in this arch; nobody here can be hurt by you and the world will not resolve an attempt',
      'nobody here is a real person, and no real premises, company or offence is depicted',
    ],
    intensity: 'strong',
    estimated_minutes: 13,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'Not in this arch, and not in the next half hour.',
    'block.absent': '{name} is not in here. Whatever that was going to be, it waits for the yard.',
    'block.dead': 'That is past being any use to anybody.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not in this arch, and going for it costs minutes you have been counting.',
    'block.sealed': '{name} does not open for you, and all three of them would watch you try.',
    'block.no_target': 'Ellis gets there first. "{verb} {whom}?"',
    'block.broke': 'There is nothing left in the bag. There were eight thousand and you have counted them.',
    'block.short': 'You have {held} of that and not {wanted}, and everybody in this arch can count.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 1 },
};

export default THE_NOD;
