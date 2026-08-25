// THE LATE EDITION — the second world.
//
// A deliberate contrast with the first one. No money, no weapons, no exit: the levers
// here are your word, your time, and what you are willing to print without being sure.
// The irreversible act is not naming a person, it is sending a page to a press.
//
// The shape the engine needs, and where it is:
//   - one hidden thing drawn from the seed: where the memo came from (and one of the
//     four answers is "nowhere", so a confident front page is a real risk)
//   - a character who is sincerely wrong and sure of it (the reporter, on the letterhead)
//   - a character who lies for a reason she thinks is good (the deputy, about the source)
//   - a character who is neither, and is protecting himself (the lawyer)
//   - every fact that matters reachable two ways: through a person, and through a thing

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const LATE_EDITION: ScenarioPackage = {
  id: 'ym-late-edition',
  slug: 'late-edition',
  title: 'The Late Edition',
  tagline: 'Forty minutes to press. One photograph. Print it wrong and there is no paper on Monday.',
  format: 'F1',
  genre: 'Newsroom — the forty minutes before a front page is decided. One office, three colleagues, a deadline.',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise: 'A night editor decides whether an unverified document runs on the front page before the presses start.',
    ending_out_of_time:
      'At 11:40 the plant starts the run without hearing from you, and the page that was already set is the page that goes out: a photograph of a school swimming gala, and a hole where the story would have been.',
    setup:
      'You are the night editor of a city daily newspaper. Two hours ago one of your reporters came back with a ' +
      'photograph, taken on her phone, of an internal memo from the city buildings department. If the memo is ' +
      'what it looks like, the deputy mayor ordered a safety inspection report rewritten eleven days before a ' +
      'stairwell in that building came down and killed two people. You have held the front page. The presses ' +
      'start at 11:40. Three people know this memo exists and all three of them are standing in your office.',
    trouble:
      'Your reporter is certain the memo is real and wants it above the fold with her name on it. The paper\'s ' +
      'lawyer wants it killed and will not say plainly why. And the memo arrived through a source that only one ' +
      'person in this room has ever spoken to, who has not said where it came from. Print a forgery and the ' +
      'paper loses the libel case, the masthead, and you. Kill a real one and two people stayed dead for nothing.',
    cold_open:
      'The photograph is face-up on your desk under the lamp and nobody has touched it in four minutes, which is ' +
      'how you know nobody wants to be the one holding it. Nell is standing. Arthur is in the chair by the door ' +
      'with his coat still on. Priya is at the glass, watching the newsroom floor through it.\n\n' +
      'Nell says it without looking away from you. "It is real. I checked the letterhead against a memo from the ' +
      'same department and it matches."',
    example_actions: ['ask Nell how she checked the letterhead', 'read the switchboard log', 'ask Priya where it came from'],
    cast_note:
      'These three people and you are the only ones who have seen the photograph. Nobody upstairs knows it exists yet.',
    clock_label: 'until the presses start',
    house_rules: [
      'Nobody in this room is neutral. One of them is wrong about something and completely sure of it. One of them is protecting somebody and will not tell you who. You cannot tell which by how certain they sound.',
      'Running it ends the night. So does spiking it. Everything before that, you can still take back.',
      'Your word is a currency here. You can promise things to get answers, and the paper is what your promises are worth.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the night editor',
      start_location: 'office',
      you:
        'You run this paper between eight at night and four in the morning, which means tonight the front page ' +
        'is yours and nobody else\'s. The editor-in-chief is somewhere over the Atlantic with her phone off.',
      objective:
        'Decide whether the memo runs on tomorrow\'s front page — and be right about it. Right means knowing ' +
        'what you are printing before you print it, not guessing well.',
      pressure:
        'The presses start in forty minutes. If you have not decided by then the decision is made for you, and ' +
        'the page that is already set is the page that goes out.',
    },
    duration_minutes: 40,
    resources: {
      promises: { label: 'Promises you can still make', holdings: { you: 2 } },
      exposure: { label: 'People outside this room who know', holdings: { you: 0 } },
    },
    flags: { page_status: 'held' },
  },

  locations: [
    {
      id: 'office',
      name: 'the night editor\'s office',
      description:
        'A glass wall onto the newsroom floor, a desk lamp, a wire printer that has been quiet since ten, and a ' +
        'clock that everybody in the room has looked at twice in the last minute.',
      travel_minutes: { floor: 1 },
    },
    {
      id: 'floor',
      name: 'the newsroom floor',
      description:
        'Eleven desks, four of them occupied, and a sub-editor waiting with a page that has a hole in it the ' +
        'size of a decision.',
      travel_minutes: { office: 1 },
    },
  ],

  entities: [
    {
      id: 'photograph',
      name: 'the photograph',
      kind: 'document',
      description:
        'A phone picture of a single sheet of headed paper, taken at an angle, with a thumb in the bottom corner.',
      initial_state: 'on the desk',
      location: 'office',
      searchable: true,
      portable: true,
      body:
        'CITY OF —— · DEPARTMENT OF BUILDINGS AND SAFETY\n' +
        'INTERNAL — NOT FOR CIRCULATION\n\n' +
        '4 April\n\n' +
        'Re: 1200 Halstead Row — stairwell inspection, third revision\n\n' +
        'The finding at item 6 is to be reworded before the report is filed. The building is due to be signed\n' +
        'over on the 15th and item 6 as written will not survive a buyer\'s survey.\n\n' +
        'Handle this at your end. Do not put it in writing again.',
    },
    {
      id: 'log',
      name: 'the switchboard log',
      kind: 'document',
      description: 'The night desk writes down every call that comes in: the time, and where the operator says it came from.',
      initial_state: 'open at tonight\'s page',
      location: 'office',
      searchable: true,
      body:
        '20:41 — city desk, internal\n' +
        '20:58 — caller would not give a name. Operator logged the exchange: a payphone, Halstead Row lobby.\n' +
        '21:12 — the plant, asking about the page\n' +
        '21:40 — number withheld, hung up\n' +
        '22:05 — the plant again',
    },
    {
      id: 'wire',
      name: 'the wire printer',
      kind: 'fixture',
      description: 'It carries what everybody else is moving. It has been quiet all night, which is either good news or the worst news.',
      initial_state: 'idle',
      location: 'office',
      searchable: true,
    },
    {
      id: 'clippings',
      name: 'the clippings file',
      kind: 'document',
      description: 'Forty years of this paper, cut up and filed by subject, including the subjects that are standing in your office.',
      initial_state: 'shelved',
      location: 'office',
      searchable: true,
    },
    {
      id: 'proof',
      name: 'the front-page proof',
      kind: 'document',
      description: 'Tomorrow\'s front page as it currently stands, with a hole in the middle of it and a swimming gala in the corner.',
      initial_state: 'held',
      location: 'office',
      searchable: true,
    },
    {
      id: 'deskphone',
      name: 'the desk phone',
      kind: 'fixture',
      description: 'An outside line. Every call you make on it is a person who did not know about this an hour ago.',
      initial_state: 'on the hook',
      location: 'office',
    },
  ],

  cast: [
    {
      id: 'nell',
      name: 'Nell',
      role: 'the reporter',
      voice:
        'Fast, over-prepared, answers the question you should have asked instead of the one you did. Starts every ' +
        'second sentence with "look—". Talks louder when she is being doubted.',
      motive:
        'Get this on the front page under her own name tonight, because she believes it is true and because she ' +
        'knew one of the two people who died.',
      reliability: 'mistaken',
      competence: 0.6,
      start_location: 'office',
      intro:
        'Your reporter, and the one who brought the photograph in. Three years on the paper, no sleep since ' +
        'yesterday, and she has not sat down since she got back.',
      leverage: 'She has the original photograph on her phone and she is the only one who has met the person who handed it over.',
      starting_disposition: { trust: 30, fear: 20 },
      knows: ['letterhead', 'rival_paper', 'stairwell'],
      fallback_lines: {
        default: 'Look—I am telling you what I checked. Ask me what I checked.',
        pressed: 'You want me to say I am not sure? Fine. Which part would you like me to be unsure about.',
      },
    },
    {
      id: 'arthur',
      name: 'Arthur',
      role: 'the paper\'s lawyer',
      voice:
        'Slow, careful, finishes other people\'s sentences a beat late and slightly differently. Says "as it stands" ' +
        'when he means no.',
      motive:
        'Keep the paper out of a libel court, and keep his own firm\'s other client out of tomorrow\'s newspaper.',
      reliability: 'self_serving',
      competence: 0.8,
      start_location: 'office',
      intro:
        'The paper\'s lawyer, driven in from home at ten o\'clock and still wearing his coat. He has read the ' +
        'photograph twice and taken no notes.',
      leverage: 'He can stop the presses on his own authority, and he is the only one here who has read the paper\'s insurance.',
      starting_disposition: { trust: 0, fear: 10 },
      knows: ['letterhead', 'lawyer_client', 'reporter_tie'],
      fallback_lines: {
        default: 'As it stands, I would not put my name near it. That is not the same as saying it is false.',
        pressed: 'You can raise your voice. It does not change what a jury does with an unnamed source.',
      },
    },
    {
      id: 'priya',
      name: 'Priya',
      role: 'the deputy editor',
      voice:
        'Quiet, exact, leaves a half-second before answering that makes people fill it for her. Twenty-one years ' +
        'of saying less than she knows.',
      motive:
        'Keep a promise she made eleven years ago that a particular person would never be named, even if keeping ' +
        'it costs the paper the biggest story it has had in a decade.',
      reliability: 'deceptive',
      competence: 0.85,
      start_location: 'office',
      intro:
        'Your deputy. Twenty-one years on this paper, eleven of them running the city desk. She took the call ' +
        'that started tonight, and she is the only person here who has ever spoken to the source.',
      leverage: 'She is the only route to the source, and one phone call from her holds the page past the deadline.',
      starting_disposition: { trust: 15, fear: 5 },
      knows: ['memo_origin', 'source_terms', 'plant_deadline', 'lawyer_client'],
      fallback_lines: {
        default: 'I can tell you what I am able to tell you. That is a shorter list than you want it to be.',
        pressed: 'You have known me for six years. Ask yourself whether shouting has ever worked.',
      },
    },
  ],

  facts: [
    {
      id: 'memo_origin',
      statement: 'The memo came from {value}.',
      question: 'where the memo actually came from',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_origin_promised', 'p_origin_corner'],
      required_for_top_outcome: true,
    },
    {
      id: 'letterhead',
      statement: 'The letterhead on the memo is {value}.',
      question: 'whether the letterhead belongs to the date printed on the memo',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_letter_photo', 'p_letter_arthur'],
      required_for_top_outcome: true,
    },
    {
      id: 'call_origin',
      statement: 'The call that brought this in was placed from {value}.',
      question: 'where the source called from',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_call_log', 'p_call_priya'],
      required_for_top_outcome: true,
    },
    {
      id: 'source_terms',
      statement: 'The source handed it over on one condition: {value}.',
      question: 'what was promised to the source',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_terms_priya'],
    },
    {
      id: 'lawyer_client',
      statement: 'The lawyer\'s firm also acts for {value}.',
      question: 'why the lawyer wants this killed',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_client_priya', 'p_client_file'],
    },
    {
      id: 'reporter_tie',
      statement: 'Your reporter {value}.',
      question: 'why your reporter needs this to be true',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_tie_arthur', 'p_tie_file'],
    },
    {
      id: 'rival_paper',
      statement: 'Another paper has been {value} since eight o\'clock.',
      question: 'whether anybody else is chasing the same story',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_rival_wire', 'p_rival_nell'],
    },
    {
      id: 'plant_deadline',
      statement: 'The print plant will hold the page until {value}.',
      question: 'how much later than the deadline you could actually have gone',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_plant_priya'],
    },
    {
      id: 'stairwell',
      statement: 'The two people who died on that stairwell were {value}.',
      question: 'who the two people on the stairwell were',
      category: 'color',
      sensitivity: 'public',
      discoverable_via: ['p_stair_nell'],
    },
  ],

  discovery_paths: [
    // --- memo_origin: bought with your word, or cornered with what you found --
    {
      id: 'p_origin_promised',
      fact: 'memo_origin',
      description: 'Give your deputy your word on the source\'s terms, and ask her again.',
      via_verb: ['ask', 'press'],
      via_target: ['priya'],
      requires: { flag: 'gave_word', eq: true },
      topic_hints: ['where', 'source', 'came', 'origin', 'who', 'handed', 'got', 'from'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.9 },
    },
    {
      id: 'p_origin_free',
      fact: 'memo_origin',
      description: 'Ask your deputy for nothing in return, and take the answer she can afford to give.',
      via_verb: ['ask'],
      via_target: ['priya'],
      requires: { not: { flag: 'gave_word', eq: true } },
      topic_hints: ['where', 'source', 'came', 'origin', 'who', 'handed', 'got', 'from'],
      disclosure: {
        status: 'told',
        value: 'the contractor\'s own filing room',
        confidence: 0.5,
        fidelity: 0.4,
        distortion: 'an answer that costs her nothing and protects the person it needs to',
      },
    },
    {
      id: 'p_origin_corner',
      fact: 'memo_origin',
      description: 'Put the letterhead and the payphone in front of somebody at the same time, and watch which of them stops talking.',
      requires: {
        all: [{ knows: { actor: 'you', fact: 'letterhead' } }, { knows: { actor: 'you', fact: 'call_origin' } }],
      },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },

    // --- letterhead: the hole in the reporter's certainty ---------------------
    {
      id: 'p_letter_photo',
      fact: 'letterhead',
      description: 'Look at the photograph properly, under the lamp, instead of at the person holding it.',
      via_verb: ['read'],
      via_target: ['photograph'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_letter_arthur',
      fact: 'letterhead',
      description: 'Ask the lawyer what he saw the second time he read it.',
      via_verb: ['ask', 'press'],
      via_target: ['arthur'],
      requires: { knows: { actor: 'arthur', fact: 'letterhead' } },
      topic_hints: ['letterhead', 'heading', 'paper', 'header', 'logo', 'checked', 'date', 'dated', 'april', 'march', 'real', 'genuine', 'forged', 'fake'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.85 },
    },
    {
      id: 'p_letter_nell',
      fact: 'letterhead',
      description: 'Ask your reporter what she checked the letterhead against, and listen to the date she gives you.',
      via_verb: ['ask', 'press'],
      via_target: ['nell'],
      requires: { knows: { actor: 'nell', fact: 'letterhead' } },
      topic_hints: ['letterhead', 'heading', 'header', 'checked', 'check', 'compare', 'compared', 'against', 'sure', 'certain', 'how'],
      // She passes on what she holds, which is wrong, and she is completely sure of it.
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8, fidelity: 0.9 },
    },

    // --- call_origin ----------------------------------------------------------
    {
      id: 'p_call_log',
      fact: 'call_origin',
      description: 'Read the switchboard log. The night desk writes down where every call came from.',
      via_verb: ['read'],
      via_target: ['log'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_call_priya',
      fact: 'call_origin',
      description: 'Ask your deputy about the call itself — not who made it, where it came from.',
      via_verb: ['ask', 'press'],
      via_target: ['priya'],
      requires: { knows: { actor: 'priya', fact: 'call_origin' } },
      topic_hints: ['call', 'called', 'phone', 'rang', 'payphone', 'when', 'time', 'where'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },

    // --- the rest -------------------------------------------------------------
    {
      id: 'p_terms_priya',
      fact: 'source_terms',
      description: 'Ask your deputy what she agreed to before any of this reached your desk.',
      via_verb: ['ask', 'press', 'promise'],
      via_target: ['priya'],
      topic_hints: ['terms', 'promise', 'promised', 'condition', 'agreed', 'protect', 'protection', 'name', 'named', 'anonymity', 'want', 'wants', 'wanted', 'asked'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.9 },
    },
    {
      id: 'p_client_priya',
      fact: 'lawyer_client',
      description: 'Ask your deputy why the lawyer is so certain, before you ask the lawyer.',
      via_verb: ['ask', 'press'],
      via_target: ['priya'],
      requires: { knows: { actor: 'priya', fact: 'lawyer_client' } },
      topic_hints: ['arthur', 'lawyer', 'why', 'firm', 'client', 'interest', 'certain'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
    {
      id: 'p_client_file',
      fact: 'lawyer_client',
      description: 'The clippings file has forty years of this city in it, including who acts for whom.',
      via_verb: ['read'],
      via_target: ['clippings'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_tie_arthur',
      fact: 'reporter_tie',
      description: 'Ask the lawyer why he keeps looking at your reporter when he talks about judgment.',
      via_verb: ['ask', 'press'],
      via_target: ['arthur'],
      requires: { knows: { actor: 'arthur', fact: 'reporter_tie' } },
      topic_hints: ['nell', 'reporter', 'why', 'judgment', 'close', 'personal', 'her'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75 },
    },
    {
      id: 'p_tie_file',
      fact: 'reporter_tie',
      description: 'The paper has written about those two deaths already. Read what it printed and who wrote it.',
      via_verb: ['read'],
      via_target: ['clippings'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },
    {
      id: 'p_rival_wire',
      fact: 'rival_paper',
      description: 'Check the wire. If somebody else is moving on this, it will be on it before it is on your desk.',
      via_verb: ['read'],
      via_target: ['wire'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_rival_nell',
      fact: 'rival_paper',
      description: 'Ask your reporter who else has been calling the people she has been calling.',
      via_verb: ['ask', 'press'],
      via_target: ['nell'],
      requires: { knows: { actor: 'nell', fact: 'rival_paper' } },
      topic_hints: ['else', 'anyone', 'other', 'rival', 'paper', 'competition', 'beat', 'first'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8 },
    },
    {
      id: 'p_plant_priya',
      fact: 'plant_deadline',
      description: 'Ask your deputy how long the plant will really hold, as opposed to how long it says it will.',
      via_verb: ['ask', 'press'],
      via_target: ['priya'],
      requires: { knows: { actor: 'priya', fact: 'plant_deadline' } },
      topic_hints: ['plant', 'press', 'presses', 'deadline', 'hold', 'late', 'time', 'long'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.9 },
    },
    {
      id: 'p_stair_nell',
      fact: 'stairwell',
      description: 'Ask your reporter about the two people, rather than about the memo.',
      via_verb: ['ask', 'press'],
      via_target: ['nell'],
      topic_hints: ['died', 'dead', 'killed', 'two', 'people', 'stairwell', 'victims', 'who'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.9 },
    },
  ],

  // --- canonical truth, drawn once from the seed ----------------------------
  truth_template: {
    variables: [
      {
        id: 'origin',
        kind: 'choice',
        // "nowhere" is a real answer. A confident front page is a real risk.
        choices: [
          'an inspector who kept his own copy of everything',
          'somebody inside the deputy mayor\'s own office',
          'the contractor\'s filing room, taken on the way out',
          'nowhere — somebody typed it tonight',
        ],
        weights: [3, 3, 2, 3],
      },
    ],
    facts: {
      memo_origin: { from_variable: 'origin' },
      letterhead: { value: 'the version the department stopped using in March, five weeks before the date on the memo' },
      call_origin: { value: 'a payphone in the lobby of the building that came down' },
      source_terms: { value: 'their name never appears — not in the paper, and not in a courtroom afterward' },
      lawyer_client: { value: 'the construction company named in the memo' },
      reporter_tie: { value: 'went to school with one of the two people who died' },
      rival_paper: { value: 'calling the same three numbers she has' },
      plant_deadline: { value: '11:52, and not one minute past it' },
      stairwell: { value: 'a caretaker and a girl of nineteen who had gone up to find him' },
    },
    bindings: { source: 'origin' },
  },

  // --- who holds what, before the first action ------------------------------
  holds: [
    // The reporter is sincerely wrong about the one thing she is most certain of. She
    // compared the letterhead against a document printed after the change, so it matched.
    {
      actor: 'nell',
      fact: 'letterhead',
      status: 'believed_false',
      value: 'the current one — she checked it against a memo from June and it matched',
      confidence: 0.9,
    },
    // The lawyer saw it and has not said so, because saying so helps him either way.
    { actor: 'arthur', fact: 'letterhead', status: 'observed', value: '@canonical', confidence: 0.9 },
    // The deputy knows exactly where it came from.
    { actor: 'priya', fact: 'memo_origin', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'priya', fact: 'call_origin', status: 'observed', value: '@canonical', confidence: 0.9 },
  ],

  // --- the action space -----------------------------------------------------
  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'check with'],
      description: 'Put a question to somebody in the office.',
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
      aliases: ['press', 'push', 'confront', 'lean on', 'grill', 'demand', 'insist'],
      description: 'Stop being collegiate about a question.',
      default_minutes: 4,
      requires_target: true,
      speech: true,
      base_difficulty: 0.28,
      chip_when: { turns: { gte: 1 } },
      effects_by_outcome: {
        backfire: [
          { kind: 'disposition', actor: '@target', axis: 'trust', delta: -18 },
          { kind: 'disposition', actor: '@target', axis: 'fear', delta: 15 },
        ],
      },
      play_signals: [
        { dimension: 'force_diplomacy', direction: -0.7, strength: 0.8, context: 'You applied pressure rather than waiting for them to come around.' },
        { dimension: 'direct_cunning', direction: -0.5, strength: 0.5, context: 'You made it obvious what you wanted.' },
      ],
    },
    {
      id: 'read',
      label: 'Read',
      aliases: ['read', 'look at', 'look', 'check', 'search', 'open', 'go through', 'examine', 'study'],
      description: 'Put your own eyes on something instead of taking somebody\'s word for it.',
      default_minutes: 4,
      requires_target: true,
      object_verb: true,
      base_difficulty: 0.1,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'solo_coalition', direction: -0.45, strength: 0.5, context: 'You checked it yourself rather than asking anyone.' },
      ],
    },
    {
      id: 'tell',
      label: 'Tell',
      aliases: ['tell', 'warn', 'explain', 'admit', 'show'],
      description: 'Put something you have worked out into the room.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      base_difficulty: 0.05,
      effects_by_outcome: {
        success: [{ kind: 'disposition', actor: '@target', axis: 'trust', delta: 6 }],
      },
      play_signals: [
        { dimension: 'direct_cunning', direction: -0.7, strength: 0.6, context: 'You gave something away rather than holding it.' },
        { dimension: 'solo_coalition', direction: 0.4, strength: 0.45, context: 'You put what you knew into the room.' },
      ],
    },
    {
      id: 'promise',
      label: 'Promise',
      aliases: ['promise', 'guarantee', 'swear', 'assure', 'give my word', 'offer', 'agree'],
      description: 'Put your word on the table. It is the only thing in this room that is actually yours to spend.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      base_difficulty: 0.12,
      chip_when: { resource: { id: 'promises', holder: 'you', gte: 1 } },
      play_signals: [
        { dimension: 'force_diplomacy', direction: 0.75, strength: 0.8, context: 'You gave something of your own instead of demanding.' },
        { dimension: 'preserve_risk', direction: 0.5, strength: 0.6, context: 'You spent your word to get an answer.' },
      ],
    },
    {
      id: 'call',
      label: 'Call',
      aliases: ['call', 'ring', 'phone', 'dial', 'get hold of'],
      description: 'Reach somebody outside this room. Everyone you reach is somebody who did not know an hour ago.',
      default_minutes: 5,
      remote: true,
      requires_target: false,
      base_difficulty: 0.3,
      effects_by_outcome: {
        success: [{ kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 1 }],
        partial: [{ kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 1 }],
        backfire: [{ kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 2 }],
      },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.5, strength: 0.6, context: 'You went outside the room for it.' },
        { dimension: 'preserve_risk', direction: 0.5, strength: 0.5, context: 'You widened the circle to find out more.' },
      ],
    },
    {
      id: 'send',
      label: 'Send out',
      aliases: ['send', 'send out', 'get rid of', 'ask to leave'],
      description: 'Put somebody on the newsroom floor so you can talk without them.',
      default_minutes: 2,
      requires_target: true,
      base_difficulty: 0.2,
      play_signals: [
        { dimension: 'direct_cunning', direction: 0.6, strength: 0.6, context: 'You cleared the room before you said the next thing.' },
        { dimension: 'solo_coalition', direction: -0.5, strength: 0.55, context: 'You narrowed who was in the conversation.' },
      ],
    },
    {
      id: 'hold',
      label: 'Hold',
      aliases: ['wait', 'hold', 'think', 'say nothing', 'sit', 'hold the page', 'do nothing'],
      description: 'Let the room fill the silence and see who does it.',
      default_minutes: 3,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'run',
      label: 'Run it',
      aliases: ['run it', 'run', 'print', 'print it', 'publish', 'go with it', 'front page', 'send it', 'put it on the front'],
      description: 'Send the page to the plant with the story on it.',
      commitment_line:
        'You said run it, and eleven floors down a page went to a plant forty minutes away. Whatever it is, it is a hundred and forty thousand copies of it now.',
      default_minutes: 1,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.1,
      chip_when: { clock: { gte: 6 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.8, strength: 0.9, context: 'You committed to the bolder version of the night.' },
        { dimension: 'preserve_risk', direction: 0.8, strength: 0.8, context: 'You put the paper behind it.' },
      ],
    },
    {
      id: 'spike',
      label: 'Spike it',
      aliases: ['spike', 'spike it', 'kill', 'kill it', 'drop it', 'pull it', 'hold it out', 'do not run', 'don\'t run it'],
      description: 'Kill the story and let the page go out as it stands.',
      commitment_line:
        'You said spike it, and the sub took the hole out of the page and dropped the swimming gala into the middle of it. Whatever the memo was, it is a photograph on a phone again.',
      default_minutes: 1,
      requires_target: false,
      commitment: true,
      base_difficulty: 0.05,
      chip_when: { clock: { gte: 6 } },
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.8, strength: 0.9, context: 'You took the survivable version of the night.' },
        { dimension: 'preserve_risk', direction: -0.7, strength: 0.8, context: 'You protected what you already had.' },
      ],
    },
  ],

  // --- the handful of beats the designer must control (L5) ------------------
  overrides: [
    {
      id: 'o_promise_priya',
      priority: 100,
      when: {
        verb: ['promise'],
        target: ['priya'],
        pred: { resource: { id: 'promises', holder: 'you', gte: 1 } },
      },
      outcome: 'success',
      effects: [
        { kind: 'resource', id: 'promises', from: 'you', to: 'world', amount: 1 },
        { kind: 'flag', id: 'gave_word', value: true },
        { kind: 'disposition', actor: 'priya', axis: 'trust', delta: 25 },
      ],
      play_signals: [
        { dimension: 'force_diplomacy', direction: 0.7, strength: 0.8, context: 'You gave your word rather than leaning on somebody.' },
        { dimension: 'loyalty_opportunism', direction: -0.5, strength: 0.6, context: 'You bound yourself to a promise somebody else had made.' },
      ],
      summary:
        'Priya waits the half-second she always waits. "Then I will hold you to it, and you will not enjoy that." She sits down for the first time all night. "Ask me again."',
    },
    {
      id: 'o_corner',
      priority: 100,
      when: {
        verb: ['press'],
        target: ['nell', 'arthur', 'priya'],
        pred: {
          all: [{ knows: { actor: 'you', fact: 'letterhead' } }, { knows: { actor: 'you', fact: 'call_origin' } }],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'cornered', value: true },
        { kind: 'disposition', actor: '@target', axis: 'fear', delta: 20 },
      ],
      reveals: [{ fact: 'memo_origin', to: 'you', status: 'observed', via: 'p_origin_corner' }],
      play_signals: [
        { dimension: 'force_diplomacy', direction: -0.6, strength: 0.7, context: 'You used what you had found as leverage the moment you had it.' },
        { dimension: 'caution_boldness', direction: -0.3, strength: 0.4, context: 'You made sure before you moved.' },
      ],
      summary:
        'You put the March letterhead and the lobby payphone on the desk side by side and let the sentence finish itself. Nobody in the room says the next thing quickly enough, and in the pause the answer arrives on its own.',
    },
    {
      id: 'o_run',
      priority: 100,
      when: { verb: ['run'] },
      outcome: 'from_truth',
      truth_match: { fact: 'memo_origin', equals: 'nowhere — somebody typed it tonight' },
      // MATCHED means the memo was made up and you printed it anyway.
      effects: [
        { kind: 'flag', id: 'printed', value: true },
        { kind: 'flag', id: 'printed_forgery', value: true },
        { kind: 'flag', id: 'page_status', value: 'gone' },
      ],
      summary:
        'The page goes. Somewhere in the next four hours a hundred and forty thousand copies of a document that nobody ever wrote come off a press with your paper\'s name across the top of them.',
      effects_else: [
        { kind: 'flag', id: 'printed', value: true },
        { kind: 'flag', id: 'printed_true', value: true },
        { kind: 'flag', id: 'page_status', value: 'gone' },
      ],
      summary_else:
        'The page goes. Whatever else is true about tonight, the thing on the front of it happened, and by six in the morning it will have happened in public.',
      play_signals: [
        { dimension: 'caution_boldness', direction: 0.8, strength: 0.9, context: 'You printed it.' },
      ],
    },
    {
      id: 'o_spike',
      priority: 100,
      when: { verb: ['spike'] },
      outcome: 'from_truth',
      truth_match: { fact: 'memo_origin', equals: 'nowhere — somebody typed it tonight' },
      // MATCHED means it was a forgery and you caught it.
      effects: [
        { kind: 'flag', id: 'spiked', value: true },
        { kind: 'flag', id: 'spiked_forgery', value: true },
        { kind: 'flag', id: 'page_status', value: 'gone' },
      ],
      summary:
        'You kill it. The room goes quiet in the particular way a room goes quiet when somebody has just been overruled, and the page goes out with a swimming gala on it.',
      effects_else: [
        { kind: 'flag', id: 'spiked', value: true },
        { kind: 'flag', id: 'spiked_true', value: true },
        { kind: 'flag', id: 'page_status', value: 'gone' },
      ],
      summary_else:
        'You kill it. The room goes quiet in the particular way a room goes quiet when somebody has just been overruled, and the page goes out with a swimming gala on it.',
      play_signals: [
        { dimension: 'caution_boldness', direction: -0.8, strength: 0.9, context: 'You spiked it.' },
      ],
    },
  ],

  // --- the Director's library ------------------------------------------------
  injects: [
    {
      id: 'i_nell_threatens',
      kind: 'pressure',
      when: { all: [{ disposition: { actor: 'nell', axis: 'trust', lt: 10 } }, { turns: { gte: 2 } }] },
      once: true,
      actor: 'nell',
      actor_type: 'character',
      verb: 'threatens',
      demands_response: true,
      effects: [
        { kind: 'disposition', actor: 'nell', axis: 'fear', delta: 10 },
        { kind: 'flag', id: 'nell_edge', value: true },
      ],
      line: 'Nell picks her phone up off the desk. "If this paper will not run it, there are three that will, and I will be at one of them by Thursday."',
      summary: 'Nell threatens to take the story elsewhere.',
    },
    {
      id: 'i_plant_calls',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      min_clock: 6,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'plant_calls',
      effects: [{ kind: 'flag', id: 'plant_called', value: true }],
      line: 'The desk phone rings twice and stops. Through the glass, the sub picks it up on the floor and looks straight through the wall at you while he listens.',
      summary: 'The print plant calls in for the page.',
    },
    {
      id: 'i_priya_price',
      kind: 'reveal',
      when: {
        all: [
          { turns: { gte: 3 } },
          { not: { flag: 'gave_word', eq: true } },
          { not: { knows: { actor: 'you', fact: 'memo_origin' } } },
        ],
      },
      once: true,
      actor: 'priya',
      actor_type: 'character',
      verb: 'price',
      demands_response: true,
      effects: [],
      line: 'Priya turns away from the glass. "I can tell you where it came from. I am not going to do it for nothing, and what I want is not a favor — it is a condition somebody was given before you were involved."',
      summary: 'Priya signals that what she knows has a price, and that the price is a promise.',
    },
    {
      id: 'i_wire_moves',
      kind: 'pressure',
      when: { always: true },
      min_clock: 16,
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'wire_moves',
      effects: [
        { kind: 'flag', id: 'wire_moved', value: true },
        { kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 1 },
      ],
      line: 'The wire printer wakes up and runs four lines: another paper is asking the deputy mayor\'s office to comment on a document it has not described. Then it stops.',
      summary: 'The wire shows somebody else circling the same story.',
    },
    {
      id: 'i_letterhead_reversal',
      kind: 'reversal',
      when: { all: [{ clock: { gte: 18 } }, { not: { knows: { actor: 'you', fact: 'letterhead' } } }] },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'lamp',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'letterhead',
          status: 'observed',
          value: '@canonical',
          source: 'observation',
          fidelity: 1,
          confidence: 0.95,
        },
      ],
      line:
        'You move the photograph under the lamp to get the glare off it and the heading comes up sharp for the first time: the old city crest, the one that came off every department\'s paper in March when they went to the new one. The memo is dated the fourth of April.',
      summary: 'The letterhead is revealed as the wrong one for the date — the hole in the reporter\'s certainty.',
    },
    {
      id: 'i_arthur_recovery',
      kind: 'recovery',
      when: {
        all: [
          { pressure: { gte: 0.6 } },
          { turns: { gte: 4 } },
          { not: { knows: { actor: 'you', fact: 'call_origin' } } },
        ],
      },
      once: true,
      is_rescue: true,
      actor: 'arthur',
      actor_type: 'character',
      verb: 'offers_call',
      effects: [
        {
          kind: 'knowledge',
          actor: 'you',
          fact: 'call_origin',
          status: 'told',
          value: '@canonical',
          source: 'arthur',
          fidelity: 1,
          confidence: 0.8,
        },
      ],
      line:
        'Arthur speaks without getting up. "Your switchboard writes down where calls come from. Tonight\'s came from a payphone in the lobby of the building that fell down. I have been sitting here for twenty minutes deciding whether that helps you or frightens you, and I have decided it is not my decision."',
      summary: 'Arthur surfaces where the call came from — information that was in the switchboard log all along.',
    },
  ],

  // --- what the world does on its own ---------------------------------------
  processes: [
    {
      id: 'w_nell_goes',
      kind: 'actor',
      actor: 'nell',
      trigger: { when: { all: [{ flag: 'nell_edge', eq: true }, { clock: { gte: 26 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'position', entity: 'nell', location: 'floor' },
      ],
      line: 'Nell goes out onto the floor with her phone against her ear and does not shut the door behind her.',
      summary: 'Nell leaves the office for the newsroom floor.',
    },
    {
      id: 'w_exposure_drift',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 11, when: { clock: { gte: 11 } } },
      effects: [{ kind: 'resource', id: 'exposure', from: 'world', to: 'you', amount: 1 }],
      line: 'Out on the floor somebody says the words "deputy mayor" loudly enough to carry through the glass.',
      summary: 'The story spreads a little further inside the building.',
    },
  ],

  // --- outcome: four axes that move independently ---------------------------
  outcome_dimensions: [
    {
      key: 'page',
      label: 'The page',
      question: 'What actually went out on the front of tomorrow\'s paper.',
      min: 0,
      max: 3,
      scoring: [
        { when: { flag: 'printed_true', eq: true }, points: 3, note: 'a true story ran on the front page' },
        { when: { flag: 'spiked_forgery', eq: true }, points: 2, note: 'you kept a fake off the front page' },
        { when: { flag: 'spiked_true', eq: true }, points: 1, note: 'a true story did not run' },
        { when: { flag: 'printed_forgery', eq: true }, points: 0, note: 'you printed something nobody ever wrote' },
      ],
      bands: [
        { at_least: 3, label: 'it ran, and it was true' },
        { at_least: 2, label: 'you caught it' },
        { at_least: 1, label: 'it died on your desk' },
        { at_least: 0, label: 'you printed a forgery' },
      ],
    },
    {
      key: 'paper',
      label: 'The paper',
      question: 'Whether this masthead is in a courtroom next month.',
      min: 0,
      max: 4,
      scoring: [
        { when: { not: { flag: 'printed_forgery', eq: true } }, points: 2, note: 'nothing you printed can be shown to be false' },
        { when: { resource: { id: 'exposure', holder: 'you', lt: 2 } }, points: 1, note: 'this stayed inside the building' },
        { when: { disposition: { actor: 'arthur', axis: 'trust', gte: 0 } }, points: 1, note: 'your lawyer will still take your calls' },
      ],
      bands: [
        { at_least: 4, label: 'standing' },
        { at_least: 2, label: 'exposed' },
        { at_least: 0, label: 'finished' },
      ],
    },
    {
      key: 'word',
      label: 'Your word',
      question: 'What your promises were worth by the end of the night.',
      min: 0,
      max: 3,
      scoring: [
        { when: { resource: { id: 'promises', holder: 'you', gte: 2 } }, points: 3, note: 'you got there without promising anybody anything' },
        { when: { all: [{ flag: 'gave_word', eq: true }, { not: { flag: 'printed_forgery', eq: true } }] }, points: 2, note: 'you gave your word and the paper can still keep it' },
        { when: { all: [{ flag: 'gave_word', eq: true }, { flag: 'printed_forgery', eq: true }] }, points: 0, note: 'you gave your word and then made it worthless' },
      ],
      bands: [
        { at_least: 3, label: 'unspent' },
        { at_least: 2, label: 'given, and good' },
        { at_least: 0, label: 'spent badly' },
      ],
    },
    {
      key: 'truth',
      label: 'The truth',
      question: 'Whether you knew what you were printing before you printed it.',
      min: -2,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'memo_origin', correct: true } }, points: 2, note: 'you found out where it actually came from' },
        { when: { all: [{ knows: { actor: 'you', fact: 'memo_origin', correct: true } }, { flag: 'page_status', eq: 'gone' }] }, points: 2, note: 'and you decided with it in front of you' },
        { when: { knows: { actor: 'you', fact: 'memo_origin', correct: false } }, points: -1, note: 'you believed something about where it came from that was not so' },
        { when: { flag: 'printed_forgery', eq: true }, points: -2, note: 'you went to press on something that was never real' },
      ],
      bands: [
        { at_least: 4, label: 'you knew, and you moved' },
        { at_least: 2, label: 'you found out' },
        { at_least: 0, label: 'you decided without knowing' },
        { at_least: -2, label: 'you were wrong in a hundred and forty thousand copies' },
      ],
    },
  ],

  // Forty minutes in one office cannot test everything. A dimension this world never puts
  // in front of you is reported as untested rather than guessed at.
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
      id: 'protect_publish',
      label_left: 'Protect the Source',
      label_right: 'Publish Anyway',
      measures: 'Whether a promise somebody else made was a thing you kept or a thing you worked around.',
    },
    {
      id: 'verify_defer',
      label_left: 'Check It Yourself',
      label_right: 'Trust Your People',
      measures: 'Whether you went to the documents or took the word of the person who brought them.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['printed', 'spiked'], message: 'a page runs or it does not; it cannot do both' },
      { flags: ['printed_forgery', 'printed_true'], message: 'what was printed was real or it was not, never both' },
    ],
    forbidden: [
      {
        id: 'word_given_without_spending',
        when: { all: [{ flag: 'gave_word', eq: true }, { resource: { id: 'promises', holder: 'you', gte: 2 } }] },
        message: 'a promise cannot be given without costing one',
      },
    ],
  },

  content_descriptors: {
    depicted: [
      'the aftermath of a fatal building collapse, discussed and never shown',
      'professional and legal pressure between colleagues',
      'a promise of anonymity used as leverage',
      'the possibility of a deliberately forged document',
    ],
    discussable: ['two deaths that have already happened, offscreen', 'libel and legal exposure', 'municipal corruption', 'a source who cannot be named'],
    player_action_bounds: [
      'you may question, press, promise, read, telephone, send somebody out, print, or kill the story',
      'you may not harm anyone; nobody in this world can be hurt and the world will not resolve an attempt',
      'nobody in this office is a real person, and no real city, newspaper or death is depicted',
    ],
    intensity: 'moderate',
    estimated_minutes: 14,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'That is not a thing this office will let you do at this hour.',
    'block.absent': '{name} is not in the office. Whatever that was going to be, it waits or it goes out to the floor.',
    'block.dead': 'That is past being any use to anyone.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not on this desk, and going to get it is its own decision.',
    'block.sealed': '{name} does not open for you — not quietly, and not without somebody noticing.',
    'block.no_target': 'Somebody says it before you can. "{verb} {whom}?"',
    'block.broke': 'You have nothing like that left to give. Everybody in this room knows exactly what you have already spent.',
    'block.short': 'You have {held} of that, not {wanted}, and three people are watching you do the arithmetic.',
    'block.cold': '{name} looks at you the way you look at a press release. Whatever this is, it costs you something first.',
    clarify: 'Say who you are talking to. {present} — which one?',
    'clarify.2': 'You have to say who, and you have to say what you want out of them.',
    'clarify.3': 'Nobody in here can read your mind and the plant is not waiting. Name one of us, or put your hands on something on that desk.',
    'narration.default': 'The office resettles around what just happened. Through the glass, nobody on the floor looks up.',
    'narration.success': 'It lands. Whatever you were reaching for, some of it is yours now.',
    'narration.partial': 'Half of it lands. The other half is still somewhere in this room.',
    'narration.failure': 'It does not land, and the minute is gone regardless.',
    'narration.backfire': 'It goes wrong in the specific way you were afraid it would.',
    'narration.blocked': 'Nothing about that works, and the room lets you know without anybody having to say it.',
    'narration.ended': 'It is over. Whatever this is now, it is not a decision any more.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 2 },
};

export default LATE_EDITION;
