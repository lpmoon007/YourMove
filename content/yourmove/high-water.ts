// HIGH WATER — the second world on the Survival & Collapse shelf.
//
// Head of Pressure is about what is happening out there and whether the instruments are
// telling you. This one is about what you can actually DO, which is a different kind of
// not-knowing: every number in this office was given to you by somebody who wishes it
// were true. The bus does not hold what everybody says it holds. The tank was filled on
// Thursday and has been used since. There are four of you until midnight.
//
// The shape the engine needs, and where it is:
//   - one hidden thing drawn from the seed: what the river does tonight, which is the only
//     thing in the building nobody can establish and the only thing that decides who was right
//   - a character who is sincerely wrong and sure of it (the driver, about the fuel)
//   - a character who is lying about something small and human (the carer, about staying)
//   - a character who is neither, and is steering you toward the answer his company prefers
//   - every fact that matters reachable two ways: through a person, and through a piece of paper

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const HIGH_WATER: ScenarioPackage = {
  id: 'ym-high-water',
  slug: 'high-water',
  title: 'High Water',
  tagline: 'Forty-one residents, one minibus, and thirty-five minutes to decide whether moving them is the thing that kills them.',
  format: 'F1',
  genre: 'Survival — a flooded care home at night. One office, three colleagues, and a river that has already come over the wall.',
  category: 'Survival & Collapse',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise:
      'The night manager of a residential care home decides, in the half hour before the yard goes under, ' +
      'whether to move forty-one residents, keep them, or split them.',
    ending_out_of_time:
      'The water comes over the step while the four of you are still talking about it, and after that nobody ' +
      'is driving anywhere. Forty-one people spend the night upstairs because that is what happened, not ' +
      'because anybody decided it.',
    setup:
      'You are the night manager of a residential care home on the low side of a river town. At nine o\'clock ' +
      'the river came over the wall by the bridge. At half past nine the county told everyone below the ' +
      'bridge to move, on the radio, and gave a school hall two miles away as the place to go. Since then the ' +
      'phone lines have been engaged and nothing from the county has come down this road. You have forty-one ' +
      'residents asleep or half-asleep upstairs and down, four staff including yourself, and one minibus in ' +
      'the yard. The water in the car park is over the kerb.',
    trouble:
      'Moving forty-one old people at eleven at night is dangerous on a dry evening. Some of them cannot be ' +
      'moved at all without the thing that keeps them breathing. But the ground floor is where most of them ' +
      'sleep, and if this is the night the wall upstream goes, staying is the thing that kills them. Nobody ' +
      'in this office knows which of those it is, and every number you have been given tonight is a number ' +
      'somebody wants to be true.',
    cold_open:
      'The office smells of wet carpet already and the strip light over the desk is doing the thing it does ' +
      'when the supply dips. Through the window the car park lights are still on under about four inches of ' +
      'water, which is the worst-looking thing you have ever seen. Devlin has the minibus keys in his hand ' +
      'and has not put them down since he came in. Ada is in the doorway with the drugs trolley key round ' +
      'her wrist. Ryner drove down from head office and is standing where the phone is.\n\n' +
      'Devlin says it to the room rather than to you. "I can do it in two trips. Twenty and twenty-one, and ' +
      'I am back inside forty minutes."',
    example_actions: [
      'ask Devlin how much fuel is in the bus',
      'read the night book',
      'ask Ada how many residents are in the building tonight',
    ],
    cast_note:
      'Three people who work here, you, and forty-one residents. The county said to move and then stopped answering.',
    clock_label: 'before the water is over the step',
    house_rules: [
      'Every number you have tonight came from somebody who wants it to be true. One of them is sincerely wrong about the one that decides everything. One is not telling you something small that changes the arithmetic. One knows what is waiting at the other end and has not said.',
      'Loading the bus ends the night. So does taking everybody upstairs, and so does sending some and keeping the rest. Everything before that, you can still take back.',
      'What the river does tonight is the one thing in this building nobody can establish. You can find out everything else.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the night manager',
      start_location: 'office',
      you:
        'You have run the nights here for six years, which means that between eight in the evening and eight ' +
        'in the morning the building is yours. You know every resident by name and most of them by the sound ' +
        'they make when they are frightened.',
      objective:
        'Get forty-one people through tonight — and be right about what you and three other people can ' +
        'actually do before you commit them to it, rather than after the bus has gone.',
      pressure:
        'The driver has the keys in his hand and wants to be moving. Every minute you spend establishing ' +
        'something is a minute of water in the car park.',
    },
    duration_minutes: 35,
    resources: {
      hands: { label: 'Staff on the floor, including you', holdings: { you: 4 } },
      alarm: { label: 'How frightened the building is getting', holdings: { you: 0 } },
    },
    flags: { decision: 'open' },

    opening: {
      prompt:
        'You are the night manager of a care home on the low side of a river town. The river came over the ' +
        'wall two hours ago and the county has told everyone below the bridge to move to a school hall two ' +
        'miles away. The phones have been engaged since. You have forty-one residents, four staff, one ' +
        'minibus, and four inches of water in the car park. Your driver says he can do it in two trips.',
      choices: [
        {
          id: 'fuel',
          label: 'Ask what is actually in the tank',
          preview:
            'Two trips is the whole plan and it rests on one number. He has not looked at the gauge since he said it, and the pumps in town went off at nine.',
          move: 'ask Devlin how much fuel is in the bus',
        },
        {
          id: 'book',
          label: 'Read the night book',
          preview:
            'Forty-one people are not forty-one of the same thing. The book says who is on what, and some of what they are on runs off the wall.',
          move: 'read the night book',
        },
        {
          id: 'count',
          label: 'Ask how many are actually in the building',
          preview:
            'Every number in this office tonight is being worked out from a total on a whiteboard. The person who did this week\'s admissions is standing in the doorway.',
          move: 'ask Ada how many residents are in the building tonight',
        },
      ],
    },
  },

  locations: [
    {
      id: 'office',
      name: 'the night office',
      description:
        'A desk, a whiteboard, a window onto the car park, and the hook by the door where the vehicle book ' +
        'and the minibus keys live when the minibus keys are not in somebody\'s hand.',
      travel_minutes: { dayroom: 1 },
    },
    {
      id: 'dayroom',
      name: 'the day room',
      description: 'Chairs against three walls, a television nobody turned off, and the smell of the carpet going.',
      travel_minutes: { office: 1 },
    },
  ],

  entities: [
    {
      id: 'board',
      name: 'the whiteboard',
      kind: 'document',
      description: 'Every resident, every room, and a letter against each name for how they move.',
      initial_state: 'up',
      location: 'office',
      searchable: true,
      body:
        'GROUND 1–14   W  walks        S  stick/frame        C  chair\n' +
        'FIRST 15–39   ( two admissions this week are not on this board )\n\n' +
        'W 11   S 16   C 12   BED 2\n\n' +
        'Written under it in a different pen: 41 as of Tues — L.',
    },
    {
      id: 'nightbook',
      name: 'the night book',
      kind: 'document',
      description: 'What each of them is on overnight, and what it plugs into.',
      initial_state: 'open on the desk',
      location: 'office',
      searchable: true,
      body:
        'OXYGEN — CONCENTRATOR (MAINS)   rm 4, rm 9, rm 22, rm 31\n' +
        '  cylinders on site: 2 portable, approx 4 hrs each\n' +
        'SYRINGE DRIVER  rm 17\n' +
        'INSULIN (fridge) 6\n\n' +
        'NOTE: concentrators draw from the wall. They do not run off a socket that is not on.',
    },
    {
      id: 'plate',
      name: 'the plating certificate',
      kind: 'document',
      description: 'The minibus plate, framed on the wall behind the desk where the inspector likes to see it.',
      initial_state: 'framed',
      location: 'office',
      searchable: true,
      body:
        'PASSENGER CAPACITY   16 seated (incl. driver)\n' +
        'WHEELCHAIR POSITIONS  2 — each position occupies two seated positions\n' +
        'Effective: 12 seated + 2 chairs, or 16 seated.',
    },
    {
      id: 'vehiclebook',
      name: 'the vehicle book',
      kind: 'document',
      description: 'On the hook by the door. Every journey, signed, since the last fill.',
      initial_state: 'hanging',
      location: 'office',
      searchable: true,
      body:
        'THU  filled 60L\n' +
        'THU  hospital run, Grange       34 mi\n' +
        'FRI  day trip, coast            71 mi\n' +
        'SAT  hospital run, Grange       34 mi\n' +
        'MON  chiropody, town            9 mi\n' +
        '     ( no fill since Thursday )',
    },
    {
      id: 'radio',
      name: 'the wind-up radio',
      kind: 'fixture',
      description: 'On the windowsill, on very low, carrying the local station and whatever the county gives it.',
      initial_state: 'on',
      location: 'office',
      searchable: true,
    },
    {
      id: 'window',
      name: 'the office window',
      kind: 'fixture',
      description: 'The car park, the lights still on under the water, and the kerb you can no longer see.',
      initial_state: 'dark',
      location: 'office',
      searchable: true,
    },
  ],

  cast: [
    {
      id: 'devlin',
      name: 'Devlin',
      role: 'the driver',
      voice:
        'Certain, cheerful, rounds every number in the direction that makes the job possible. Says "easy" ' +
        'before he says the number.',
      motive:
        'Be the man who got everybody out, because he has been the maintenance man here for eleven years and ' +
        'this is the first night any of it has mattered.',
      reliability: 'mistaken',
      competence: 0.5,
      start_location: 'office',
      intro:
        'The maintenance man, who drives the minibus, who came in on his own at ten when he heard the radio ' +
        'and has had the keys in his hand ever since.',
      leverage: 'He is the only person here who can legally drive that bus, and the only one who has been out on that road tonight.',
      starting_disposition: { trust: 45, fear: 10 },
      knows: ['fuel_real', 'crossing', 'bus_seats'],
      fallback_lines: {
        default: 'Easy. Two trips. You are making this harder than it is.',
        pressed: 'All right. All right. I am telling you what I would tell you if it was my mother in there.',
      },
    },
    {
      id: 'ada',
      name: 'Ada',
      role: 'the senior carer on tonight',
      voice:
        'Quiet, practical, answers the part of the question she can answer and leaves the rest sitting there. ' +
        'Uses residents\' first names in a room where everybody else says room numbers.',
      motive:
        'Get every one of them through the night, and get home to two children who are on their own at her ' +
        'sister\'s because her sister went out at eight and has not come back.',
      reliability: 'deceptive',
      competence: 0.8,
      start_location: 'office',
      intro:
        'The senior carer on tonight, eleven years here, who knows which of them will settle and which of ' +
        'them will not.',
      leverage: 'She is the only person here who knows what moving each of these people actually involves, and she holds the drugs trolley key.',
      starting_disposition: { trust: 55, fear: 20 },
      knows: ['oxygen_four', 'staff_real', 'board_stale'],
      fallback_lines: {
        default: 'Tell me what you have decided and I will make it work. That is not me being difficult.',
        pressed: 'Do not push me on this one. Ask me something else and I will answer it straight.',
      },
    },
    {
      id: 'ryner',
      name: 'Ryner',
      role: 'the manager from head office',
      voice:
        'Measured, corporate, restates your sentence back to you slightly changed and then agrees with his own ' +
        'version. Says "the position is" when he means what the company wants.',
      motive:
        'Have the company be able to say it followed the county\'s instruction, which means the bus moves, and ' +
        'which does not require the school hall to be any good.',
      reliability: 'self_serving',
      competence: 0.75,
      start_location: 'office',
      intro:
        'The area manager, who drove down when the radio went out and is standing between the desk and the ' +
        'phone with his coat still on.',
      leverage: 'He speaks for the company, he has the only line to the county that has got through tonight, and he can overrule you in the morning.',
      starting_disposition: { trust: 10, fear: 5 },
      knows: ['hall_real', 'bus_seats', 'board_stale'],
      fallback_lines: {
        default: 'The position is that the county has issued an instruction and we are below the bridge.',
        pressed: 'I am not going to be drawn on that in front of your staff. I will say it to you outside.',
      },
    },
  ],

  facts: [
    {
      id: 'water_truth',
      statement: 'What the river does tonight is that it {value}.',
      question: 'what the water actually did after eleven',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_water_gauge', 'p_water_devlin_pressed'],
      required_for_top_outcome: true,
    },
    {
      id: 'fuel_real',
      statement: 'What is in the tank is {value}.',
      question: 'whether the bus could do two trips',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_fuel_book', 'p_fuel_devlin'],
      required_for_top_outcome: true,
    },
    {
      id: 'bus_seats',
      statement: 'The minibus takes {value}.',
      question: 'how many people the bus actually carries',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_seats_plate', 'p_seats_ryner'],
      required_for_top_outcome: true,
    },
    {
      id: 'oxygen_four',
      statement: 'Four of them are on {value}.',
      question: 'which residents cannot leave this building',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_oxy_book', 'p_oxy_ada'],
      required_for_top_outcome: true,
    },
    {
      id: 'staff_real',
      statement: 'The number of you on the floor after midnight is {value}.',
      question: 'how many pairs of hands you actually have tonight',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_staff_ada', 'p_staff_board'],
    },
    {
      id: 'crossing',
      statement: 'The road to the school hall {value}.',
      question: 'what the route to the school hall crosses',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_cross_devlin', 'p_cross_radio'],
    },
    {
      id: 'hall_real',
      statement: 'What is waiting at the school hall is {value}.',
      question: 'what the place you would be taking them to actually has',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_hall_ryner', 'p_hall_radio'],
    },
    {
      id: 'board_stale',
      statement: 'The whiteboard says forty-one, and the real number is {value}.',
      question: 'how many people are actually in this building',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_count_board', 'p_count_ada'],
    },
  ],

  discovery_paths: [
    // --- water_truth: the one thing nobody in the building can be sure of --------
    {
      id: 'p_water_free',
      fact: 'water_truth',
      description: 'Ask the man who drove in through it what the water is doing.',
      via_verb: ['ask'],
      via_target: ['devlin'],
      requires: { not: { knows: { actor: 'you', fact: 'crossing' } } },
      topic_hints: ['water', 'river', 'rising', 'level', 'doing', 'outside', 'coming', 'high', 'far'],
      disclosure: {
        status: 'told',
        value: 'comes up an inch every ten minutes until the tide turns at one and then stops where it is',
        confidence: 0.5,
        fidelity: 0.3,
        distortion: 'a man reading a car park in the dark and wanting a particular answer',
      },
    },
    {
      id: 'p_water_gauge',
      fact: 'water_truth',
      description: 'The local station carries the upstream gauge every twenty minutes, and upstream is an hour ahead of here.',
      via_verb: ['read'],
      via_target: ['radio'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },
    {
      id: 'p_water_devlin_pressed',
      fact: 'water_truth',
      description: 'Put the crossing to him and make him say what the water was doing at the low point rather than here.',
      via_verb: ['press'],
      via_target: ['devlin'],
      requires: { knows: { actor: 'you', fact: 'crossing' } },
      topic_hints: ['water', 'river', 'crossing', 'mill', 'beck', 'low', 'rising', 'deep', 'saw'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.8 },
    },

    // --- fuel_real: the number the whole plan rests on ---------------------------
    {
      id: 'p_fuel_book',
      fact: 'fuel_real',
      description: 'The vehicle book is signed after every journey and there has been no fill since Thursday.',
      via_verb: ['read'],
      via_target: ['vehiclebook'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_fuel_devlin',
      fact: 'fuel_real',
      description: 'Ask the driver what is in the tank, and get the number he has been carrying since Thursday.',
      via_verb: ['ask', 'press'],
      via_target: ['devlin'],
      topic_hints: ['fuel', 'tank', 'diesel', 'gauge', 'full', 'petrol', 'range', 'miles', 'trips', 'much'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8, fidelity: 0.9 },
    },

    // --- bus_seats ---------------------------------------------------------------
    {
      id: 'p_seats_plate',
      fact: 'bus_seats',
      description: 'The plating certificate on the wall says what the vehicle is licensed to carry.',
      via_verb: ['read'],
      via_target: ['plate'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_seats_ryner',
      fact: 'bus_seats',
      description: 'The company knows exactly what that vehicle is plated for, because the company insures it.',
      via_verb: ['ask', 'press'],
      via_target: ['ryner'],
      requires: { knows: { actor: 'ryner', fact: 'bus_seats' } },
      topic_hints: ['bus', 'seats', 'many', 'capacity', 'carry', 'fit', 'chairs', 'wheelchair', 'licensed', 'plated'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },

    // --- oxygen_four -------------------------------------------------------------
    {
      id: 'p_oxy_book',
      fact: 'oxygen_four',
      description: 'The night book says who is on a concentrator and what a concentrator plugs into.',
      via_verb: ['read'],
      via_target: ['nightbook'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_oxy_ada',
      fact: 'oxygen_four',
      description: 'Ask the carer which of them cannot go, which is the question she has been waiting for.',
      via_verb: ['ask', 'press'],
      via_target: ['ada'],
      topic_hints: ['oxygen', 'cannot', 'travel', 'move', 'moved', 'which', 'who', 'concentrator', 'bed', 'frail'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.9 },
    },

    // --- staff_real: the small human lie -----------------------------------------
    {
      id: 'p_staff_ada',
      fact: 'staff_real',
      description: 'Ask her about her own night rather than about the residents, and wait through the pause.',
      via_verb: ['press'],
      via_target: ['ada'],
      topic_hints: ['you', 'your', 'midnight', 'home', 'children', 'stay', 'staying', 'leave', 'leaving', 'shift', 'many', 'us'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.9 },
    },
    {
      id: 'p_staff_board',
      fact: 'staff_real',
      description: 'The rota is on the back of the whiteboard and somebody has already written a line through a name.',
      via_verb: ['read'],
      via_target: ['board'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },

    // --- crossing -----------------------------------------------------------------
    {
      id: 'p_cross_devlin',
      fact: 'crossing',
      description: 'Ask the driver what is between here and the school hall, in order.',
      via_verb: ['ask', 'press'],
      via_target: ['devlin'],
      topic_hints: ['road', 'route', 'way', 'road', 'crossing', 'mill', 'beck', 'bridge', 'between', 'school'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85, fidelity: 0.9 },
    },
    {
      id: 'p_cross_radio',
      fact: 'crossing',
      description: 'The station has been reading out closed roads for an hour and one of them is on your route.',
      via_verb: ['read'],
      via_target: ['radio'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.8 },
    },

    // --- hall_real -----------------------------------------------------------------
    {
      id: 'p_hall_ryner',
      fact: 'hall_real',
      description: 'Make the man who spoke to the county say what he was actually told was in that hall.',
      via_verb: ['ask', 'press'],
      via_target: ['ryner'],
      topic_hints: ['hall', 'school', 'there', 'waiting', 'beds', 'oxygen', 'nurses', 'what', 'ready', 'county'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7, fidelity: 0.7 },
    },
    {
      id: 'p_hall_radio',
      fact: 'hall_real',
      description: 'The station has been describing the rest centre all evening, in the words of somebody standing in it.',
      via_verb: ['read'],
      via_target: ['radio'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.8 },
    },

    // --- board_stale ----------------------------------------------------------------
    {
      id: 'p_count_board',
      fact: 'board_stale',
      description: 'The whiteboard was totalled on Tuesday and there have been admissions since Tuesday.',
      via_verb: ['read'],
      via_target: ['board'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_count_ada',
      fact: 'board_stale',
      description: 'Ask the person who did both admissions how many people are in the building.',
      via_verb: ['ask', 'press'],
      via_target: ['ada'],
      topic_hints: ['many', 'number', 'count', 'residents', 'people', 'total', 'admissions', 'forty'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.9 },
    },
  ],

  truth_template: {
    variables: [
      {
        id: 'river',
        kind: 'choice',
        // Two of these make staying right and two make it the worst night of your life,
        // and nothing in the building tells you which except a gauge an hour upstream.
        choices: [
          'crests at the top of the car park a little after two and goes no further',
          'takes the ground floor by one and never reaches the first',
          'takes the ground floor before midnight and is at the first-floor windows by four',
          'comes all at once at half past eleven, because the wall upstream goes',
        ],
        weights: [3, 3, 2, 2],
      },
    ],
    facts: {
      water_truth: { from_variable: 'river' },
      fuel_real: {
        value: 'about a quarter of a tank — one run to the hall and back and nothing after it, because the pumps in town went off at nine',
      },
      bus_seats: {
        value: 'sixteen seated, or twelve seated and two chairs, and eleven of them cannot sit unaided',
      },
      oxygen_four: {
        value: 'concentrators that run off the wall, and there are two portable cylinders in this building for the four of them',
      },
      staff_real: {
        value: 'three, because the senior carer has two children on their own and is going at midnight whatever anybody says',
      },
      crossing: {
        value: 'crosses the beck at the old mill, which is the lowest point between here and anywhere',
      },
      hall_real: {
        value: 'a hall with a hundred and fifty camp beds, no oxygen, no drugs fridge and two St John volunteers',
      },
      board_stale: {
        value: 'forty-three, because two people were admitted on Wednesday and Thursday and the board was totalled on Tuesday',
      },
    },
    bindings: { river: 'river' },
  },

  holds: [
    // The driver is sincerely wrong about the only number the plan rests on. He filled it
    // on Thursday and has not thought about the coast trip on Friday since Friday.
    {
      actor: 'devlin',
      fact: 'fuel_real',
      status: 'believed_false',
      value: 'the best part of a full tank, because he put sixty litres in it himself on Thursday',
      confidence: 0.9,
    },
    { actor: 'devlin', fact: 'crossing', status: 'observed', value: '@canonical', confidence: 0.9 },
    { actor: 'devlin', fact: 'bus_seats', status: 'observed', value: '@canonical', confidence: 0.7 },
    { actor: 'ada', fact: 'oxygen_four', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'ada', fact: 'staff_real', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'ada', fact: 'board_stale', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'ryner', fact: 'hall_real', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'ryner', fact: 'bus_seats', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'ryner', fact: 'board_stale', status: 'told', value: '@canonical', confidence: 0.6 },
  ],

  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'put it to'],
      description: 'Put a question to one of the three people in this office.',
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
      description: 'Stop taking the first answer, in a small office with two other people in it.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'alarm', from: 'world', to: 'you', amount: 1 }],
        backfire: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: -20 },
          { kind: 'resource', id: 'alarm', from: 'world', to: 'you', amount: 2 },
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
      aliases: ['read', 'look at', 'look', 'check', 'examine', 'study', 'go through', 'listen to'],
      description: 'Put your own eyes on something in this office, or your ear to the radio.',
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
      description: 'Put something you have established in front of the three of them.',
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
      id: 'wake',
      label: 'Start getting people up',
      aliases: ['wake', 'wake them', 'get them up', 'start getting people up', 'rouse', 'start waking'],
      description: 'Send a pair of hands upstairs to start. It costs you the hands and the building notices.',
      default_minutes: 3,
      requires_target: false,
      base_difficulty: 0.2,
      chip_when: { resource: { id: 'hands', holder: 'you', gte: 2 } },
      effects_by_outcome: {
        success: [
          { kind: 'resource', id: 'hands', from: 'you', to: 'world', amount: 1 },
          { kind: 'resource', id: 'alarm', from: 'world', to: 'you', amount: 1 },
        ],
        partial: [
          { kind: 'resource', id: 'hands', from: 'you', to: 'world', amount: 1 },
          { kind: 'resource', id: 'alarm', from: 'world', to: 'you', amount: 2 },
        ],
        failure: [{ kind: 'resource', id: 'alarm', from: 'world', to: 'you', amount: 2 }],
      },
      play_signals: [
        { dimension: 'control_delegation', direction: 0.7, strength: 0.7, context: 'You set something in motion rather than settling it first.' },
        { dimension: 'caution_boldness', direction: 0.5, strength: 0.5, context: 'You started moving before you had finished deciding.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'say nothing', 'do nothing', 'think', 'listen', 'stand'],
      description: 'Let a minute of the thirty-five go and listen to the building.',
      default_minutes: 2,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'evacuate',
      label: 'Load the bus',
      aliases: ['load the bus', 'evacuate', 'move everybody', 'take them all', 'get everyone out', 'everybody goes'],
      description: 'Everybody goes to the school hall, in as many trips as it takes. It cannot be undone once the bus is out of the yard.',
      default_minutes: 5,
      requires_target: false,
      commitment: true,
      commitment_line: 'The bus went out of the yard with the first load in it and the yard behind it was not the same yard.',
      base_difficulty: 0.15,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.7, strength: 0.8, context: 'You moved everybody rather than wait to see.' },
        { dimension: 'preserve_risk', direction: 0.6, strength: 0.6, context: 'You accepted the risk of the road over the risk of the building.' },
      ],
    },
    {
      id: 'shelter',
      label: 'Take everybody upstairs',
      aliases: ['take everybody upstairs', 'shelter in place', 'move them upstairs', 'stay put', 'stay', 'shelter', 'nobody goes'],
      description: 'Everybody who can be moved goes to the first floor and the building takes it. Nobody leaves tonight.',
      default_minutes: 5,
      requires_target: false,
      commitment: true,
      commitment_line: 'You told them nobody was going anywhere, and the four of you started carrying people up a staircase.',
      base_difficulty: 0.15,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.7, strength: 0.8, context: 'You kept everybody where you could see them.' },
        { dimension: 'preserve_risk', direction: -0.6, strength: 0.6, context: 'You accepted the risk of the building over the risk of the road.' },
      ],
    },
    {
      id: 'split',
      label: 'Send the ones who can go',
      aliases: ['send the ones who can go', 'split', 'send some', 'take the ones who can travel', 'one trip', 'two groups'],
      description: 'One load out, the rest upstairs with whoever is left. It is the only answer that spends the bus and keeps the building.',
      default_minutes: 5,
      requires_target: false,
      commitment: true,
      commitment_line: 'You split them, which meant standing in a corridor at midnight saying names out loud.',
      base_difficulty: 0.25,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'control_delegation', direction: -0.4, strength: 0.5, context: 'You kept both halves of it yourself.' },
        { dimension: 'direct_cunning', direction: 0.5, strength: 0.5, context: 'You found the answer nobody in the room had put on the table.' },
      ],
    },
  ],

  overrides: [
    // --- the carer says the thing she has not been saying ----------------------
    {
      id: 'o_ada_says',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['ada'],
        pred: { not: { flag: 'ada_said', eq: true } },
      },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'ada_said', value: true }],
      reveals: [{ fact: 'staff_real', to: 'you', status: 'observed', via: 'p_staff_ada' }],
      summary:
        'Ada looks at the drugs key on her wrist rather than at you, and says it in one sentence with no apology in it: that her two are at her sister\'s, that her sister went out at eight, and that whatever the four of you decide she is leaving here at midnight. Nobody in the office says anything for a moment. Devlin puts the keys down on the desk for the first time tonight.',
    },
    // --- putting the arithmetic together --------------------------------------
    {
      id: 'o_arithmetic',
      priority: 95,
      when: {
        verb: ['read', 'tell', 'wait'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'fuel_real', correct: true } },
            { knows: { actor: 'you', fact: 'bus_seats', correct: true } },
            { not: { flag: 'arithmetic', eq: true } },
          ],
        },
      },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'arithmetic', value: true }],
      summary:
        'One tank and sixteen seats is not a plan for forty-one people, it is a plan for sixteen of them, and you have been standing in this office for ten minutes letting three people talk about two trips. You write the two numbers on the corner of the whiteboard where everybody can see them, and the argument in this room changes shape.',
    },

    // --- loading the bus -------------------------------------------------------
    {
      id: 'o_evac_into_it',
      priority: 120,
      when: {
        verb: ['evacuate'],
        pred: { truth: { fact: 'water_truth', eq: 'comes all at once at half past eleven, because the wall upstream goes' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'moved' },
        { kind: 'flag', id: 'moved_into_it', value: true },
      ],
      summary:
        'The first load goes out at twenty past eleven and is at the mill crossing when the wall upstream lets go. The bus does not get through and it does not come back. What happens to the people on it is decided by a farmer with a tractor and a rope, and most of them are all right, and it is not because of anything anybody in this office worked out.',
    },
    {
      id: 'o_evac_right',
      priority: 110,
      when: {
        verb: ['evacuate'],
        pred: { truth: { fact: 'water_truth', eq: 'takes the ground floor before midnight and is at the first-floor windows by four' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'moved' },
        { kind: 'flag', id: 'moved_in_time', value: true },
      ],
      summary:
        'The first load goes at twenty past and the second at ten past midnight with the water at the axles, and Devlin gets it out of the yard on what was in the tank and nothing to spare. At four in the morning the first floor of your building has water at the window sills and there is nobody in it.',
    },
    {
      id: 'o_evac',
      priority: 100,
      when: { verb: ['evacuate'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'moved' },
        { kind: 'flag', id: 'moved_unnecessarily', value: true },
      ],
      summary:
        'You move forty-one people out of their beds and two miles down a road at eleven at night, into a hall with camp beds and no oxygen, and by two in the morning it is clear the water was never going to reach the first floor. Three of them are in hospital within the week and one of those does not come back, and no inquiry ever says you did the wrong thing.',
    },

    // --- upstairs --------------------------------------------------------------
    {
      id: 'o_shelter_right',
      priority: 110,
      when: {
        verb: ['shelter'],
        pred: {
          any: [
            { truth: { fact: 'water_truth', eq: 'crests at the top of the car park a little after two and goes no further' } },
            { truth: { fact: 'water_truth', eq: 'takes the ground floor by one and never reaches the first' } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'stayed' },
        { kind: 'flag', id: 'stayed_dry', value: true },
      ],
      summary:
        'You take everybody up and the four of you spend two hours doing it and it is the hardest physical thing any of you have ever done. The water gets into the ground floor and stops. In the morning the county arrives to find forty-three people upstairs, warm, on their own drugs round, in a building with a wrecked ground floor and nobody hurt.',
    },
    {
      id: 'o_shelter',
      priority: 100,
      when: { verb: ['shelter'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'stayed' },
        { kind: 'flag', id: 'stayed_and_flooded', value: true },
      ],
      summary:
        'You take everybody up, and at four in the morning the water is at the first-floor window sills and there is no bus and no road and no phone. What happens after that is a lifeboat crew from the coast coming up a residential street in the dark, and them being very good at it, and it still being the worst night of anybody\'s life.',
    },

    // --- splitting -------------------------------------------------------------
    {
      id: 'o_split_right',
      priority: 110,
      when: {
        verb: ['split'],
        pred: {
          any: [
            { truth: { fact: 'water_truth', eq: 'takes the ground floor before midnight and is at the first-floor windows by four' } },
            { truth: { fact: 'water_truth', eq: 'comes all at once at half past eleven, because the wall upstream goes' } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'split' },
        { kind: 'flag', id: 'split_well', value: true },
      ],
      summary:
        'Sixteen who can walk are out of the yard inside ten minutes, which forty-three would never have been, and they are on the far side of the mill before anything happens to the mill. The rest go up the stairs. When the water reaches the first floor there are twenty-seven people up there instead of forty-three, with two staff and four cylinders, and the difference between those two numbers is the whole night.',
    },
    {
      id: 'o_split',
      priority: 100,
      when: { verb: ['split'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'decision', value: 'split' },
        { kind: 'flag', id: 'split_badly', value: true },
      ],
      summary:
        'Sixteen of them go to a hall with camp beds and no oxygen and the rest go upstairs, and the water stops in the car park. For a fortnight afterwards the sixteen and the twenty-seven are in different buildings and two of the sixteen do not settle again, and you spend a long time explaining a decision that turned out not to have needed making.',
    },
  ],

  injects: [
    {
      id: 'i_devlin_keys',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      once: true,
      actor: 'devlin',
      actor_type: 'character',
      verb: 'presses',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'devlin', axis: 'fear', delta: 8 }],
      line: 'Devlin turns the keys over in his hand. "Every minute we stand here is a minute of that road I have to drive on the way back. If we are going, we are going."',
      summary: 'The driver pushes to start moving.',
    },
    {
      id: 'i_ryner_position',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 3 } }, { not: { flag: 'arithmetic', eq: true } }] },
      once: true,
      actor: 'ryner',
      actor_type: 'character',
      verb: 'argues',
      demands_response: true,
      effects: [{ kind: 'flag', id: 'ryner_stated', value: true }],
      line: 'Ryner has not moved from beside the phone. "The position is that the county has issued an instruction to everybody below the bridge, and we are below the bridge, and the instruction does not have an exception in it for us."',
      summary: 'Head office puts the company position on the record.',
    },
    {
      id: 'i_dayroom',
      kind: 'pressure',
      when: { resource: { id: 'alarm', holder: 'you', gte: 2 } },
      once: true,
      actor: 'ada',
      actor_type: 'character',
      verb: 'reports',
      effects: [{ kind: 'disposition', actor: 'ada', axis: 'fear', delta: 10 }],
      line: 'Ada puts her head out into the corridor and back in. "They are awake. Not some of them. The ones at the front can hear the water in the car park and they have told the rest."',
      summary: 'The building has worked out that something is wrong.',
    },
    {
      id: 'i_lights',
      kind: 'pressure',
      when: { clock: { gte: 22 } },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'dips',
      effects: [{ kind: 'resource', id: 'alarm', from: 'world', to: 'you', amount: 1 }],
      line: 'The strip light goes off and comes back, and out in the car park the lights under the water do not come back at all.',
      summary: 'The supply is going.',
    },
  ],

  processes: [
    {
      id: 'w_ada_goes',
      kind: 'actor',
      actor: 'ada',
      trigger: { when: { all: [{ flag: 'ada_said', eq: true }, { clock: { gte: 26 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'resource', id: 'hands', from: 'you', to: 'world', amount: 1 },
        { kind: 'position', entity: 'ada', location: 'dayroom' },
      ],
      line: 'Ada goes through to the day room to say goodnight to the ones who are awake, which is what she does instead of saying goodbye to you.',
      summary: 'The senior carer starts her last round.',
    },
    {
      id: 'w_water_rises',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 8, when: { clock: { gte: 8 } } },
      effects: [{ kind: 'resource', id: 'alarm', from: 'world', to: 'you', amount: 1 }],
      line: 'Somewhere under the building something shifts and settles, the way a house does when the ground under it stops being ground.',
      summary: 'The water is still coming up.',
    },
  ],

  outcome_dimensions: [
    {
      key: 'people',
      label: 'The residents',
      question: 'What the night did to forty-three people who could not decide any of this for themselves.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'stayed_dry', eq: true }, points: 4, note: 'everybody went up, everybody stayed warm, and nobody was hurt' },
        { when: { flag: 'split_well', eq: true }, points: 3, note: 'sixteen were clear of it before it happened and the rest were upstairs with room to work' },
        { when: { flag: 'moved_in_time', eq: true }, points: 3, note: 'the building went under at four and there was nobody in it' },
        { when: { flag: 'split_badly', eq: true }, points: 2, note: 'sixteen spent a fortnight somewhere else for a flood that stopped in the car park' },
        { when: { flag: 'moved_unnecessarily', eq: true }, points: 1, note: 'forty-three people were moved two miles at night into a hall with no oxygen, and it was never going to reach them' },
        { when: { flag: 'moved_into_it', eq: true }, points: 0, note: 'the first load was on the crossing when the wall went, and what saved them was a farmer' },
        { when: { flag: 'stayed_and_flooded', eq: true }, points: 0, note: 'forty-three people were on a first floor with water at the sills and no way out of the building' },
      ],
      bands: [
        { at_least: 4, label: 'all of them, warm' },
        { at_least: 3, label: 'all of them' },
        { at_least: 2, label: 'all of them, and a cost' },
        { at_least: 1, label: 'moved for nothing' },
        { at_least: 0, label: 'in the water' },
      ],
    },
    {
      key: 'decision',
      label: 'The call',
      question: 'Whether the thing you decided fitted what the river actually did.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'split_well', eq: true }, points: 4, note: 'you spent the one run you had on the people who could use it and kept the building for the rest' },
        { when: { flag: 'stayed_dry', eq: true }, points: 4, note: 'you kept them where the help was, and the water stopped where you judged it would' },
        { when: { flag: 'moved_in_time', eq: true }, points: 3, note: 'you moved, and moving was the answer' },
        { when: { flag: 'split_badly', eq: true }, points: 2, note: 'the safest-looking answer, on a night when the safe answer was not needed' },
        { when: { flag: 'moved_unnecessarily', eq: true }, points: 1, note: 'you did what the county said on a night when the county was talking to the whole valley and not to you' },
        { when: { flag: 'stayed_and_flooded', eq: true }, points: 0, note: 'you stayed, and the water came to the first floor' },
        { when: { flag: 'moved_into_it', eq: true }, points: 0, note: 'you put a bus on the lowest road in the county at the hour the wall went' },
      ],
      bands: [
        { at_least: 4, label: 'right, and for the right reasons' },
        { at_least: 3, label: 'right' },
        { at_least: 2, label: 'defensible' },
        { at_least: 1, label: 'the instruction, not the situation' },
        { at_least: 0, label: 'wrong' },
      ],
    },
    {
      key: 'staff',
      label: 'The people who work for you',
      question: 'What the night cost the three people who were on with you.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'ada_said', eq: true }, points: 2, note: 'the person who had to leave was able to say so out loud, in time for it to be part of the plan' },
        { when: { flag: 'arithmetic', eq: true }, points: 1, note: 'you put the real numbers where the whole room could see them instead of arguing with one man about his own tank' },
        { when: { knows: { actor: 'you', fact: 'staff_real', correct: true } }, points: 1, note: 'you knew how many pairs of hands you actually had after midnight' },
      ],
      bands: [
        { at_least: 4, label: 'they were told the truth and told you theirs' },
        { at_least: 3, label: 'they were part of it' },
        { at_least: 2, label: 'one of them got to say the hard thing' },
        { at_least: 1, label: 'you worked some of it out about them' },
        { at_least: 0, label: 'they carried it and said nothing' },
      ],
    },
    {
      key: 'knew',
      label: 'What you knew',
      question: 'Whether you established what you and three other people could actually do before you committed them.',
      min: 0,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'fuel_real', correct: true } }, points: 1, note: 'you found out there was one run in that tank and not two' },
        { when: { knows: { actor: 'you', fact: 'bus_seats', correct: true } }, points: 1, note: 'you found out what the bus actually carries' },
        { when: { knows: { actor: 'you', fact: 'oxygen_four', correct: true } }, points: 1, note: 'you established which of them could not leave the building at all' },
        { when: { knows: { actor: 'you', fact: 'water_truth', correct: true } }, points: 1, note: 'you got the upstream gauge before you decided, which is the only forward-looking thing in the building' },
      ],
      bands: [
        { at_least: 4, label: 'you knew what you had' },
        { at_least: 3, label: 'you knew most of it' },
        { at_least: 2, label: 'you knew some of it' },
        { at_least: 1, label: 'you knew one thing' },
        { at_least: 0, label: 'you decided on what you were handed' },
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
      id: 'given_established',
      label_left: 'Work With The Numbers You Were Given',
      label_right: 'Establish Them',
      measures: 'Whether you took the room\'s account of what could be done, or found out what could be done.',
    },
    {
      id: 'move_hold',
      label_left: 'Move Them',
      label_right: 'Keep Them Where You Are',
      measures: 'Which risk you took when both of the things in front of you were risks.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['stayed_dry', 'stayed_and_flooded'], message: 'the water reached the first floor or it did not' },
      { flags: ['moved_in_time', 'moved_unnecessarily', 'moved_into_it'], message: 'the road was there when the bus was on it, or it was not, or it did not matter' },
      { flags: ['split_well', 'split_badly'], message: 'splitting them was needed or it was not' },
    ],
  },

  content_descriptors: {
    depicted: [
      'a flood at night in a residential care home, with frail and elderly residents at risk',
      'a decision that may cost lives whichever way it goes',
      'deaths referred to afterwards and none shown',
      'professional disagreement between colleagues under pressure',
    ],
    discussable: ['flooding', 'frail elderly residents', 'oxygen dependency', 'a care worker with children at home', 'deaths in the weeks afterwards'],
    player_action_bounds: [
      'you may ask, press, look at things, tell the room, start getting people up, load the bus, take everybody upstairs, or send the ones who can go',
      'you may not harm anyone in this building; nobody here can be hurt by you and the world will not resolve an attempt',
      'nobody here is a real person, and no real home, town, flood or county is depicted',
    ],
    intensity: 'strong',
    estimated_minutes: 14,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'Not in this building, and not in the next half hour.',
    'block.absent': '{name} is not in the office. Whatever that was going to be, it waits.',
    'block.dead': 'That is past being any use to anybody.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not in here, and going for it costs minutes you have been counting.',
    'block.sealed': '{name} does not open for you, and all three of them would watch you try.',
    'block.no_target': 'Ada gets there first. "{verb} {whom}?"',
    'block.broke': 'There is nobody left to send. There were four of you and you have counted them.',
    'block.short': 'You have {held} of that and not {wanted}, and everybody in this office can count.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 1 },
};

export default HIGH_WATER;
