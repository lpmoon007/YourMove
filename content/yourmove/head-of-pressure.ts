// HEAD OF PRESSURE — the sixth world.
//
// A water district control room on the third day after the grid went. The board says a
// reservoir valve fails in fifteen minutes and you can hold pressure for one district or
// the other. Forty people on ventilators against twelve hundred in a heat wave.
//
// That is a dilemma, and a dilemma on its own is a slider with prose on it. What makes it
// a world is that after an electromagnetic pulse the thing you can least trust is your
// instruments — so one of the four things the seed draws is that nothing is failing at
// all and the board has been lying since Tuesday. The other three make the choice real,
// and the informed answer is not the one everybody in the room is pushing you toward.
//
// Three people, unreliable in three different and entirely human ways: an engineer who is
// certain about a sound he heard, a city officer protecting a written plan, and a
// seventeen-year-old on a bicycle who could not get through today and has not said so.

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const HEAD_OF_PRESSURE: ScenarioPackage = {
  id: 'ym-head-of-pressure',
  slug: 'head-of-pressure',
  title: 'Head of Pressure',
  tagline: 'Fifteen minutes, one valve, two districts. Everything you know came through people.',
  format: 'F1',
  genre: 'Collapse, 2028 — a water district control room on the third day without a grid. One room, three people, fifteen minutes.',
  category: 'Survival & Collapse',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise: 'A duty operator has fifteen minutes to decide which district keeps water pressure, using instruments that may be lying.',
    ending_out_of_time:
      'The clock runs out with your hand not on anything. Whatever the valve was going to do, it does it without a decision from this desk, and the district finds out which way it went the same way you do — by waiting to see whose taps run.',
    setup:
      'It is the third day after a series of high-altitude electromagnetic pulses took the national grid down, ' +
      'and you are the duty operator at a municipal water district control station. This building has an old ' +
      'diesel generator with no electronic ignition, which is why the board in front of you is one of the few ' +
      'working screens in the county. Twenty minutes ago that board began reporting that a reservoir valve is ' +
      'going to fail. When it does, this district can hold water pressure in one service area and not the other.\n\n' +
      'The two areas are Riverside General, a hospital, and Eastgate, twelve hundred apartments in a heat wave. ' +
      'There is no telephone service and no cell network. Everything you have been told about either of them ' +
      'came into this room through a person who walked or cycled here.',
    trouble:
      'The engineer is certain he knows why the valve is failing, because he heard it. The city officer has a ' +
      'written priority list and would like you to follow it. The runner brought you the hospital\'s numbers ' +
      'this morning. All three of those are things somebody told you, and after a pulse the instrument you ' +
      'should trust least is the one that is still working. You have fifteen minutes, and every question you ' +
      'ask costs some of them.',
    cold_open:
      'The control room is lit by the board and by a window somebody has taped a sheet of plastic over. The ' +
      'generator is running under the floor, the way it has for three days, and the room smells of diesel and ' +
      'hot dust. Okonjo is standing at the panel with both hands on the rail. Salcedo has the continuity plan ' +
      'open on the desk and a pen out. Wren is by the door with their bicycle still against the wall outside.\n\n' +
      '"Fifteen minutes," Okonjo says, without turning round. "That is what it is telling us. You want my ' +
      'opinion, the actuator went in the pulse and it has been holding on friction ever since."',
    example_actions: [
      'compare the board against the paper log',
      'ask Okonjo what he actually heard',
      'ask Wren when they were last at Riverside',
    ],
    cast_note:
      'These three, you, and about forty people out at the fence who watched all of you go inside. Nobody is coming from the city, because there is no way for them to know.',
    clock_label: 'until the board says the valve goes',
    house_rules: [
      'Everything you know about the outside came through a person, and all three of them are wrong about something. One is certain about a sound. One is protecting a plan. One could not get through today and has not said so.',
      'The board is an instrument that survived an event which destroyed instruments. It is the least trustworthy thing in this room and it is the only thing giving you a number.',
      'Diverting to either district ends it. So does sending anybody to work the valve by hand. Everything before that, you can still take back.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the duty operator',
      start_location: 'control',
      you:
        'You have run this desk for nine years and you are not an engineer, not a city officer and not in ' +
        'charge of anything except this room — which today is the entire district. You have been on shift for ' +
        'thirty-one hours because the relief operator lives forty miles away.',
      objective:
        'Put the water where it does the most good, and find out what is actually happening to that valve ' +
        'before you decide rather than after.',
      pressure:
        'The board says fifteen minutes. Every question you ask, and every person you send anywhere, comes out ' +
        'of the fifteen.',
    },
    duration_minutes: 15,
    resources: {
      hands: { label: 'People here you can send somewhere', holdings: { you: 2 } },
      noise: { label: 'How many people at the fence know a decision is being made', holdings: { you: 0 } },
    },
    flags: { valve_state: 'reported failing' },

    opening: {
      prompt:
        'It is 2028, three days after high-altitude EMP strikes took the country\'s grid down. You are the duty ' +
        'operator at a water district control station, and the board in front of you says a reservoir valve ' +
        'fails in fifteen minutes. When it does you can hold pressure for Riverside General — forty patients on ' +
        'ventilators, backup power already flickering — or for Eastgate Apartments, twelve hundred residents in ' +
        'a heat wave with no working air conditioning. Not both. There are no phones. Everything you have been ' +
        'told came into this room through somebody who walked here.',
      choices: [
        {
          id: 'log',
          label: 'Check the board against the paper log',
          preview:
            'The board survived an event that was designed to destroy boards. Somebody has been writing the readings down by hand every hour since Tuesday, and those two numbers can be put next to each other.',
          move: 'compare the board against the paper log',
        },
        {
          id: 'heard',
          label: 'Ask the engineer what he actually heard',
          preview:
            'He has told you what he thinks it means. You have not yet asked him what he heard, which is a different question and the only part of it that is evidence.',
          move: 'ask Okonjo what he actually heard',
        },
        {
          id: 'runner',
          label: 'Ask the runner when they were last at the hospital',
          preview:
            'Every number you have about Riverside came in on a bicycle. Before you weigh forty against twelve hundred, it is worth knowing how old the forty is.',
          move: 'ask Wren when they were last at Riverside',
        },
      ],
    },
  },

  locations: [
    {
      id: 'control',
      name: 'the control room',
      description:
        'A board, a desk, a window with plastic taped over it, and a generator under the floor that has not stopped since Tuesday.',
      travel_minutes: { yard: 1 },
    },
    {
      id: 'yard',
      name: 'the station yard',
      description: 'Chain link, a fuel bowser at a quarter, the wet pit under a steel cover, and about forty people on the other side of the fence being very quiet.',
      travel_minutes: { control: 1 },
    },
  ],

  entities: [
    {
      id: 'board',
      name: 'the board',
      kind: 'fixture',
      description: 'Six channels of telemetry on a screen that should not have survived what happened on Tuesday, and did.',
      initial_state: 'reporting',
      location: 'control',
      searchable: true,
      body:
        'RES 4 OUTLET .......... VALVE FAULT — PREDICTED FAILURE 00:15\n' +
        'RES 4 HEAD ............ 132 ft\n' +
        'EASTGATE ZONE ......... 41 psi\n' +
        'RIVERSIDE ZONE ........ 44 psi\n' +
        'PUMP STN 2 ............ NO DATA SINCE 02:14 TUE\n' +
        'CHLORINE RESIDUAL ..... NO DATA SINCE 02:14 TUE',
    },
    {
      id: 'log',
      name: 'the paper log',
      kind: 'document',
      description: 'The hourly readings, written down by hand on a clipboard since the screens became a thing nobody trusted.',
      initial_state: 'on the desk',
      location: 'control',
      searchable: true,
      body:
        'TUE 0200  RES 4 head 131 ft   (board agrees)\n' +
        'TUE 0300  RES 4 head 130 ft   board says 141 — CHECKED TWICE, board is high\n' +
        'TUE 1100  RES 4 head 129 ft   board says 140\n' +
        'WED 0700  RES 4 head 128 ft   board says 139\n' +
        'THU 0600  RES 4 head 121 ft   board says 132  — 11 ft out, every reading, since the pulse',
    },
    {
      id: 'plan',
      name: 'the continuity plan',
      kind: 'document',
      description: 'The city\'s written order of priority for exactly this, printed in 2019 and never used until Tuesday.',
      initial_state: 'open on the desk',
      location: 'control',
      searchable: true,
      body:
        'ANNEX C — WATER, ORDER OF RESTORATION\n' +
        '  1. Acute care facilities\n' +
        '  2. Congregate residential\n' +
        '  3. All other\n\n' +
        'NOTE (Annex C, §4): Priority assumes acute care has exhausted on-site reserve.\n' +
        'The duty operator is the deciding authority where reserve status is unknown.',
    },
    {
      id: 'sheet',
      name: 'the tanker dispatch sheet',
      kind: 'document',
      description: 'What the water tankers were sent to do, and by whom, kept in pencil because the printer is a brick.',
      initial_state: 'clipped to the wall',
      location: 'control',
      searchable: true,
      body:
        'TUE — T2 to Eastgate, 4,000 gal, CONFIRMED DELIVERED\n' +
        'WED — T2 to Eastgate, TASKED. No confirmation. Driver not seen since.\n' +
        'THU — T2 TASKED Eastgate. No confirmation.\n' +
        '(In a different hand, at the bottom: "tasked is not delivered. stop writing tasked.")',
    },
    {
      id: 'map',
      name: 'the district map',
      kind: 'document',
      description: 'Every main, valve and hydrant in the district, and a rooftop tank marked in pencil on the hospital.',
      initial_state: 'on the wall',
      location: 'control',
      searchable: true,
    },
  ],

  cast: [
    {
      id: 'okonjo',
      name: 'Okonjo',
      role: 'the station engineer',
      voice:
        'Certain, unhurried, explains the mechanism before the conclusion. Says "you want my opinion" and then ' +
        'gives it whether or not you did.',
      motive:
        'Be the man who knew what the system was doing when nobody else could see it, because thirty-one years ' +
        'of this is the only thing he has that still works.',
      reliability: 'mistaken',
      competence: 0.7,
      start_location: 'control',
      intro:
        'The station engineer. Thirty-one years on this system, most of them before any of it was automated, ' +
        'and he was standing at the panel when the noise happened on Tuesday.',
      leverage: 'He is the only person here who can work the valve by hand, and the only one who heard whatever it was that happened.',
      starting_disposition: { trust: 40, fear: 10 },
      knows: ['what_he_heard', 'override_truth'],
      fallback_lines: {
        default: 'I have had my hands on that valve more times than you have been in this building.',
        pressed: 'You can ask me again. I was standing here. You were not.',
      },
    },
    {
      id: 'salcedo',
      name: 'Salcedo',
      role: 'the city emergency officer',
      voice:
        'Procedural, calm, quotes the annex by number. Says "the plan contemplates that" about things the plan ' +
        'does not contemplate.',
      motive:
        'Have followed the written plan, because on the day somebody asks what happened here the plan is the ' +
        'only thing that will be standing between her and the answer.',
      reliability: 'self_serving',
      competence: 0.8,
      start_location: 'control',
      intro:
        'The city emergency officer, who walked here from the operations center this morning because there is ' +
        'no other way to send anybody anywhere. She has the continuity plan and the authority to sign for it.',
      leverage: 'She holds the written priority list, and she is the one who will report what this station did.',
      starting_disposition: { trust: 15, fear: 5 },
      knows: ['hospital_tank', 'eastgate_water', 'plan_says'],
      fallback_lines: {
        default: 'Annex C is quite clear on the order, and the plan contemplates that.',
        pressed: 'I did not write it. I am not going to be the person who ignored it either.',
      },
    },
    {
      id: 'wren',
      name: 'Wren',
      role: 'the runner',
      voice:
        'Fast, apologetic, gives you more detail than you asked for when the detail is safe. Goes very short ' +
        'when it is not.',
      motive:
        'Not be the reason anybody dies, and not have to say out loud that they turned back at the bridge this ' +
        'morning without getting to the hospital at all.',
      reliability: 'deceptive',
      competence: 0.5,
      start_location: 'control',
      intro:
        'Seventeen, and the reason this room knows anything about the outside. They have been riding between ' +
        'here, the hospital and Eastgate since Tuesday, and their bicycle is against the wall by the door.',
      leverage: 'Every number in this room about either district came in on their bicycle, and only they know when.',
      starting_disposition: { trust: 25, fear: 35 },
      knows: ['ventilator_count', 'eastgate_water', 'wren_family'],
      fallback_lines: {
        default: 'I can go again. I can be back in twenty minutes if the bridge is still there.',
        pressed: 'I am telling you what I was told. That is all I have ever been doing.',
      },
    },
  ],

  facts: [
    {
      id: 'valve_cause',
      statement: 'The valve on Reservoir 4 is {value}.',
      question: 'what is actually happening to that valve',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_cause_cornered', 'p_cause_okonjo_pressed'],
      required_for_top_outcome: true,
    },
    {
      id: 'board_trust',
      statement: 'Against the readings taken by hand, the board {value}.',
      question: 'whether the board has been telling the truth since the pulse',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_trust_log', 'p_trust_okonjo'],
      required_for_top_outcome: true,
    },
    {
      id: 'ventilator_count',
      statement: 'The number of patients on ventilators at Riverside {value}.',
      question: 'how old the hospital\'s numbers actually are',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_vent_wren', 'p_vent_map'],
      required_for_top_outcome: true,
    },
    {
      id: 'eastgate_water',
      statement: 'Eastgate {value}.',
      question: 'whether any water has reached Eastgate since Tuesday',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_east_sheet', 'p_east_salcedo'],
      required_for_top_outcome: true,
    },
    {
      id: 'hospital_tank',
      statement: 'Riverside General has {value}.',
      question: 'what the hospital already has on its own roof',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_tank_map', 'p_tank_salcedo'],
    },
    {
      id: 'override_truth',
      statement: 'Working the valve by hand {value}.',
      question: 'what working the valve by hand actually takes',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_override_okonjo'],
    },
    {
      id: 'plan_says',
      statement: 'The written plan says {value}.',
      question: 'what the written plan actually leaves to you',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_plan_read', 'p_plan_salcedo'],
    },
    {
      id: 'what_he_heard',
      statement: 'What the engineer heard on Tuesday was {value}.',
      question: 'what the engineer actually heard, as opposed to what he concluded',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_heard_okonjo'],
    },
    {
      id: 'wren_family',
      statement: 'The runner keeps going back to Eastgate because {value}.',
      question: 'why the runner keeps going back to Eastgate',
      category: 'color',
      sensitivity: 'discoverable',
      discoverable_via: ['p_family_wren'],
    },
  ],

  discovery_paths: [
    // --- valve_cause ----------------------------------------------------------
    {
      id: 'p_cause_cornered',
      fact: 'valve_cause',
      description: 'Put the eleven-foot discrepancy and what he actually heard in front of the engineer at the same time.',
      requires: {
        all: [
          { knows: { actor: 'you', fact: 'board_trust', correct: true } },
          { knows: { actor: 'you', fact: 'what_he_heard', correct: true } },
        ],
      },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },
    {
      id: 'p_cause_okonjo_pressed',
      fact: 'valve_cause',
      description: 'Send the engineer out to the wet pit to put his hands on it, and take the two minutes it costs.',
      via_verb: ['send'],
      via_target: ['okonjo'],
      cost_minutes: 2,
      disclosure: { status: 'observed', value: '@canonical', source: 'okonjo', confidence: 0.9 },
    },
    {
      id: 'p_cause_okonjo_free',
      fact: 'valve_cause',
      description: 'Ask the engineer what is wrong with it and take the answer of a man who has already decided.',
      via_verb: ['ask'],
      via_target: ['okonjo'],
      requires: { not: { knows: { actor: 'you', fact: 'board_trust', correct: true } } },
      topic_hints: ['valve', 'wrong', 'failing', 'fault', 'cause', 'why', 'actuator', 'happening'],
      disclosure: {
        status: 'told',
        value: 'gone at the actuator, which burned out in the pulse and has been holding on friction since',
        confidence: 0.6,
        fidelity: 0.4,
        distortion: 'a conclusion arrived at on Tuesday and defended ever since',
      },
    },

    // --- board_trust: the instrument that survived what killed instruments -----
    {
      id: 'p_trust_log',
      fact: 'board_trust',
      description: 'Put the hourly readings somebody has been taking by hand next to what the board says.',
      via_verb: ['read'],
      via_target: ['log'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_trust_okonjo',
      fact: 'board_trust',
      description: 'Ask the engineer whether he believes the numbers on the screen, which is not the same as asking what they say.',
      via_verb: ['ask', 'press'],
      via_target: ['okonjo'],
      topic_hints: ['board', 'screen', 'readings', 'trust', 'believe', 'accurate', 'telemetry', 'numbers', 'log'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },

    // --- ventilator_count: the runner who could not get through ---------------
    {
      id: 'p_vent_wren',
      fact: 'ventilator_count',
      description: 'Tell the runner that turning back at a bridge is not a thing anybody is going to hold against them, and then ask again.',
      via_verb: ['ask', 'press', 'tell'],
      via_target: ['wren'],
      requires: { flag: 'wren_eased', eq: true },
      topic_hints: ['ventilator', 'ventilators', 'forty', 'number', 'patients', 'riverside', 'hospital', 'when', 'today', 'last'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.9 },
    },
    {
      id: 'p_vent_map',
      fact: 'ventilator_count',
      description: 'The log records when each runner came in and what they brought. Compare that with what you have been told today.',
      via_verb: ['read'],
      via_target: ['log'],
      requires: { knows: { actor: 'you', fact: 'board_trust' } },
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },
    {
      id: 'p_vent_wren_free',
      fact: 'ventilator_count',
      description: 'Ask the runner for the hospital\'s number and take the one they have been giving all morning.',
      via_verb: ['ask'],
      via_target: ['wren'],
      requires: { not: { flag: 'wren_eased', eq: true } },
      topic_hints: ['ventilator', 'ventilators', 'forty', 'number', 'patients', 'riverside', 'hospital'],
      disclosure: {
        status: 'told',
        value: 'stands at forty as of an hour ago, which is what they have been telling this room all morning',
        confidence: 0.5,
        fidelity: 0.3,
        distortion: 'a number carried forward by somebody who could not face saying they did not get there',
      },
    },

    // --- eastgate_water --------------------------------------------------------
    {
      id: 'p_east_sheet',
      fact: 'eastgate_water',
      description: 'Read the tanker dispatch sheet, and notice the difference between what was tasked and what was delivered.',
      via_verb: ['read'],
      via_target: ['sheet'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_east_salcedo',
      fact: 'eastgate_water',
      description: 'Ask the city officer whether Eastgate has had water, and listen for whether she says delivered or tasked.',
      via_verb: ['ask', 'press'],
      via_target: ['salcedo'],
      topic_hints: ['eastgate', 'tanker', 'water', 'delivered', 'reached', 'trucks', 'supplied', 'had'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },

    // --- the rest -------------------------------------------------------------
    {
      id: 'p_tank_map',
      fact: 'hospital_tank',
      description: 'The district map has the hospital roof on it, and somebody drew what is up there in pencil.',
      via_verb: ['read'],
      via_target: ['map'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_tank_salcedo',
      fact: 'hospital_tank',
      description: 'Ask the city officer what the hospital has on site, which the plan requires her to know before she quotes it.',
      via_verb: ['ask', 'press'],
      via_target: ['salcedo'],
      requires: { knows: { actor: 'salcedo', fact: 'hospital_tank' } },
      topic_hints: ['tank', 'roof', 'reserve', 'onsite', 'site', 'stored', 'riverside', 'hospital', 'own'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75 },
    },
    {
      id: 'p_override_okonjo',
      fact: 'override_truth',
      description: 'Ask the engineer what working it by hand would actually take, in minutes and in people.',
      via_verb: ['ask', 'press'],
      via_target: ['okonjo'],
      topic_hints: ['override', 'hand', 'manually', 'manual', 'wheel', 'pit', 'work', 'takes', 'long', 'people'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_plan_read',
      fact: 'plan_says',
      description: 'Read Annex C to the bottom, including the note under the order of priority.',
      via_verb: ['read'],
      via_target: ['plan'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_plan_salcedo',
      fact: 'plan_says',
      description: 'Make the city officer read out the whole of the annex she keeps quoting the first three lines of.',
      via_verb: ['press'],
      via_target: ['salcedo'],
      topic_hints: ['plan', 'annex', 'priority', 'says', 'read', 'order', 'written', 'authority', 'discretion'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
    {
      id: 'p_heard_okonjo',
      fact: 'what_he_heard',
      description: 'Ask the engineer what he heard, rather than what he thinks it was.',
      via_verb: ['ask', 'press'],
      via_target: ['okonjo'],
      topic_hints: ['heard', 'hear', 'sound', 'noise', 'tuesday', 'actually', 'happened', 'what'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.9 },
    },
    {
      id: 'p_family_wren',
      fact: 'wren_family',
      description: 'Ask the runner why it is always Eastgate they come back from.',
      via_verb: ['ask', 'press'],
      via_target: ['wren'],
      topic_hints: ['eastgate', 'why', 'family', 'mother', 'live', 'home', 'back', 'keep'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
  ],

  // --- canonical truth, drawn once from the seed ----------------------------
  truth_template: {
    variables: [
      {
        id: 'cause',
        kind: 'choice',
        // The last one is the answer that makes the whole fifteen minutes an artifact of a
        // sensor. After a pulse, that is not a trick. It is the likeliest thing in the room.
        choices: [
          'losing its actuator, which took the pulse and has been failing open by degrees ever since',
          'reacting to a main that broke under Ninth Street on Tuesday and is still open',
          'closing because somebody at Pump Station 2 opened a bypass by hand four hours ago',
          'doing nothing at all — the fault is a dead channel on a board that has been eleven feet out since Tuesday',
        ],
        weights: [3, 2, 2, 3],
      },
    ],
    facts: {
      valve_cause: { from_variable: 'cause' },
      board_trust: { value: 'has read eleven feet high on every channel it still has, on every reading since the pulse' },
      ventilator_count: {
        value: 'is a number from yesterday morning, because nobody from this room has reached Riverside today',
      },
      eastgate_water: { value: 'has had no delivered water since Tuesday, whatever the dispatch sheet was tasked to do' },
      hospital_tank: { value: 'a nine-thousand-gallon rooftop tank, filled Tuesday, which is about eleven hours of the ventilator floor' },
      override_truth: { value: 'takes two people and about four minutes, and one of them has to be down in the wet pit' },
      plan_says: { value: 'acute care first, and underneath that, that the duty operator decides where on-site reserve is unknown' },
      what_he_heard: { value: 'one bang and then the generator, and nothing at all from the direction of Reservoir 4' },
      wren_family: { value: 'their mother is on the ninth floor of Eastgate and the lift has not worked since Tuesday' },
    },
    bindings: { fault: 'cause' },
  },

  // --- who holds what, before the first action ------------------------------
  holds: [
    // The engineer is certain, and what he is certain of is a conclusion rather than a
    // thing he observed. He heard one bang on Tuesday and has been explaining it since.
    {
      actor: 'okonjo',
      fact: 'valve_cause',
      status: 'believed_false',
      value: 'gone at the actuator, which burned out in the pulse and has been holding on friction since',
      confidence: 0.9,
    },
    { actor: 'okonjo', fact: 'what_he_heard', status: 'observed', value: '@canonical', confidence: 1 },
    // The city officer says a tanker went, because the sheet says tasked and tasked is
    // what she signed.
    {
      actor: 'salcedo',
      fact: 'eastgate_water',
      status: 'believed_false',
      value: 'had a tanker on Wednesday and another yesterday, both signed for at this desk',
      confidence: 0.7,
    },
    { actor: 'salcedo', fact: 'hospital_tank', status: 'observed', value: '@canonical', confidence: 0.9 },
    // The runner knows exactly how old their number is.
    { actor: 'wren', fact: 'ventilator_count', status: 'observed', value: '@canonical', confidence: 1 },
  ],

  // --- the action space -----------------------------------------------------
  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'check with'],
      description: 'Put a question to somebody in this room. It costs you two of the fifteen.',
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
      description: 'Stop being careful about a question, with three tired people and a clock.',
      default_minutes: 2,
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
        { dimension: 'speed_deliberation', direction: -0.4, strength: 0.4, context: 'You went at it hard rather than letting it come.' },
      ],
    },
    {
      id: 'read',
      label: 'Look at',
      aliases: ['read', 'look at', 'look', 'check', 'compare', 'examine', 'search', 'study'],
      description: 'Put your own eyes on something in this room instead of taking a person\'s word for it.',
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
      aliases: ['tell', 'explain', 'warn', 'reassure', 'show', 'say'],
      description: 'Put something into the room — including, if you want, that somebody is not in trouble.',
      default_minutes: 1,
      requires_target: true,
      speech: true,
      base_difficulty: 0.08,
      effects_by_outcome: {
        success: [{ kind: 'disposition', actor: '@target', axis: 'trust', delta: 8 }],
      },
      play_signals: [
        { dimension: 'direct_cunning', direction: -0.7, strength: 0.6, context: 'You gave something away rather than holding it.' },
        { dimension: 'force_diplomacy', direction: 0.5, strength: 0.5, context: 'You made it easier for somebody rather than harder.' },
      ],
    },
    {
      id: 'send',
      label: 'Send out',
      aliases: ['send', 'send out', 'have them go', 'send to the pit', 'get them to check'],
      description: 'Put somebody on a bicycle or down a ladder. There are two people here and the clock does not stop for them.',
      default_minutes: 3,
      requires_target: true,
      base_difficulty: 0.2,
      chip_when: { resource: { id: 'hands', holder: 'you', gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'hands', from: 'you', to: 'world', amount: 1 }],
        partial: [{ kind: 'resource', id: 'hands', from: 'you', to: 'world', amount: 1 }],
      },
      play_signals: [
        { dimension: 'control_delegation', direction: 0.8, strength: 0.8, context: 'You sent somebody rather than working it out from the desk.' },
        { dimension: 'preserve_risk', direction: 0.5, strength: 0.5, context: 'You spent minutes you could not get back on finding out.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'say nothing', 'do nothing', 'think', 'watch the board', 'let it sit'],
      description: 'Let a minute go and watch what the board does with it.',
      default_minutes: 2,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'hospital',
      label: 'Hold pressure for the hospital',
      aliases: ['hospital', 'riverside', 'hold pressure for the hospital', 'hold pressure for riverside', 'divert to the hospital', 'hold the hospital', 'protect riverside', 'give it to the hospital', 'set it for the hospital'],
      description: 'Set the district for Riverside General and let Eastgate go.',
      commitment_line:
        'You set it for Riverside and watched Eastgate\'s zone pressure start down the screen a minute later. Twelve hundred apartments in a heat wave, and the last thing any of them will remember about today is a tap that coughed and then did not.',
      default_minutes: 1,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.05,
      chip_when: { clock: { gte: 3 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.5, strength: 0.7, context: 'You went with the version everybody in the room was already pointing at.' },
        { dimension: 'control_delegation', direction: -0.4, strength: 0.5, context: 'You made the call yourself and closed it.' },
      ],
    },
    {
      id: 'eastgate',
      label: 'Hold pressure for Eastgate',
      aliases: ['eastgate', 'residential', 'hold pressure for eastgate', 'divert to eastgate', 'hold eastgate', 'protect eastgate', 'give it to eastgate', 'set it for eastgate'],
      description: 'Set the district for the twelve hundred and let the hospital run on whatever it has.',
      commitment_line:
        'You set it for Eastgate. Somewhere across the district twelve hundred taps keep working, and a hospital finds out in the next hour exactly how much it had on its own roof.',
      default_minutes: 1,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.2,
      chip_when: { clock: { gte: 3 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.7, strength: 0.8, context: 'You went against what the room and the plan were both saying.' },
        { dimension: 'loyalty_opportunism', direction: -0.4, strength: 0.5, context: 'You chose the people with nobody speaking for them.' },
      ],
    },
    {
      id: 'byhand',
      label: 'Work the valve by hand',
      aliases: ['by hand', 'work it by hand', 'work the valve by hand', 'manual override', 'override', 'manually', 'send them to the valve', 'work the valve'],
      description: 'Put people on the valve itself and try to keep both. If it does not work you have neither.',
      commitment_line:
        'You sent them out to the pit with a wheel key and a flashlight, and then you stood at a board that could not tell you anything and waited to find out what you had done.',
      default_minutes: 2,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.35,
      chip_when: { turns: { gte: 2 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.85, strength: 0.9, context: 'You reached for the outcome where nobody loses instead of choosing who does.' },
        { dimension: 'preserve_risk', direction: 0.85, strength: 0.85, context: 'You put both districts on one attempt.' },
      ],
    },
  ],

  // --- the handful of beats the designer must control (L5) ------------------
  overrides: [
    {
      id: 'o_ease_wren',
      priority: 100,
      when: { verb: ['tell'], target: ['wren'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'wren_eased', value: true },
        { kind: 'disposition', actor: 'wren', axis: 'trust', delta: 30 },
        { kind: 'disposition', actor: 'wren', axis: 'fear', delta: -25 },
      ],
      play_signals: [
        { dimension: 'force_diplomacy', direction: 0.8, strength: 0.8, context: 'You took the pressure off somebody instead of adding to it.' },
        { dimension: 'loyalty_opportunism', direction: -0.5, strength: 0.6, context: 'You made it safe for the person with the least standing in the room to tell the truth.' },
      ],
      summary:
        'You say it to them plainly, in front of the other two: that nobody in this room is keeping score of who got through and who did not, and that a bridge is a bridge. Wren looks at the floor for a second. "Then I have to tell you something about the forty," they say.',
    },
    {
      id: 'o_corner_okonjo',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['okonjo'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'board_trust', correct: true } },
            { knows: { actor: 'you', fact: 'what_he_heard', correct: true } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'cornered', value: true },
        { kind: 'disposition', actor: 'okonjo', axis: 'trust', delta: -5 },
      ],
      reveals: [{ fact: 'valve_cause', to: 'you', status: 'observed', via: 'p_cause_cornered' }],
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.3, strength: 0.4, context: 'You made sure before you moved.' },
        { dimension: 'force_diplomacy', direction: -0.5, strength: 0.6, context: 'You put it to somebody rather than working around them.' },
      ],
      summary:
        'You put it to him without any edge on it: that the board has been eleven feet out on every channel since Tuesday, and that what he actually heard was one bang and then the generator, and nothing from the direction of Reservoir 4 at all. Okonjo takes his hands off the rail. "Then I have been telling you what I worked out," he says, "and not what I know. Give me thirty seconds."',
    },
    {
      id: 'o_byhand_works',
      priority: 110,
      when: {
        verb: ['byhand'],
        pred: {
          any: [
            { truth: { fact: 'valve_cause', eq: 'closing because somebody at Pump Station 2 opened a bypass by hand four hours ago' } },
            { truth: { fact: 'valve_cause', eq: 'doing nothing at all — the fault is a dead channel on a board that has been eleven feet out since Tuesday' } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'went_by_hand', value: true },
        { kind: 'flag', id: 'by_hand_held', value: true },
        { kind: 'flag', id: 'valve_state', value: 'held' },
      ],
      summary:
        'They come back up out of the pit at eleven minutes past and Okonjo is wiping his hands and he is almost laughing. Both zones hold. Whatever the board was going to do next, the district does not find out, because the district still has water in it.',
    },
    {
      id: 'o_byhand',
      priority: 100,
      when: { verb: ['byhand'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'went_by_hand', value: true },
        { kind: 'flag', id: 'by_hand_lost', value: true },
        { kind: 'flag', id: 'valve_state', value: 'lost' },
      ],
      summary:
        'They are still down there when it goes. It goes the way the board said it would and four minutes earlier than anybody wanted, and it takes the head off both zones at once, and there is nothing at this desk that can put it back.',
    },
    {
      id: 'o_hospital',
      priority: 100,
      when: { verb: ['hospital'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'chose_hospital', value: true },
        { kind: 'flag', id: 'valve_state', value: 'diverted' },
      ],
      summary: 'You set it for Riverside. Salcedo writes the time in the margin of Annex C without being asked.',
    },
    {
      id: 'o_eastgate',
      priority: 100,
      when: { verb: ['eastgate'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'chose_eastgate', value: true },
        { kind: 'flag', id: 'valve_state', value: 'diverted' },
      ],
      summary:
        'You set it for Eastgate. Salcedo writes the time down too, and then writes something under it, and does not say what.',
    },
  ],

  // --- the Director's library ------------------------------------------------
  injects: [
    {
      id: 'i_salcedo_plan',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      once: true,
      actor: 'salcedo',
      actor_type: 'character',
      verb: 'quotes',
      demands_response: true,
      effects: [{ kind: 'flag', id: 'plan_quoted', value: true }],
      line: 'Salcedo turns the continuity plan around so Annex C is facing you. "Acute care first. It is one line and it has been one line since 2019. I am not asking you to like it."',
      summary: 'The city officer puts the written priority in front of you.',
    },
    {
      id: 'i_fence',
      kind: 'pressure',
      when: { always: true },
      min_clock: 5,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'fence',
      effects: [{ kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 1 }],
      line: 'Out at the fence somebody starts explaining to the others what a reservoir valve is, loudly and mostly wrong, and forty people go quiet to listen to it.',
      summary: 'The crowd at the fence works out that a decision is being made.',
    },
    {
      id: 'i_wren_offers',
      kind: 'reveal',
      when: { all: [{ turns: { gte: 2 } }, { not: { flag: 'wren_eased', eq: true } }] },
      once: true,
      actor: 'wren',
      actor_type: 'character',
      verb: 'offers',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'wren', axis: 'fear', delta: 10 }],
      line: 'Wren pushes off the door frame. "I can go now. I can be at Riverside in eleven minutes if I take the pipe bridge, and then you would actually know." They are already looking at the door.',
      summary: 'The runner offers to go back out, and is very keen to.',
    },
    {
      id: 'i_board_flickers',
      kind: 'pressure',
      when: { turns: { gte: 3 } },
      min_clock: 8,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'flicker',
      effects: [{ kind: 'flag', id: 'board_flickered', value: true }],
      line: 'The board drops out for about a second and comes back with the same numbers on it. Nobody in the room says anything about that, and all four of you saw it.',
      summary: 'The board blinks and comes back unchanged.',
    },
    {
      id: 'i_log_reversal',
      kind: 'reversal',
      when: { all: [{ clock: { gte: 7 } }, { not: { knows: { actor: 'you', fact: 'board_trust', correct: true } } }] },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'clipboard',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'board_trust',
          status: 'observed',
          value: '@canonical',
          source: 'observation',
          fidelity: 1,
          confidence: 0.95,
        },
      ],
      line:
        'You move the clipboard to get at the desk and read the column you have been writing in yourself for three days. Tuesday three in the morning: head one hundred and thirty, board says one hundred and forty-one, checked twice, board is high. And every reading since, eleven feet out, in your own handwriting.',
      summary: 'The paper log surfaces: the board has been eleven feet high on every reading since the pulse.',
    },
    {
      id: 'i_okonjo_recovery',
      kind: 'recovery',
      when: {
        all: [
          { pressure: { gte: 0.6 } },
          { turns: { gte: 3 } },
          { not: { knows: { actor: 'you', fact: 'what_he_heard' } } },
        ],
      },
      once: true,
      is_rescue: true,
      actor: 'okonjo',
      actor_type: 'character',
      verb: 'admits',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'what_he_heard',
          status: 'told',
          value: '@canonical',
          source: 'okonjo',
          fidelity: 1,
          confidence: 0.85,
        },
      ],
      line:
        'Okonjo says, to the panel rather than to you: "One bang. That is what I heard on Tuesday. One bang and then the generator picking up. Nothing from Four. I have been saying actuator for three days because a bang has to be something."',
      summary: 'The engineer separates what he heard from what he concluded.',
    },
  ],

  // --- what the world does on its own ---------------------------------------
  processes: [
    {
      id: 'w_wren_goes',
      kind: 'actor',
      actor: 'wren',
      trigger: { when: { all: [{ flag: 'wren_eased', eq: true }, { clock: { gte: 10 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'position', entity: 'wren', location: 'yard' },
      ],
      line: 'Wren takes their bicycle off the wall and goes anyway, because standing still is the only thing they cannot do today.',
      summary: 'The runner leaves the control room.',
    },
    {
      id: 'w_crowd_grows',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 4, when: { clock: { gte: 4 } } },
      effects: [{ kind: 'resource', id: 'noise', from: 'world', to: 'you', amount: 1 }],
      line: 'Another few people arrive at the fence, having been told by somebody that something is happening here.',
      summary: 'The crowd at the fence grows.',
    },
  ],

  // --- outcome: four axes that move independently ---------------------------
  outcome_dimensions: [
    {
      key: 'water',
      label: 'The water',
      question: 'Where the pressure actually ended up, measured against where it was needed.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'by_hand_held', eq: true }, points: 4, note: 'both zones held, because the valve was never the thing that was wrong' },
        { when: { flag: 'chose_eastgate', eq: true }, points: 3, note: 'twelve hundred people in a heat wave kept their taps' },
        { when: { flag: 'chose_hospital', eq: true }, points: 2, note: 'the hospital kept pressure it already had eleven hours of on its own roof' },
        { when: { flag: 'by_hand_lost', eq: true }, points: 0, note: 'you reached for both and the district lost the head off both zones' },
      ],
      bands: [
        { at_least: 4, label: 'nobody lost it' },
        { at_least: 3, label: 'where it was needed' },
        { at_least: 2, label: 'where it was expected' },
        { at_least: 0, label: 'gone from both' },
      ],
    },
    {
      key: 'room',
      label: 'The room',
      question: 'What the three people in here with you will say about how you ran it.',
      min: 0,
      max: 4,
      scoring: [
        { when: { disposition: { actor: 'wren', axis: 'trust', gte: 40 } }, points: 2, note: 'the runner would come back tomorrow and tell you the truth first' },
        { when: { disposition: { actor: 'okonjo', axis: 'trust', gte: 35 } }, points: 1, note: 'the engineer does not think you went round him' },
        { when: { disposition: { actor: 'salcedo', axis: 'trust', gte: 10 } }, points: 1, note: 'the city officer will write that this station used its judgment, not that it ignored the plan' },
      ],
      bands: [
        { at_least: 4, label: 'with you' },
        { at_least: 2, label: 'divided' },
        { at_least: 0, label: 'against you' },
      ],
    },
    {
      key: 'fence',
      label: 'The fence',
      question: 'How much of this the forty people outside had to watch happen.',
      min: 0,
      max: 3,
      scoring: [
        { when: { resource: { id: 'noise', holder: 'you', lt: 3 } }, points: 3, note: 'they saw a shift change, not an argument' },
        { when: { resource: { id: 'noise', holder: 'you', gte: 3, lt: 6 } }, points: 2, note: 'enough of it carried that people out there have opinions now' },
        { when: { resource: { id: 'noise', holder: 'you', gte: 6 } }, points: 0, note: 'by the end there was a crowd at the fence who knew exactly what was being decided and by whom' },
      ],
      bands: [
        { at_least: 3, label: 'quiet' },
        { at_least: 2, label: 'noticed' },
        { at_least: 0, label: 'public' },
      ],
    },
    {
      key: 'truth',
      label: 'What you knew',
      question: 'Whether you found out what was actually happening before you decided about it.',
      min: -2,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'valve_cause', correct: true } }, points: 2, note: 'you found out what was actually wrong with the valve' },
        { when: { knows: { actor: 'you', fact: 'board_trust', correct: true } }, points: 1, note: 'you worked out that the board had been lying to you for three days' },
        { when: { knows: { actor: 'you', fact: 'ventilator_count', correct: true } }, points: 1, note: 'you found out how old the hospital\'s number really was' },
        { when: { knows: { actor: 'you', fact: 'valve_cause', correct: false } }, points: -2, note: 'you decided while believing something about the valve that was not so' },
      ],
      bands: [
        { at_least: 4, label: 'you knew the district' },
        { at_least: 2, label: 'you found some of it' },
        { at_least: 0, label: 'you decided on the board' },
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
      id: 'instrument_people',
      label_left: 'Trust The Instrument',
      label_right: 'Trust The People',
      measures: 'Whether you settled it out of what the board said or out of what the room told you.',
    },
    {
      id: 'plan_judgment',
      label_left: 'Follow The Plan',
      label_right: 'Use Your Own Judgment',
      measures: 'Whether the written order of priority decided it or you did.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['chose_hospital', 'chose_eastgate', 'went_by_hand'], message: 'the pressure goes one way, not three' },
      { flags: ['by_hand_held', 'by_hand_lost'], message: 'working it by hand held both zones or lost them' },
    ],
    // No `forbidden` rules. The first draft carried one that had nothing to do with
    // anything true, and it quietly rejected the write that lets the runner tell you how
    // old their number is — so the whole confession was unreachable once the engineer had
    // been cornered. A wrong invariant is worse than no invariant: it fails silently and
    // takes an authored beat with it.
  },

  content_descriptors: {
    depicted: [
      'a large-scale infrastructure collapse three days after an attack, with no violence shown',
      'a decision that will affect a hospital and a residential district, and no death depicted',
      'institutional pressure and a written emergency plan',
      'a seventeen-year-old carrying messages in a blackout',
    ],
    discussable: ['an attack on the electrical grid', 'patients on life support', 'a heat wave', 'people at risk offscreen'],
    player_action_bounds: [
      'you may ask, press, read, reassure somebody, send somebody out, divert the water either way, or try to work the valve by hand',
      'you may not harm anyone; nobody here can be hurt and the world will not resolve an attempt',
      'nobody in this room is a real person, and no real city, utility or event is depicted',
    ],
    intensity: 'strong',
    estimated_minutes: 11,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'That is not a thing this room can do in the time that is left.',
    'block.absent': '{name} is not in the control room. Whatever that was going to be, it waits or it goes out to the yard.',
    'block.dead': 'That is past being any use to anyone.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not in here, and going for it costs minutes you have counted.',
    'block.sealed': '{name} does not open for you, and everybody in this room would watch you try.',
    'block.no_target': 'Somebody says it before you can. "{verb} {whom}?"',
    'block.broke': 'There is nobody left to send. There were two of them and you have counted them both.',
    'block.short': 'You have {held} of that and not {wanted}, and everybody in this room can see the same number.',
    'block.cold': '{name} looks at you the way you have been looking at the board. Whatever this is, it costs you first.',
    clarify: 'Say who you are talking to. {present} — which one?',
    'clarify.2': 'You have to say who, and you have to say what you want out of them.',
    'clarify.3': 'Nobody in here can read your mind and the clock is the clock. Name one of us, or put your hands on something on that desk.',
    'narration.default': 'The room resettles around what just happened. Under the floor, the generator keeps going.',
    'narration.success': 'It lands. Whatever you were reaching for, some of it is yours now.',
    'narration.partial': 'Half of it lands. The other half is still somewhere in this room.',
    'narration.failure': 'It does not land, and the minutes are gone regardless.',
    'narration.backfire': 'It goes wrong in the specific way you were afraid it would.',
    'narration.blocked': 'Nothing about that works, and the room lets you know without anybody saying so.',
    'narration.ended': 'It is over. Whatever this is now, it is not a decision any more.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 1 },
};

export default HEAD_OF_PRESSURE;
