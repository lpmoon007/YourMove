// THE LAST HOUR — the seventh world.
//
// Dawn in 1809. The general is dead, you are the ranking officer, and a man on a horse
// has just told you the left flank is folding. Reinforce it from the center and you open
// a gap; hold the center and two hundred men on the left are cut off.
//
// That is the choice the world offers. What makes it a world rather than a slider is that
// every fact in it arrived on horseback and is therefore already old — and one of the four
// things the seed draws is that the left is not being attacked at all, and the pressure
// there is a demonstration meant to make you do exactly what you are about to do.
//
// Nothing here moves the player: a divisional commander at dawn stands on a knoll and
// receives the war. Everything that decides the run is at the command post, which is the
// point of the position.

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const THE_LAST_HOUR: ScenarioPackage = {
  id: 'ym-the-last-hour',
  slug: 'the-last-hour',
  title: 'The Last Hour',
  tagline: 'The general is dead, the left is folding, and everything you know arrived on a horse.',
  format: 'F1',
  genre: 'War, 1809 — a command post at dawn, twenty-five minutes after the general was killed. One knoll, three officers, one decision.',
  category: 'War & Command',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise: 'A colonel who has just inherited a division decides where to put his only reserve, using reports that are all older than they look.',
    ending_out_of_time:
      'The enemy commits before you do. Whatever was going to happen on that flank happens without an order from this knoll, and the first thing anybody will ask afterward is what the ranking officer was doing for twenty-five minutes.',
    setup:
      'It is a little after dawn on a July morning in 1809, on a ridge above a river valley, on the second day ' +
      'of a battle nobody has won. Your gun crews are down to about a dozen rounds a piece and the enemy line ' +
      'in front of you has not broken. Twenty-five minutes ago a shell killed the general and both of the ' +
      'officers standing next to him, which makes you — a colonel of infantry who came up here to ask about ' +
      'ammunition — the ranking officer of this division.\n\n' +
      'Since then one thing has happened. An aide rode in from the left and reported that the flank there is ' +
      'folding. You have one reserve. If you send it left you thin the center; if you hold the center you leave ' +
      'about two hundred men on the left with nobody coming.',
    trouble:
      'Every single thing you know this morning arrived on a horse, which means all of it is older than the man ' +
      'carrying it thinks it is. The aide is certain about what he saw. The gunner is certain about what he can ' +
      'do. The general\'s chief of staff has the written orders and an opinion about them. And somewhere out ' +
      'there an enemy commander is doing arithmetic about what a new man in charge of a division does in his ' +
      'first half hour.',
    cold_open:
      'The knoll smells of powder and wet grass and there is a horse down by the gun line that nobody has had ' +
      'time to deal with. The general is under a cloak twenty feet away with his boots showing. Fenwick is ' +
      'still holding his horse and has not got his breath back. Dain came up from the battery and has his hat ' +
      'in his hand. Marek has the dispatch case open on the map board and is waiting for you to say something.\n\n' +
      '"They are going," Fenwick says. "The left. I saw the second battalion give ground and I came straight ' +
      'here. If you are sending anybody, sir, it wants to be now."',
    example_actions: [
      'ask Fenwick when he left the left flank',
      'look through the telescope at the left',
      "read the general's dispatch case",
    ],
    cast_note:
      'Three officers, you, and eleven thousand men who do not know yet that the general is dead. Nobody senior is coming, because there is nobody senior left on this side of the river.',
    clock_label: 'before the enemy decides it for you',
    house_rules: [
      'Everything you know came on a horse and is older than the man carrying it believes. One of them is certain about something he saw and wrong about when he saw it. One of them is protecting his own guns. One of them has the written orders and a view about them.',
      'You have three messengers and they do not come back. Sending one to find something out costs you the man and the minutes both.',
      'Reinforcing the left ends the morning. So does holding the center, and so does pulling everybody back. Everything before that, you can still take back.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the ranking officer',
      start_location: 'post',
      you:
        'You are a colonel of infantry who came up this knoll twenty-five minutes ago to ask a question about ' +
        'ammunition, and who is now in command of eleven thousand men because of where a shell landed. You have ' +
        'commanded a regiment for four years and a division for twenty-five minutes.',
      objective:
        'Put your one reserve where it actually matters — and find out what is really happening out there ' +
        'before you commit it, rather than after.',
      pressure:
        'The aide is holding his horse and waiting. Every minute you spend finding something out is a minute in ' +
        'which whatever is happening on that flank goes on happening.',
    },
    duration_minutes: 25,
    resources: {
      riders: { label: 'Messengers you still have', holdings: { you: 3 } },
      doubt: { label: 'How uncertain this knoll looks to the men watching it', holdings: { you: 0 } },
    },
    flags: { reserve: 'uncommitted' },

    opening: {
      prompt:
        'Dawn, 1809. Your gun crews are down to their last dozen rounds per cannon and the enemy line has not ' +
        'broken. Your aide reports the left flank is folding — reinforcements could hold it, but pulling them ' +
        'from the center opens a gap the enemy cavalry will find within the hour. Your general is dead. You are ' +
        'the ranking officer now, and everything you have been told this morning arrived on a horse.',
      choices: [
        {
          id: 'when',
          label: 'Ask when he left the flank',
          preview:
            'He has told you what he saw. He has not told you when, and on this ground a man and a horse are slower than they feel.',
          move: 'ask Fenwick when he left the left flank',
        },
        {
          id: 'glass',
          label: 'Look at the left yourself',
          preview:
            'You are on a knoll with a telescope and the whole valley in front of you. Before you move eleven thousand men on one report, you can spend a minute looking.',
          move: 'look through the telescope at the left',
        },
        {
          id: 'orders',
          label: "Read the general's last order",
          preview:
            'The dispatch case is open on the map board because nobody has had the nerve to close it. What he was actually told to hold is written in it.',
          move: "read the general's dispatch case",
        },
      ],
    },
  },

  locations: [
    {
      id: 'post',
      name: 'the command post',
      description:
        'A knoll with a map board on trestles, a dead general under a cloak, three officers and the whole valley laid out in front of you in the smoke.',
      travel_minutes: { battery: 2 },
    },
    {
      id: 'battery',
      name: 'the gun line',
      description: 'Eighteen pieces in the open, crews sitting down between rounds because sitting down is how you make a dozen rounds last.',
      travel_minutes: { post: 2 },
    },
  ],

  entities: [
    {
      id: 'telescope',
      name: 'the telescope',
      kind: 'object',
      description: 'The general\'s, brass, on the map board where he put it down. From this knoll it reaches most of the valley when the smoke lifts.',
      initial_state: 'on the map board',
      location: 'post',
      searchable: true,
      portable: true,
    },
    {
      id: 'dispatch',
      name: "the general's dispatch case",
      kind: 'document',
      description: 'Open on the board, with the written order he was operating under and the time it was received.',
      initial_state: 'open',
      location: 'post',
      searchable: true,
      body:
        'Received 3:40 a.m.\n\n' +
        'The division will hold the ridge and the crossing below it, and will not be drawn off the ridge on any\n' +
        'account. The enemy is expected to demonstrate against a flank in order to procure exactly that.\n\n' +
        'You are not to consider the ridge lost while the guns are on it.',
    },
    {
      id: 'returns',
      name: 'the morning returns',
      kind: 'document',
      description: 'Strength and ammunition as counted at four o\'clock, in three different hands and one pencil.',
      initial_state: 'weighted down with a stone',
      location: 'post',
      searchable: true,
      body:
        'RESERVE (2 bns) ......... 900 effective   [pencil, later: "less 2 coys detached 0500 — not amended"]\n' +
        'LEFT (3 bns) ............ 1,140 effective\n' +
        'GUNS .................... 18 pieces\n' +
        'AMMUNITION .............. 12 rounds per piece\n' +
        '   [pencil, later: "not incl. 6 limbers came up 0520, not issued"]\n' +
        'TIMED 0400. NOTHING ON THIS SHEET IS LATER THAN 0400.',
    },
    {
      id: 'map',
      name: 'the map board',
      kind: 'document',
      description: 'The valley, the ridge, the crossing, and every unit marked in chalk by somebody who is now under a cloak.',
      initial_state: 'on trestles',
      location: 'post',
      searchable: true,
    },
    {
      id: 'cloak',
      name: "the general's cloak",
      kind: 'fixture',
      description: 'Twenty feet away, with his boots showing. Nobody has moved him because nobody has been told to.',
      initial_state: 'covering him',
      location: 'post',
      searchable: true,
    },
  ],

  cast: [
    {
      id: 'fenwick',
      name: 'Fenwick',
      role: 'the aide who rode in from the left',
      voice:
        'Out of breath, urgent, gives you the picture and not the timing. Says "sir" at the front of sentences ' +
        'that are actually arguments.',
      motive:
        'Have brought the warning that saved the flank, and not be the man who watched a battalion give ground ' +
        'and did nothing about it.',
      reliability: 'mistaken',
      competence: 0.45,
      start_location: 'post',
      intro:
        'A staff aide, twenty-three, who rode in from the left flank a few minutes ago and is still holding his ' +
        'horse. He is the only person on this knoll who has been down there this morning.',
      leverage: 'He is the only eyewitness to what is happening on the left, and he is the reason anybody here thinks anything about it.',
      starting_disposition: { trust: 35, fear: 25 },
      knows: ['report_age', 'left_truth'],
      fallback_lines: {
        default: 'Sir, I saw them give ground. I am not inventing it.',
        pressed: 'You may ask me again and I will tell you the same thing, because it is the same thing.',
      },
    },
    {
      id: 'dain',
      name: 'Dain',
      role: 'the artillery commander',
      voice:
        'Flat, unhurried, answers in numbers and stops. Has been shouted at by better men than you and it did ' +
        'not work then either.',
      motive:
        'Keep his eighteen pieces on this ridge and firing, because guns that withdraw across a valley in ' +
        'daylight are guns that are captured on the road.',
      reliability: 'self_serving',
      competence: 0.75,
      start_location: 'post',
      intro:
        'The artillery commander, who came up from the gun line to find out what the division is doing now, and ' +
        'who has eighteen pieces sitting in the open behind him.',
      leverage: 'He knows what his guns can actually still do, and nothing on this ridge holds without them.',
      starting_disposition: { trust: 20, fear: 5 },
      knows: ['ammunition', 'cavalry_truth'],
      fallback_lines: {
        default: 'A dozen rounds a piece is a dozen rounds a piece. It does not become more because it is needed.',
        pressed: 'I will tell you what my guns can do. I will not tell you what you want them to do.',
      },
    },
    {
      id: 'marek',
      name: 'Marek',
      role: "the general's chief of staff",
      voice:
        'Precise, quiet, arranges the facts in the order that leads where he is going. Says "of course" before ' +
        'the part he is about to argue against.',
      motive:
        'Get this division off the ridge and across the river intact, because he wrote the appreciation that ' +
        'put it here and he has known since three in the morning that it was wrong.',
      reliability: 'deceptive',
      competence: 0.85,
      start_location: 'post',
      intro:
        "The general's chief of staff. He has been at this since three in the morning, he keeps the dispatch " +
        'case and the returns, and he is the only officer here who has seen the whole plan.',
      leverage: 'He holds the written orders, the strength returns, and the only complete picture of what this division was sent here to do.',
      starting_disposition: { trust: 25, fear: 10 },
      knows: ['last_order', 'reserve_real', 'marek_stake'],
      fallback_lines: {
        default: 'Of course. Though I would put it slightly differently than that.',
        pressed: 'I have been awake since two and I have been right about most of it. Ask me the next question.',
      },
    },
  ],

  facts: [
    {
      id: 'left_truth',
      statement: 'On the left flank, what is actually happening is that it is {value}.',
      question: 'what is actually happening on the left flank',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_left_glass', 'p_left_cornered'],
      required_for_top_outcome: true,
    },
    {
      id: 'report_age',
      statement: 'The report from the left is {value}.',
      question: 'how old the report from the left actually is',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_age_fenwick', 'p_age_returns'],
      required_for_top_outcome: true,
    },
    {
      id: 'cavalry_truth',
      statement: 'The enemy cavalry {value}.',
      question: 'whether the enemy cavalry could actually exploit a gap this morning',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_cav_glass', 'p_cav_dain'],
      required_for_top_outcome: true,
    },
    {
      id: 'reserve_real',
      statement: 'The reserve is {value}.',
      question: 'how big the reserve actually is',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_res_returns', 'p_res_marek'],
    },
    {
      id: 'ammunition',
      statement: 'The guns have {value}.',
      question: 'how much the guns can actually still fire',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_ammo_returns', 'p_ammo_dain'],
    },
    {
      id: 'last_order',
      statement: 'The general\'s written order says {value}.',
      question: 'what the general was actually ordered to do',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_order_case', 'p_order_marek'],
    },
    {
      id: 'marek_stake',
      statement: 'The chief of staff wants the division off this ridge because {value}.',
      question: 'why the chief of staff wants everybody across the river',
      category: 'supporting',
      sensitivity: 'hidden',
      discoverable_via: ['p_stake_marek'],
    },
  ],

  discovery_paths: [
    // --- left_truth -----------------------------------------------------------
    {
      id: 'p_left_glass',
      fact: 'left_truth',
      description: 'Put the general\'s telescope on the left flank and spend a minute looking at it yourself.',
      via_verb: ['read'],
      via_target: ['telescope'],
      requires: { knows: { actor: 'you', fact: 'report_age', correct: true } },
      cost_minutes: 1,
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_left_cornered',
      fact: 'left_truth',
      description: 'Put the age of the report and the position of the enemy horse to the man who brought it, together.',
      requires: {
        all: [
          { knows: { actor: 'you', fact: 'report_age', correct: true } },
          { knows: { actor: 'you', fact: 'cavalry_truth', correct: true } },
        ],
      },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },
    {
      id: 'p_left_fenwick_free',
      fact: 'left_truth',
      description: 'Ask the aide what is happening on the left and take the picture of a man who rode hard to bring it.',
      via_verb: ['ask'],
      via_target: ['fenwick'],
      requires: { not: { knows: { actor: 'you', fact: 'report_age', correct: true } } },
      topic_hints: ['left', 'flank', 'happening', 'what', 'situation', 'going', 'folding', 'giving'],
      disclosure: {
        status: 'told',
        value: 'folding, and will be gone inside twenty minutes without help',
        confidence: 0.6,
        fidelity: 0.4,
        distortion: 'a picture from a man who has not considered how long he took to get here',
      },
    },

    // --- report_age: the sincere mistake that is not about what he saw ---------
    {
      id: 'p_age_fenwick',
      fact: 'report_age',
      description: 'Ask the aide when he left the flank, rather than what he saw when he was there.',
      via_verb: ['ask', 'press'],
      via_target: ['fenwick'],
      topic_hints: ['when', 'left', 'long', 'ago', 'time', 'took', 'ride', 'rode', 'minutes', 'clock'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8, fidelity: 0.9 },
    },
    {
      id: 'p_age_returns',
      fact: 'report_age',
      description: 'The returns are timed and so is the order in the case. Work forward from a clock rather than from a man.',
      via_verb: ['read'],
      via_target: ['returns'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },

    // --- cavalry_truth --------------------------------------------------------
    {
      id: 'p_cav_glass',
      fact: 'cavalry_truth',
      description: 'Look for the enemy horse yourself instead of accepting where everybody assumes they are.',
      via_verb: ['read'],
      via_target: ['telescope'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_cav_dain',
      fact: 'cavalry_truth',
      description: 'Ask the gunner where the enemy horse is. Gunners watch cavalry the way other men watch weather.',
      via_verb: ['ask', 'press'],
      via_target: ['dain'],
      requires: { knows: { actor: 'dain', fact: 'cavalry_truth' } },
      topic_hints: ['cavalry', 'horse', 'squadrons', 'dragoons', 'where', 'exploit', 'gap', 'charge'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },

    // --- the rest -------------------------------------------------------------
    {
      id: 'p_res_returns',
      fact: 'reserve_real',
      description: 'Read the returns including what somebody added in pencil after they were written up.',
      via_verb: ['read'],
      via_target: ['returns'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_res_marek',
      fact: 'reserve_real',
      description: 'Ask the chief of staff how many men are actually in the reserve this morning.',
      via_verb: ['ask', 'press'],
      via_target: ['marek'],
      requires: { knows: { actor: 'marek', fact: 'reserve_real' } },
      topic_hints: ['reserve', 'many', 'strength', 'battalions', 'effective', 'numbers', 'detached'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
    {
      id: 'p_ammo_returns',
      fact: 'ammunition',
      description: 'The ammunition line on the returns has a pencil note under it in a different hand.',
      via_verb: ['read'],
      via_target: ['returns'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },
    {
      id: 'p_ammo_dain',
      fact: 'ammunition',
      description: 'Ask the gunner what he can actually still fire, and make him include what came up at twenty past five.',
      via_verb: ['ask', 'press'],
      via_target: ['dain'],
      topic_hints: ['ammunition', 'rounds', 'fire', 'shot', 'limbers', 'guns', 'many', 'left'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75 },
    },
    {
      id: 'p_order_case',
      fact: 'last_order',
      description: 'Read the written order in the dispatch case, including the sentence about a demonstration.',
      via_verb: ['read'],
      via_target: ['dispatch'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_order_marek',
      fact: 'last_order',
      description: 'Ask the chief of staff what the division was actually ordered to do, and make him say all of it.',
      via_verb: ['ask', 'press'],
      via_target: ['marek'],
      topic_hints: ['order', 'orders', 'told', 'instructions', 'sent', 'hold', 'ridge', 'written', 'says'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7 },
    },
    {
      id: 'p_stake_marek',
      fact: 'marek_stake',
      description: 'Ask the chief of staff who wrote the appreciation that put this division on this ridge.',
      via_verb: ['ask', 'press'],
      via_target: ['marek'],
      requires: { knows: { actor: 'you', fact: 'last_order', correct: true } },
      topic_hints: ['appreciation', 'wrote', 'whose', 'plan', 'why', 'here', 'ridge', 'chose', 'recommended'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
  ],

  // --- canonical truth, drawn once from the seed ----------------------------
  truth_template: {
    variables: [
      {
        id: 'left',
        kind: 'choice',
        // The last one is the answer the written order in the case warns you about, and
        // the one nobody standing on this knoll has considered.
        choices: [
          'folding exactly as reported, and will be gone inside twenty minutes without help',
          'already gone — it broke while the aide was riding, and there is nothing there to reinforce',
          'holding, and holding well — what was seen was a battalion changing front under fire',
          'not seriously attacked at all — the weight is going in against the crossing, and the left is a demonstration',
        ],
        weights: [3, 2, 2, 3],
      },
    ],
    facts: {
      left_truth: { from_variable: 'left' },
      report_age: {
        value: 'thirty-five minutes old, because the ground between here and the left is broken and he walked the horse most of it',
      },
      cavalry_truth: {
        value: 'were watering two miles back an hour ago and cannot be on this ridge inside ninety minutes',
      },
      reserve_real: { value: 'six hundred men and not nine hundred, because two companies were detached at five and the sheet was never amended' },
      ammunition: { value: 'about twenty rounds a piece, not twelve, because six limbers came up at twenty past five and were never issued' },
      last_order: { value: 'hold the ridge and the crossing, expect a demonstration against a flank, and do not be drawn off on any account' },
      marek_stake: { value: 'he wrote the appreciation that put the division here, and he has known since three in the morning that it was wrong' },
    },
    bindings: { situation: 'left' },
  },

  // --- who holds what, before the first action ------------------------------
  holds: [
    // The aide is right about what he saw and wrong about when. He rode hard and it felt
    // like ten minutes.
    {
      actor: 'fenwick',
      fact: 'report_age',
      status: 'believed_false',
      value: 'about ten minutes old — he came straight here at the gallop',
      confidence: 0.9,
    },
    // And what he saw, he saw. It is simply thirty-five minutes ago.
    { actor: 'fenwick', fact: 'left_truth', status: 'believed_false', value: 'folding, and will be gone inside twenty minutes without help', confidence: 0.85 },
    { actor: 'dain', fact: 'cavalry_truth', status: 'observed', value: '@canonical', confidence: 0.9 },
    { actor: 'dain', fact: 'ammunition', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'marek', fact: 'reserve_real', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'marek', fact: 'marek_stake', status: 'observed', value: '@canonical', confidence: 1 },
  ],

  // --- the action space -----------------------------------------------------
  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'put it to'],
      description: 'Put a question to one of the officers on this knoll.',
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
      description: 'Stop being collegiate about a question, in front of two other officers.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'doubt', from: 'world', to: 'you', amount: 1 }],
        backfire: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: -20 },
          { kind: 'resource', id: 'doubt', from: 'world', to: 'you', amount: 2 },
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
      aliases: ['read', 'look at', 'look', 'look through', 'check', 'examine', 'study', 'search'],
      description: 'Put your own eyes on something — a paper on the board, or the valley through a glass.',
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
      description: 'Put something you have worked out in front of the three of them.',
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
      id: 'send',
      label: 'Send a messenger',
      aliases: ['send', 'send a rider', 'send a messenger', 'send out', 'despatch a rider', 'send someone'],
      description: 'Put a man on a horse. You have three, they do not come back, and the ground is broken.',
      default_minutes: 4,
      requires_target: true,
      base_difficulty: 0.25,
      chip_when: { resource: { id: 'riders', holder: 'you', gte: 1 } },
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'riders', from: 'you', to: 'world', amount: 1 }],
        partial: [{ kind: 'resource', id: 'riders', from: 'you', to: 'world', amount: 1 }],
        failure: [{ kind: 'resource', id: 'riders', from: 'you', to: 'world', amount: 1 }],
      },
      play_signals: [
        { dimension: 'control_delegation', direction: 0.8, strength: 0.8, context: 'You sent somebody rather than working it out from where you stood.' },
        { dimension: 'preserve_risk', direction: 0.5, strength: 0.5, context: 'You spent minutes you could not get back on finding out.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'say nothing', 'do nothing', 'think', 'listen', 'let it come'],
      description: 'Let a minute go and listen to what the valley is doing.',
      default_minutes: 2,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'reinforce',
      label: 'Reinforce the left',
      aliases: ['reinforce the left', 'reinforce', 'send the reserve left', 'support the left', 'commit the reserve to the left', 'save the left'],
      description: 'Send the reserve to the flank and thin the center to do it.',
      commitment_line:
        'You sent the reserve left at a trot and watched it go, and then you turned round and looked at the center it had come out of, which from up here is now one line of men and a great deal of daylight.',
      default_minutes: 1,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.1,
      chip_when: { clock: { gte: 4 } },
      play_signals: [
        { dimension: 'speed_deliberation', direction: -0.7, strength: 0.8, context: 'You moved on the report you had rather than waiting for a better one.' },
        { dimension: 'preserve_risk', direction: 0.6, strength: 0.7, context: 'You put the reserve on one reading of the morning.' },
      ],
    },
    {
      id: 'holdcenter',
      label: 'Hold the center',
      aliases: ['hold the center', 'hold the centre', 'hold the line', 'keep the reserve', 'let the left fall back', 'stand fast', 'hold everything'],
      description: 'Keep the reserve where it is and let the left do what it is going to do.',
      commitment_line:
        'You kept the reserve where it stood. Somewhere down on the left, two hundred men found out over the next hour that nobody was coming, and they found it out one at a time.',
      default_minutes: 1,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.15,
      chip_when: { clock: { gte: 4 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.4, strength: 0.7, context: 'You kept what you had rather than spending it.' },
        { dimension: 'loyalty_opportunism', direction: 0.5, strength: 0.6, context: 'You held the position at the cost of the men furthest from you.' },
      ],
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      aliases: ['withdraw', 'pull back', 'general withdrawal', 'retire', 'fall back', 'get everybody back', 'abandon the ridge'],
      description: 'Take the division off the ridge and across the river while it is still a division.',
      commitment_line:
        'You gave the order and the division came off the ridge in reasonable order, guns last, and by nine o\'clock everybody who was alive at dawn was across the river and on ground nobody had sent you to hold.',
      default_minutes: 2,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.3,
      chip_when: { turns: { gte: 2 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.8, strength: 0.9, context: 'You took the ending where the fewest people are lost and the most is given up.' },
        { dimension: 'preserve_risk', direction: -0.8, strength: 0.85, context: 'You protected what you had rather than the position.' },
      ],
    },
  ],

  // --- the handful of beats the designer must control (L5) ------------------
  overrides: [
    {
      id: 'o_corner_fenwick',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['fenwick'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'report_age', correct: true } },
            { knows: { actor: 'you', fact: 'cavalry_truth', correct: true } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'cornered', value: true },
        { kind: 'disposition', actor: 'fenwick', axis: 'fear', delta: 20 },
      ],
      reveals: [{ fact: 'left_truth', to: 'you', status: 'observed', via: 'p_left_cornered' }],
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.3, strength: 0.4, context: 'You made sure before you moved.' },
        { dimension: 'speed_deliberation', direction: 0.5, strength: 0.6, context: 'You spent minutes establishing when rather than acting on what.' },
      ],
      summary:
        'You take him through it without raising your voice: that the ground between here and the left is broken, that he walked the horse most of it, that it is thirty-five minutes since he saw anything at all — and that the enemy horse everybody is frightened of was watering two miles back an hour ago. Fenwick opens his mouth and then works out the arithmetic himself, in front of everybody, and goes very white.',
    },
    {
      id: 'o_marek_admits',
      priority: 100,
      when: { verb: ['press'], target: ['marek'], pred: { knows: { actor: 'you', fact: 'last_order', correct: true } } },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'marek_open', value: true },
        { kind: 'disposition', actor: 'marek', axis: 'trust', delta: -10 },
        { kind: 'disposition', actor: 'marek', axis: 'fear', delta: 20 },
      ],
      reveals: [{ fact: 'marek_stake', to: 'you', status: 'observed', via: 'p_stake_marek' }],
      summary:
        'You read the sentence about a demonstration back to him off the general\'s own order and ask him who wrote the appreciation that put eleven thousand men on this ridge. Marek looks at the map board for a while. "I did," he says. "At two o\'clock this morning. And I have been standing here since four wanting somebody senior enough to countermand it."',
    },
    {
      id: 'o_reinforce_right',
      priority: 110,
      when: {
        verb: ['reinforce'],
        pred: { truth: { fact: 'left_truth', eq: 'folding exactly as reported, and will be gone inside twenty minutes without help' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'committed', value: 'left' },
        { kind: 'flag', id: 'reinforced_in_time', value: true },
        { kind: 'flag', id: 'reserve', value: 'left' },
      ],
      summary:
        'The reserve goes in on the left at about the last moment there was a left to go in on, and it stops there. The center is thin for two hours and nothing comes at it, and afterward everybody agrees you read it exactly right.',
    },
    {
      id: 'o_reinforce',
      priority: 100,
      when: { verb: ['reinforce'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'committed', value: 'left' },
        { kind: 'flag', id: 'reinforced_late', value: true },
        { kind: 'flag', id: 'reserve', value: 'left' },
      ],
      summary:
        'The reserve goes left. What it finds when it gets there is not what you were told was there, and by then it is in the wrong place and the center is a line of men standing rather further apart than any of them would like.',
    },
    {
      id: 'o_hold_right',
      priority: 110,
      when: {
        verb: ['holdcenter'],
        pred: {
          any: [
            { truth: { fact: 'left_truth', eq: 'holding, and holding well — what was seen was a battalion changing front under fire' } },
            { truth: { fact: 'left_truth', eq: 'not seriously attacked at all — the weight is going in against the crossing, and the left is a demonstration' } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'committed', value: 'center' },
        { kind: 'flag', id: 'held_correctly', value: true },
        { kind: 'flag', id: 'reserve', value: 'center' },
      ],
      summary:
        'You keep the reserve where it is. The left does not go, because the left was never going, and at about eight o\'clock the weight of it arrives where you are still standing with everything you did not spend.',
    },
    {
      id: 'o_hold',
      priority: 100,
      when: { verb: ['holdcenter'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'committed', value: 'center' },
        { kind: 'flag', id: 'held_and_lost_left', value: true },
        { kind: 'flag', id: 'reserve', value: 'center' },
      ],
      summary:
        'You keep the reserve where it is, and the line holds its shape, and the left goes. What is left of three battalions comes back across the stream in ones and twos for the rest of the morning, and about two hundred do not come back at all.',
    },
    {
      id: 'o_withdraw_right',
      priority: 110,
      when: {
        verb: ['withdraw'],
        pred: { truth: { fact: 'left_truth', eq: 'already gone — it broke while the aide was riding, and there is nothing there to reinforce' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'committed', value: 'back' },
        { kind: 'flag', id: 'withdrew_in_time', value: true },
        { kind: 'flag', id: 'reserve', value: 'unspent' },
      ],
      summary:
        'You take them off the ridge. The left had already gone before anybody on this knoll said a word about it, and the order to withdraw reaches the rest of the division about twenty minutes before the flank they no longer have would have been turned.',
    },
    {
      id: 'o_withdraw',
      priority: 100,
      when: { verb: ['withdraw'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'committed', value: 'back' },
        { kind: 'flag', id: 'withdrew_early', value: true },
        { kind: 'flag', id: 'reserve', value: 'unspent' },
      ],
      summary:
        'You take them off the ridge. Nobody is cut off and nobody breaks, and the guns come away, and you give up the ground and the crossing below it that the division was put here to hold.',
    },
  ],

  // --- the Director's library ------------------------------------------------
  injects: [
    {
      id: 'i_fenwick_presses',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      once: true,
      actor: 'fenwick',
      actor_type: 'character',
      verb: 'presses',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'fenwick', axis: 'fear', delta: 10 }],
      line: 'Fenwick has not let go of his horse. "Sir. Whatever you are going to do, every minute of this is a minute they are doing it without us."',
      summary: 'The aide pushes for a decision.',
    },
    {
      id: 'i_marek_argues',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 3 } }, { not: { flag: 'marek_open', eq: true } }] },
      once: true,
      actor: 'marek',
      actor_type: 'character',
      verb: 'argues',
      demands_response: true,
      effects: [{ kind: 'flag', id: 'withdrawal_urged', value: true }],
      line: 'Marek turns the map board very slightly toward you. "Of course we can hold the ridge. The question nobody has asked this morning is whether the ridge is worth the division, and there is a crossing behind us that is open for about another two hours."',
      summary: 'The chief of staff makes his case for coming off the ridge.',
    },
    {
      id: 'i_guns_slow',
      kind: 'pressure',
      when: { always: true },
      min_clock: 9,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'slow',
      effects: [{ kind: 'flag', id: 'guns_slowed', value: true }],
      line: 'The rhythm of the battery changes underneath you — slower, and more ragged, the sound of men being told to make it last. Dain does not look round at it, which means he already knows what it is.',
      summary: 'The guns slow down to conserve ammunition.',
    },
    {
      id: 'i_smoke_lifts',
      kind: 'reversal',
      when: { all: [{ clock: { gte: 12 } }, { not: { knows: { actor: 'you', fact: 'report_age', correct: true } } }] },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'smoke',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'report_age',
          status: 'observed',
          value: '@canonical',
          source: 'observation',
          fidelity: 1,
          confidence: 0.95,
        },
      ],
      line:
        'You look at the horse Fenwick is holding rather than at Fenwick. It is blown, and it is muddy to the shoulder, and no horse gets muddy to the shoulder crossing good ground at the gallop. Whatever he saw, he saw it a long way back and a long time ago.',
      summary: 'The state of the aide\'s horse gives away how long he has been riding.',
    },
    {
      id: 'i_dain_recovery',
      kind: 'recovery',
      when: {
        all: [
          { pressure: { gte: 0.6 } },
          { turns: { gte: 3 } },
          { not: { knows: { actor: 'you', fact: 'cavalry_truth' } } },
        ],
      },
      once: true,
      is_rescue: true,
      actor: 'dain',
      actor_type: 'character',
      verb: 'volunteers',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'cavalry_truth',
          status: 'told',
          value: '@canonical',
          source: 'dain',
          fidelity: 1,
          confidence: 0.85,
        },
      ],
      line:
        'Dain says, without being asked: "Their horse was watering behind the wood at five. Two miles, and they have to come round the marsh to get here. Whatever anybody is frightened of them doing inside the hour, they cannot do it inside the hour. I have been watching them all morning because that is what I do."',
      summary: 'The gunner puts the enemy cavalry where they actually are.',
    },
    {
      id: 'i_rider_in',
      kind: 'pressure',
      when: { turns: { gte: 4 } },
      min_clock: 6,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'rider',
      effects: [{ kind: 'resource', id: 'doubt', from: 'world', to: 'you', amount: 1 }],
      line: 'A rider comes up the reverse slope from the center, sees three officers and a body under a cloak and no general, and stops where he is, holding a message nobody has authority to take from him.',
      summary: 'A messenger arrives and cannot find anybody in command.',
    },
  ],

  // --- what the world does on its own ---------------------------------------
  processes: [
    {
      id: 'w_fenwick_goes',
      kind: 'actor',
      actor: 'fenwick',
      trigger: { when: { all: [{ flag: 'cornered', eq: true }, { clock: { gte: 16 } }] } },
      once: true,
      effects: [
        // Two, because that is what the map says it takes to get down to the guns. One
        // made the temporal invariant reject the whole write, so the line printed and the
        // aide never actually left the knoll.
        { kind: 'clock', minutes: 2 },
        { kind: 'position', entity: 'fenwick', location: 'battery' },
      ],
      line: 'Fenwick asks to be sent back down, and is, and takes his horse with him at a walk this time.',
      summary: 'The aide leaves the command post.',
    },
    {
      id: 'w_doubt_spreads',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 7, when: { clock: { gte: 7 } } },
      effects: [{ kind: 'resource', id: 'doubt', from: 'world', to: 'you', amount: 1 }],
      line: 'Somebody down on the reverse slope looks up at the knoll for a while and then says something to the man next to him.',
      summary: 'The division notices that nothing has come down from the knoll.',
    },
  ],

  // --- outcome: four axes that move independently ---------------------------
  outcome_dimensions: [
    {
      key: 'ground',
      label: 'The ground',
      question: 'Whether the division still held what it was put here to hold.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'held_correctly', eq: true }, points: 4, note: 'the ridge and the crossing were still yours at midday, and the reserve was never spent' },
        { when: { flag: 'reinforced_in_time', eq: true }, points: 3, note: 'the flank held and the ridge with it' },
        { when: { flag: 'held_and_lost_left', eq: true }, points: 2, note: 'the line kept its shape and the ridge, and the left was the price' },
        { when: { flag: 'withdrew_in_time', eq: true }, points: 2, note: 'you gave up the ground, but there was nothing left to hold it with' },
        { when: { flag: 'reinforced_late', eq: true }, points: 1, note: 'the reserve went to a place that was not what you were told it was' },
        { when: { flag: 'withdrew_early', eq: true }, points: 0, note: 'you gave up the ridge and the crossing the division was put here to hold' },
      ],
      bands: [
        { at_least: 4, label: 'held, and cheaply' },
        { at_least: 3, label: 'held' },
        { at_least: 2, label: 'held at a price' },
        { at_least: 1, label: 'spent badly' },
        { at_least: 0, label: 'given up' },
      ],
    },
    {
      key: 'men',
      label: 'The men',
      question: 'What it cost the people who could not see what you could see.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'withdrew_early', eq: true }, points: 4, note: 'nobody was cut off and nobody broke' },
        { when: { flag: 'withdrew_in_time', eq: true }, points: 3, note: 'you got the rest of them out' },
        { when: { flag: 'reinforced_in_time', eq: true }, points: 3, note: 'the flank held and the men on it are alive because of the order you gave' },
        { when: { flag: 'held_correctly', eq: true }, points: 3, note: 'nothing was lost on the left, because nothing was ever coming at it' },
        { when: { flag: 'held_and_lost_left', eq: true }, points: 0, note: 'about two hundred men on the left found out that nobody was coming' },
        { when: { flag: 'reinforced_late', eq: true }, points: 1, note: 'the reserve arrived where the fighting had already finished' },
      ],
      bands: [
        { at_least: 4, label: 'everybody came back' },
        { at_least: 3, label: 'most of them' },
        { at_least: 1, label: 'a bill somebody else paid' },
        { at_least: 0, label: 'two hundred' },
      ],
    },
    {
      key: 'command',
      label: 'The command',
      question: 'How the division looked at the knoll while you were deciding.',
      min: 0,
      max: 3,
      scoring: [
        { when: { resource: { id: 'doubt', holder: 'you', lt: 3 } }, points: 2, note: 'orders came down from the knoll and nobody had to wonder who was giving them' },
        { when: { resource: { id: 'riders', holder: 'you', gte: 1 } }, points: 1, note: 'you still had a messenger left when it mattered' },
      ],
      bands: [
        { at_least: 3, label: 'in hand' },
        { at_least: 2, label: 'holding' },
        { at_least: 0, label: 'leaderless for twenty-five minutes' },
      ],
    },
    {
      key: 'truth',
      label: 'What you knew',
      question: 'Whether you found out what was actually happening before you committed the reserve.',
      min: -2,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'left_truth', correct: true } }, points: 2, note: 'you found out what was actually happening on the left' },
        { when: { knows: { actor: 'you', fact: 'report_age', correct: true } }, points: 1, note: 'you worked out how old the report you were acting on really was' },
        { when: { knows: { actor: 'you', fact: 'cavalry_truth', correct: true } }, points: 1, note: 'you established that the horse everybody feared could not reach you in time' },
        { when: { knows: { actor: 'you', fact: 'left_truth', correct: false } }, points: -2, note: 'you committed while believing something about the left that was not so' },
      ],
      bands: [
        { at_least: 4, label: 'you knew the field' },
        { at_least: 2, label: 'you found some of it' },
        { at_least: 0, label: 'you moved on what you were handed' },
        { at_least: -2, label: 'you moved on something untrue' },
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
      id: 'act_verify',
      label_left: 'Act On The Report',
      label_right: 'Establish It First',
      measures: 'Whether you moved on what you were handed or spent minutes finding out how old it was.',
    },
    {
      id: 'ground_men',
      label_left: 'Hold The Ground',
      label_right: 'Keep The Men',
      measures: 'Which of the two things you were responsible for you protected when you could not protect both.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['reinforced_in_time', 'reinforced_late'], message: 'the reserve arrived in time or it did not' },
      { flags: ['held_correctly', 'held_and_lost_left'], message: 'the left was coming apart or it was not' },
      { flags: ['withdrew_in_time', 'withdrew_early'], message: 'there was still a flank to lose or there was not' },
    ],
  },

  content_descriptors: {
    depicted: [
      'a Napoleonic-era battle in progress, with casualties referred to and none shown',
      'a commanding officer killed offscreen before the world begins',
      'a decision that will cost lives whichever way it goes',
      'professional argument between officers under fire',
    ],
    discussable: ['men killed and captured offscreen', 'a division in danger', 'artillery', 'a battle already two days old'],
    player_action_bounds: [
      'you may ask, press, read, tell, send a messenger, reinforce the flank, hold the center, or withdraw',
      'you may not harm anyone on this knoll; nobody here can be hurt by you and the world will not resolve an attempt',
      'nobody here is a real person, and no real army, battle or engagement is depicted',
    ],
    intensity: 'strong',
    estimated_minutes: 12,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'That is not a thing this knoll can do in the next twenty minutes.',
    'block.absent': '{name} is not up here. Whatever that was going to be, it waits or it goes down the slope.',
    'block.dead': 'That is past being any use to anyone.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not on this board, and going for it costs minutes you have counted.',
    'block.sealed': '{name} does not open for you, and all three of them would watch you try.',
    'block.no_target': 'Somebody says it before you can. "{verb} {whom}, sir?"',
    'block.broke': 'There is nobody left to send. There were three and you have counted them.',
    'block.short': 'You have {held} of that and not {wanted}, and every officer here can count as well as you.',
    'block.cold': '{name} looks at you the way a man looks at weather coming in. Whatever this is, it costs you first.',
    clarify: 'Say which of us you are addressing. {present} — which?',
    'clarify.2': 'You have to say who, sir, and you have to say what you want of him.',
    'clarify.3': 'Nobody up here can read your mind and the light is getting better every minute. Name one of us, or put your hands on something on that board.',
    'narration.default': 'The knoll resettles around what just happened. Down in the valley the guns keep going.',
    'narration.success': 'It lands. Whatever you were reaching for, some of it is yours now.',
    'narration.partial': 'Half of it lands. The other half is still somewhere on this knoll.',
    'narration.failure': 'It does not land, and the minutes are gone regardless.',
    'narration.backfire': 'It goes wrong in the specific way you were afraid it would.',
    'narration.blocked': 'Nothing about that works, and the knoll lets you know without anybody saying so.',
    'narration.ended': 'It is over. Whatever this is now, it is not a decision any more.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 1 },
};

export default THE_LAST_HOUR;
