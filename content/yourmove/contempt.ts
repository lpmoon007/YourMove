// CONTEMPT — the second world on the Press & Exposure shelf.
//
// The Late Edition asks whether to print something. This one is the other end of the same
// nerve: it is already printed, and a judge wants the name of the person who handed it
// over. Nothing here is about whether the story was worth running. It is about what a
// promise is worth once keeping it costs something.
//
// The shape the engine needs, and where it is:
//   - one hidden thing drawn from the seed: who the source actually was (and one of the
//     four answers means somebody put a page in front of you that nobody ever filed)
//   - a character who is sincerely wrong and sure of it (the editor, on what the offer covers)
//   - a character who lies for a reason he is being paid for (the man who made the introduction)
//   - a character who is neither, and is steering you toward the door his firm prefers
//   - every fact that matters reachable two ways: through a person, and through a paper

import { SCHEMA_VERSION, type ScenarioPackage } from '@/lib/aw/package';

export const CONTEMPT: ScenarioPackage = {
  id: 'ym-contempt',
  slug: 'contempt',
  title: 'Contempt',
  tagline: 'You promised somebody their name would never come up. In twenty minutes a judge asks you for it again.',
  format: 'F1',
  genre: 'Press — a witness room off a courtroom, twenty minutes before a judge asks the question a second time.',
  category: 'Press & Exposure',
  schema_version: SCHEMA_VERSION,
  content_version: '1.0.0',

  world: {
    premise:
      'A reporter under a court order to name a confidential source decides, in the twenty minutes before the ' +
      'hearing resumes, whether to give the name, refuse it again, or take the story back.',
    ending_out_of_time:
      'The clerk opens the door and says your name, and you walk back in with whatever you had worked out by ' +
      'then, which is what you say.',
    setup:
      'Eleven weeks ago you published four pages of an internal memorandum showing that a senior official at ' +
      'the state buildings authority steered a maintenance contract to a company that had paid for his ' +
      'daughter\'s wedding. He has not sued. Instead a grand jury was convened, and its prosecutor wants to ' +
      'know who inside that authority gave you the pages. This morning a judge ordered you to say. You ' +
      'declined, and he sent everyone out for twenty minutes so that you could think about it. You are in ' +
      'the witness room off the corridor with three people who all want something different from you, and ' +
      'the person whose name is being asked for is not one of them.',
    trouble:
      'You promised that person their name would never come up. Your lawyer has an offer on the table that ' +
      'he says makes this go away. Your editor says the paper is behind you and does not entirely know what ' +
      'she is talking about. And the man who put you and your source in the same room in the first place has ' +
      'been standing by the window for ten minutes not saying anything at all, which is not like him.',
    cold_open:
      'The witness room has a table, four chairs, a jug of water nobody has touched, and a door with a glass ' +
      'panel that the clerk keeps walking past. Your four pages are on the table in a plastic sleeve because ' +
      'they are an exhibit now. Halloran has the prosecutor\'s offer in front of him and has turned it around ' +
      'so it faces you. Ines is standing. Teague is at the window with his back to the room.\n\n' +
      'Halloran taps the offer twice without looking up. "Twenty minutes. He does not have to give you twenty ' +
      'minutes and he did, which tells you what he wants."',
    example_actions: [
      'ask Halloran what the offer actually covers',
      'read the prosecutor\'s offer',
      'ask Teague who put him on to the source',
    ],
    cast_note:
      'Your lawyer, your editor, and the man who introduced you to your source. The source is not here and cannot be reached.',
    clock_label: 'before the hearing resumes',
    house_rules: [
      'Everybody in this room is telling you the version of it that suits them, and one of them does not know that is what he is doing. One is sincerely wrong about the most important sentence on the table. One is being paid, and has been since before you met him.',
      'Giving the name ends it. So does refusing again, and so does taking the story back. Everything before that, you can still take back.',
      'You have two calls and a phone on the wall. Everyone you reach is one more person who knows.',
    ],
    player: {
      id: 'you',
      name: 'You',
      role: 'the reporter',
      start_location: 'room',
      you:
        'You are the reporter who published the story, which means you are the only person in this building ' +
        'who knows the answer to the question the court is asking. You have done this work for fourteen years ' +
        'and have never been asked for a name in a room with a stenographer in it.',
      objective:
        'Decide what you say when that door opens — and know what you are actually choosing between before ' +
        'you choose. What the offer really covers, what refusing really costs, and who it is you have spent ' +
        'eleven weeks protecting.',
      pressure:
        'The clerk has walked past the glass panel twice. Your lawyer wants an answer before you go back in, ' +
        'and he wants it to be the one on the paper in front of you.',
    },
    duration_minutes: 20,
    resources: {
      calls: { label: 'Calls you can still make', holdings: { you: 2 } },
      known: { label: 'People outside this room who know what you know', holdings: { you: 0 } },
    },
    flags: { answer: 'unsaid' },

    opening: {
      prompt:
        'You are a reporter. Eleven weeks ago you published four pages of a memorandum showing a state official ' +
        'steered a contract to a company that had paid for his daughter\'s wedding. This morning a judge ordered ' +
        'you to name the person inside that office who gave you the pages. You said no, and he has given you ' +
        'twenty minutes to think about it. You promised that person their name would never come up.',
      choices: [
        {
          id: 'offer',
          label: 'Read what is actually being offered',
          preview:
            'Your lawyer has turned the prosecutor\'s offer around so it faces you and told you what it says. It is two pages long and you have not read the second one.',
          move: 'read the prosecutor\'s offer',
        },
        {
          id: 'cost',
          label: 'Ask what refusing actually costs',
          preview:
            'You have been carrying a number in your head all morning because somebody gave it to you. Nobody has shown you where it came from.',
          move: 'ask Halloran how long the judge can hold me',
        },
        {
          id: 'broker',
          label: 'Ask who put him on to your source',
          preview:
            'A man you have known for years arranged the meeting that started all of this, and he has been facing the window for ten minutes.',
          move: 'ask Teague who put him on to the source',
        },
      ],
    },
  },

  locations: [
    {
      id: 'room',
      name: 'the witness room',
      description:
        'A table, four chairs, a jug of water, and a door with a glass panel. Everything that matters this ' +
        'morning is on the table or standing beside it.',
      travel_minutes: { corridor: 1 },
    },
    {
      id: 'corridor',
      name: 'the corridor outside',
      description: 'Benches, a payphone nobody has used since the building got desks, and the courtroom door.',
      travel_minutes: { room: 1 },
    },
  ],

  entities: [
    {
      id: 'offer',
      name: "the prosecutor's offer",
      kind: 'document',
      description: 'Two pages, stapled, turned around to face you. Your lawyer has read it and told you what it says.',
      initial_state: 'on the table',
      location: 'room',
      searchable: true,
      portable: true,
      body:
        'IN RE: GRAND JURY, MARCH TERM\n\n' +
        '1. The witness shall identify the person who provided the four pages published on the 14th.\n\n' +
        '2. Upon compliance the citation for contempt is withdrawn.\n\n' +
        '3. The witness shall further make himself available to this office for deposition in the matters\n' +
        '   docketed 91-114, 91-118 and 91-131, on the same terms, at dates to be fixed.\n\n' +
        '4. Nothing herein limits the term of paragraph 3.',
    },
    {
      id: 'pages',
      name: 'the four pages',
      kind: 'document',
      description:
        'What you published, in a plastic sleeve, because they stopped being your notes and became an exhibit.',
      initial_state: 'sleeved',
      location: 'room',
      searchable: true,
      body:
        'STATE BUILDINGS AUTHORITY — INTERNAL MEMORANDUM\n\n' +
        'p.1  [registry stamp 4417]  Award recommendation, Halstead maintenance, revised.\n' +
        'p.2  [registry stamp 4418]  Comparison of the two remaining tenders.\n' +
        'p.3  [registry stamp 4419]  "Proceed on the revised basis discussed."\n' +
        'p.4  [no stamp]             The sentence everybody quoted. Nobody has asked about the margin.',
    },
    {
      id: 'transcript',
      name: "this morning's transcript",
      kind: 'document',
      description: 'The stenographer\'s tape of the first half hour, run off for your lawyer at his request.',
      initial_state: 'unread',
      location: 'room',
      searchable: true,
      body:
        'THE COURT: You understand I can commit you.\n' +
        'THE WITNESS: I understand that.\n' +
        'THE COURT: Not indefinitely. This grand jury sits until the term ends and I have no power over you\n' +
        '           for one day longer than it does. Mr Halloran has that date and I assume he has given it\n' +
        '           to you. Twenty minutes.',
    },
    {
      id: 'notebook',
      name: 'your notebook',
      kind: 'document',
      description: 'The one from March. Dates, times, a phone number with no name against it, and what you said you would do.',
      initial_state: 'in your coat',
      location: 'room',
      searchable: true,
      portable: true,
    },
    {
      id: 'phone',
      name: 'the phone on the wall',
      kind: 'fixture',
      description: 'An internal line with an outside dial. Every call you make on it is somebody who did not know an hour ago.',
      initial_state: 'on the hook',
      location: 'room',
    },
    {
      id: 'door',
      name: 'the door',
      kind: 'fixture',
      description: 'A glass panel, and the clerk going past it slightly more often than he needs to.',
      initial_state: 'shut',
      location: 'room',
      searchable: true,
    },
  ],

  cast: [
    {
      id: 'halloran',
      name: 'Halloran',
      role: 'your lawyer',
      voice:
        'Warm, fast, uses your first name at the start of sentences he wants you to agree with. Says "realistically" ' +
        'when he is about to leave something out.',
      motive:
        'Get you to sign the offer and get everybody out of this building, partly because he believes it is the ' +
        'right advice and partly because his firm would rather this matter stopped where it is.',
      reliability: 'self_serving',
      competence: 0.85,
      start_location: 'room',
      intro:
        'The lawyer the paper retained for you, eleven weeks ago, and the only person here who has been in this ' +
        'courtroom before. He has the offer in front of him and has already turned it around.',
      leverage: 'He is the only person here who can speak for you in that room, and the only one who has read the second page of the offer.',
      starting_disposition: { trust: 25, fear: 0 },
      knows: ['sentence_real', 'deal_terms', 'halloran_client'],
      fallback_lines: {
        default: 'Realistically, the question in front of you is not the one you keep asking me.',
        pressed: 'You can be angry with me at four o\'clock. At half past two you need advice, and this is it.',
      },
    },
    {
      id: 'ines',
      name: 'Ines',
      role: 'your editor',
      voice:
        'Direct, short sentences, repeats the last three words of yours when she disagrees. Has been up since five.',
      motive:
        'Keep the story standing and keep her reporter out of a cell, in that order, and she does not believe ' +
        'she will have to choose.',
      reliability: 'mistaken',
      competence: 0.65,
      start_location: 'room',
      intro:
        'The editor who ran the story, who has driven down twice this week and has not sat down since she got here.',
      leverage: 'She decides what the paper prints tomorrow, including a retraction, and she has the desk on the phone whenever she wants it.',
      starting_disposition: { trust: 40, fear: 15 },
      knows: ['deal_terms', 'second_reporter'],
      fallback_lines: {
        default: 'We ran it because it was right. Nothing since Tuesday has made it less right.',
        pressed: 'Do not do that. I have been on your side of this since the first phone call and you know it.',
      },
    },
    {
      id: 'teague',
      name: 'Teague',
      role: 'the man who made the introduction',
      voice:
        'Amiable, deflecting, answers a question with a story about somebody else. Goes very quiet and very short ' +
        'when the story stops working.',
      motive:
        'Keep his own part in this out of the room, because he was paid to make an introduction and has spent ' +
        'eleven weeks hoping nobody ever asks who by.',
      reliability: 'deceptive',
      competence: 0.7,
      start_location: 'room',
      intro:
        'A reporter you came up with, who left the trade four years ago and now arranges things. He set up the ' +
        'meeting in March and he has been at the window since you got here.',
      leverage: 'He is the only person in this building who knows both who your source is and who wanted you to have them.',
      starting_disposition: { trust: 20, fear: 25 },
      knows: ['source_truth', 'broker_stake', 'second_reporter'],
      fallback_lines: {
        default: 'I made an introduction. What the two of you did after that is not something I was in the room for.',
        pressed: 'You have known me nineteen years. Think about what you are about to say to me in front of your lawyer.',
      },
    },
  ],

  facts: [
    {
      id: 'source_truth',
      statement: 'The person who gave you the four pages was {value}.',
      question: 'who your source actually was',
      category: 'core',
      sensitivity: 'hidden',
      discoverable_via: ['p_source_paid', 'p_source_corner'],
      required_for_top_outcome: true,
    },
    {
      id: 'page_four',
      statement: 'The fourth page — the one everybody quoted — is {value}.',
      question: 'whether all four pages came out of that office',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_page_pages', 'p_page_ines'],
      required_for_top_outcome: true,
    },
    {
      id: 'deal_terms',
      statement: 'What signing the offer actually commits you to is {value}.',
      question: 'what the offer on the table actually covers',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_deal_offer', 'p_deal_halloran'],
      required_for_top_outcome: true,
    },
    {
      id: 'sentence_real',
      statement: 'If you refuse a second time the judge can hold you {value}.',
      question: 'how long refusing again would actually cost you',
      category: 'core',
      sensitivity: 'discoverable',
      discoverable_via: ['p_sentence_transcript', 'p_sentence_halloran'],
      required_for_top_outcome: true,
    },
    {
      id: 'broker_stake',
      statement: 'The introduction in March was arranged {value}.',
      question: 'why the man who introduced you did it',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_broker_notebook', 'p_broker_teague'],
    },
    {
      id: 'second_reporter',
      statement: 'The same four pages were also given to {value}.',
      question: 'whether you were the only one offered this story',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_second_ines', 'p_second_notebook'],
    },
    {
      id: 'halloran_client',
      statement: "Your lawyer's firm also acts for {value}.",
      question: 'whether your own lawyer has a stake in how this ends',
      category: 'supporting',
      sensitivity: 'discoverable',
      discoverable_via: ['p_client_halloran', 'p_client_ines'],
    },
  ],

  discovery_paths: [
    // --- source_truth: bought, worked out, or guessed at for free -------------
    {
      id: 'p_source_free',
      fact: 'source_truth',
      description: 'Ask the man who made the introduction, while he still thinks nobody is going to ask him why.',
      via_verb: ['ask'],
      via_target: ['teague'],
      requires: { not: { knows: { actor: 'you', fact: 'broker_stake' } } },
      topic_hints: ['who', 'source', 'name', 'gave', 'handed', 'clerk', 'them', 'person'],
      disclosure: {
        status: 'told',
        value: 'a contracts clerk nineteen years in that office, who expected nothing and asked for nothing',
        confidence: 0.5,
        fidelity: 0.4,
        distortion: 'the version he has been giving since March, which costs him nothing to keep giving',
      },
    },
    {
      id: 'p_source_paid',
      fact: 'source_truth',
      description: 'Put the invoice to him. A man explaining who paid him stops being able to protect who paid him.',
      via_verb: ['ask', 'press'],
      via_target: ['teague'],
      requires: { knows: { actor: 'you', fact: 'broker_stake' } },
      topic_hints: ['who', 'source', 'name', 'gave', 'handed', 'really', 'actually', 'person'],
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.9 },
    },
    {
      id: 'p_source_corner',
      fact: 'source_truth',
      description: 'An unstamped page and a second reporter with the same envelope are two halves of one answer.',
      requires: {
        all: [
          { knows: { actor: 'you', fact: 'page_four', correct: true } },
          { knows: { actor: 'you', fact: 'second_reporter' } },
        ],
      },
      disclosure: { status: 'observed', value: '@canonical', confidence: 0.95 },
    },

    // --- page_four: the editor's sincere certainty ----------------------------
    {
      id: 'p_page_pages',
      fact: 'page_four',
      description: 'Look at the exhibit itself rather than at what you remember publishing.',
      via_verb: ['read'],
      via_target: ['pages'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_page_ines',
      fact: 'page_four',
      description: 'Ask your editor how the pages were checked before they ran.',
      via_verb: ['ask', 'press'],
      via_target: ['ines'],
      topic_hints: ['page', 'pages', 'stamp', 'checked', 'authenticated', 'verify', 'verified', 'fourth', 'four', 'genuine', 'real'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.7, fidelity: 0.8 },
    },

    // --- deal_terms: the sentence on the second page --------------------------
    {
      id: 'p_deal_offer',
      fact: 'deal_terms',
      description: 'Read the offer yourself, including the paragraph after the one your lawyer read out.',
      via_verb: ['read'],
      via_target: ['offer'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_deal_halloran',
      fact: 'deal_terms',
      description: 'Make your lawyer say what the offer covers rather than what it withdraws.',
      via_verb: ['ask', 'press'],
      via_target: ['halloran'],
      requires: { knows: { actor: 'halloran', fact: 'deal_terms' } },
      topic_hints: ['offer', 'covers', 'terms', 'sign', 'signing', 'deal', 'deposition', 'matters', 'else', 'what'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75, fidelity: 0.85 },
    },

    // --- sentence_real: the number you have been carrying ---------------------
    {
      id: 'p_sentence_transcript',
      fact: 'sentence_real',
      description: 'The judge said it out loud this morning and it is on the tape.',
      via_verb: ['read'],
      via_target: ['transcript'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.95 },
    },
    {
      id: 'p_sentence_halloran',
      fact: 'sentence_real',
      description: 'Ask your lawyer where the number he gave you came from.',
      via_verb: ['ask', 'press'],
      via_target: ['halloran'],
      topic_hints: ['long', 'how', 'hold', 'jail', 'months', 'weeks', 'days', 'term', 'contempt', 'commit'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.8, fidelity: 0.6 },
    },

    // --- broker_stake ---------------------------------------------------------
    {
      id: 'p_broker_notebook',
      fact: 'broker_stake',
      description: 'Your own notebook from March, and the number you wrote down without a name against it.',
      via_verb: ['read'],
      via_target: ['notebook'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.9 },
    },
    {
      id: 'p_broker_teague',
      fact: 'broker_stake',
      description: 'Ask him who put him on to it, which is a different question from who the source is.',
      via_verb: ['ask', 'press'],
      via_target: ['teague'],
      requires: { knows: { actor: 'teague', fact: 'broker_stake' } },
      topic_hints: ['why', 'put', 'onto', 'paid', 'arranged', 'introduction', 'introduced', 'asked', 'favor', 'favour'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.6, fidelity: 0.7 },
    },

    // --- second_reporter ------------------------------------------------------
    {
      id: 'p_second_ines',
      fact: 'second_reporter',
      description: 'Your editor heard about it on the ring-round and thought nothing of it at the time.',
      via_verb: ['ask', 'press'],
      via_target: ['ines'],
      requires: { knows: { actor: 'ines', fact: 'second_reporter' } },
      topic_hints: ['else', 'anyone', 'other', 'shopped', 'offered', 'first', 'exclusive', 'wire', 'only'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.75 },
    },
    {
      id: 'p_second_notebook',
      fact: 'second_reporter',
      description: 'A note to yourself in April that you never followed up.',
      via_verb: ['read'],
      via_target: ['notebook'],
      disclosure: { status: 'observed', value: '@canonical', source: 'observation', confidence: 0.85 },
    },

    // --- halloran_client ------------------------------------------------------
    {
      id: 'p_client_halloran',
      fact: 'halloran_client',
      description: 'Ask your own lawyer who else his firm acts for, in front of two witnesses.',
      via_verb: ['ask', 'press'],
      via_target: ['halloran'],
      topic_hints: ['firm', 'client', 'clients', 'acts', 'conflict', 'interest', 'else', 'who'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.65, fidelity: 0.8 },
    },
    {
      id: 'p_client_ines',
      fact: 'halloran_client',
      description: 'Your editor signed the retainer and read the conflicts letter without reading it.',
      via_verb: ['ask', 'press'],
      via_target: ['ines'],
      topic_hints: ['halloran', 'lawyer', 'firm', 'retainer', 'conflict', 'trust', 'hired', 'why'],
      disclosure: { status: 'told', value: '@holder_belief', confidence: 0.6 },
    },
  ],

  truth_template: {
    variables: [
      {
        id: 'source',
        kind: 'choice',
        // The fourth answer means the story you published had a page in it that nobody
        // ever filed, and you have spent eleven weeks protecting whoever typed it.
        choices: [
          'a contracts clerk nineteen years in that office, who expected nothing and asked for nothing',
          "the losing tenderer's own counsel, who wanted the award stopped and picked a reporter to stop it",
          "the official's deputy, who wanted the job and has been acting in it since the 20th",
          'somebody using a name that has never been on that authority\'s payroll',
        ],
        weights: [3, 3, 2, 3],
      },
    ],
    facts: {
      source_truth: { from_variable: 'source' },
      page_four: {
        value: 'the only one of the four with no registry stamp on it, and every page that office files carries one',
      },
      deal_terms: {
        value: 'the name today and a deposition in three other matters afterward, with no limit written on the end of it',
      },
      sentence_real: {
        value: 'until this grand jury\'s term ends, which is eleven days from Friday and not the four months you were given',
      },
      broker_stake: {
        value: 'by the firm that lost the tender, for four thousand, invoiced as media relations in the week before you met',
      },
      second_reporter: {
        value: 'a wire reporter, eight days after you, who read them and did not run them',
      },
      halloran_client: {
        value: 'the company that won the contract, in a matter it would rather nobody set beside this one',
      },
    },
    bindings: { source: 'source' },
  },

  holds: [
    // The editor is sincerely wrong about the sentence that matters most. She read the
    // offer — an earlier draft of it, faxed at nine, that had no paragraph 3.
    {
      actor: 'ines',
      fact: 'deal_terms',
      status: 'believed_false',
      value: 'this case and nothing else — the citation withdrawn and everybody home by four',
      confidence: 0.9,
    },
    { actor: 'ines', fact: 'second_reporter', status: 'told', value: '@canonical', confidence: 0.7 },
    // The lawyer knows the real number and gives you a bigger one, because a frightened
    // client signs.
    {
      actor: 'halloran',
      fact: 'sentence_real',
      status: 'observed',
      value: 'for as long as four months, which is what happens to people who do this twice',
      confidence: 0.8,
    },
    { actor: 'halloran', fact: 'deal_terms', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'halloran', fact: 'halloran_client', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'teague', fact: 'source_truth', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'teague', fact: 'broker_stake', status: 'observed', value: '@canonical', confidence: 1 },
    { actor: 'teague', fact: 'second_reporter', status: 'observed', value: '@canonical', confidence: 0.8 },
  ],

  verbs: [
    {
      id: 'ask',
      label: 'Ask',
      aliases: ['ask', 'question', 'talk to', 'say to', 'speak to', 'put it to'],
      description: 'Put a question to one of the three people in this room.',
      default_minutes: 2,
      requires_target: true,
      speech: true,
      question_verb: true,
      base_difficulty: 0.05,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'told_checked', direction: -0.3, strength: 0.4, context: 'You worked from what the room told you.' },
        { dimension: 'solo_coalition', direction: 0.4, strength: 0.5, context: 'You asked instead of working around them.' },
        { dimension: 'direct_cunning', direction: -0.3, strength: 0.35, context: 'You put the question to them straight.' },
      ],
    },
    {
      id: 'press',
      label: 'Press',
      aliases: ['press', 'push', 'confront', 'demand', 'insist', 'lean on'],
      description: 'Stop being collegiate about a question, in a small room with two other people in it.',
      default_minutes: 2,
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
      label: 'Read',
      aliases: ['read', 'look at', 'look', 'check', 'examine', 'study', 'go through', 'open'],
      description: 'Put your own eyes on a piece of paper in this room.',
      default_minutes: 2,
      requires_target: true,
      object_verb: true,
      base_difficulty: 0.03,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'told_checked', direction: 0.6, strength: 0.7, context: 'You read it yourself.' },
        { dimension: 'solo_coalition', direction: -0.45, strength: 0.5, context: 'You checked it yourself rather than asking anyone.' },
      ],
    },
    {
      id: 'tell',
      label: 'Tell',
      aliases: ['tell', 'explain', 'warn', 'show', 'inform', 'say'],
      description: 'Put something you have worked out in front of the room.',
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
      id: 'call',
      label: 'Use the phone',
      aliases: ['call', 'phone', 'ring', 'dial', 'get on the phone'],
      description: 'Two calls, a wall phone, and one more person who knows for each of them.',
      default_minutes: 3,
      requires_target: true,
      base_difficulty: 0.25,
      chip_when: { resource: { id: 'calls', holder: 'you', gte: 1 } },
      effects_by_outcome: {
        success: [
          { kind: 'resource', id: 'calls', from: 'you', to: 'world', amount: 1 },
          { kind: 'resource', id: 'known', from: 'world', to: 'you', amount: 1 },
        ],
        partial: [
          { kind: 'resource', id: 'calls', from: 'you', to: 'world', amount: 1 },
          { kind: 'resource', id: 'known', from: 'world', to: 'you', amount: 1 },
        ],
        failure: [{ kind: 'resource', id: 'calls', from: 'you', to: 'world', amount: 1 }],
      },
      play_signals: [
        { dimension: 'control_delegation', direction: 0.7, strength: 0.7, context: 'You reached outside the room rather than working it out inside it.' },
        { dimension: 'preserve_risk', direction: 0.5, strength: 0.5, context: 'You widened the circle to get something you needed.' },
      ],
    },
    {
      id: 'wait',
      label: 'Wait',
      aliases: ['wait', 'say nothing', 'do nothing', 'think', 'listen', 'sit'],
      description: 'Let a minute of the twenty go and watch what the room does with it.',
      default_minutes: 2,
      requires_target: false,
      base_difficulty: 0,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'speed_deliberation', direction: 0.6, strength: 0.5, context: 'You let a minute go rather than fill it.' },
      ],
    },
    {
      id: 'give',
      label: 'Give the court the name',
      aliases: ['give the name', 'give them the name', 'give the court the name', 'name the source', 'answer the question', 'take the offer', 'sign the offer'],
      description: 'Go back in and answer the question that was put to you. It cannot be unanswered.',
      default_minutes: 4,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You said a name out loud in a room with a stenographer in it, and it is on a tape now.',
      base_difficulty: 0.1,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'promise_consequence', direction: 0.9, strength: 0.9, context: 'You took the consequence off the table.' },
        { dimension: 'loyalty_opportunism', direction: 0.8, strength: 0.9, context: 'You gave up the person you had promised to protect.' },
        { dimension: 'preserve_risk', direction: -0.6, strength: 0.6, context: 'You took the way out that was on the table.' },
      ],
    },
    {
      id: 'refuse',
      label: 'Refuse again',
      aliases: ['refuse again', 'refuse', 'stand on it', 'take the contempt', 'go to jail', 'keep the promise'],
      description: 'Go back in and say no a second time, in front of a judge who has said what happens then.',
      default_minutes: 4,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You said no to a judge for the second time in one morning, and the clerk started writing before you finished.',
      base_difficulty: 0.15,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'promise_consequence', direction: -0.9, strength: 0.9, context: 'You kept it and paid for it.' },
        { dimension: 'loyalty_opportunism', direction: -0.9, strength: 0.9, context: 'You kept a promise that cost you something real.' },
        { dimension: 'caution_boldness', direction: 0.6, strength: 0.6, context: 'You took the consequence rather than the exit.' },
      ],
    },
    {
      id: 'retract',
      label: 'Withdraw the story',
      aliases: ['withdraw the story', 'withdraw', 'retract', 'retract the story', 'take it back', 'kill the story'],
      description: 'Tell the court the paper no longer stands behind what it printed. There is then no story to protect a source for.',
      default_minutes: 4,
      requires_target: false,
      speech: true,
      commitment: true,
      commitment_line: 'You took back in one sentence something the paper had spent eleven weeks standing behind.',
      base_difficulty: 0.25,
      chip_when: { always: true },
      play_signals: [
        { dimension: 'promise_consequence', direction: -0.3, strength: 0.6, context: 'You took the thing away rather than the promise.' },
        { dimension: 'preserve_risk', direction: -0.7, strength: 0.7, context: 'You gave up the ground rather than defend it.' },
        { dimension: 'direct_cunning', direction: 0.5, strength: 0.5, context: 'You found the exit nobody in the room had named.' },
      ],
    },
  ],

  overrides: [
    // --- cornering the broker -------------------------------------------------
    {
      id: 'o_corner_teague',
      priority: 100,
      when: {
        verb: ['press', 'tell'],
        target: ['teague'],
        pred: { knows: { actor: 'you', fact: 'broker_stake' } },
      },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'teague_open', value: true }],
      reveals: [{ fact: 'source_truth', to: 'you', status: 'observed', via: 'p_source_paid' }],
      summary:
        'You do not raise your voice. You put the month, the amount and the word invoiced in front of him in that order, and Teague looks at Halloran, and Halloran looks at the table, and that is the whole conversation. When Teague answers he answers quietly and to you and not to the room.',
    },
    {
      id: 'o_work_it_out',
      priority: 95,
      when: {
        verb: ['read', 'tell', 'wait'],
        pred: {
          all: [
            { knows: { actor: 'you', fact: 'page_four', correct: true } },
            { knows: { actor: 'you', fact: 'second_reporter' } },
            { not: { flag: 'worked_out', eq: true } },
          ],
        },
      },
      outcome: 'success',
      effects: [{ kind: 'flag', id: 'worked_out', value: true }],
      reveals: [{ fact: 'source_truth', to: 'you', status: 'observed', via: 'p_source_corner' }],
      summary:
        'An unstamped page and a second reporter eight days behind you are not two facts. They are one fact, and it is about who wanted this printed rather than who was brave enough to print it. You sit down for the first time since you got here.',
    },

    // --- giving the name ------------------------------------------------------
    {
      id: 'o_give_used',
      priority: 110,
      when: {
        verb: ['give'],
        pred: {
          any: [
            { truth: { fact: 'source_truth', eq: "the losing tenderer's own counsel, who wanted the award stopped and picked a reporter to stop it" } },
            { truth: { fact: 'source_truth', eq: 'somebody using a name that has never been on that authority\'s payroll' } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'answer', value: 'named' },
        { kind: 'flag', id: 'named_a_user', value: true },
      ],
      summary:
        'You say the name. The prosecutor writes it down without any expression at all, which is how you learn he already had it, and what he wanted was you saying it. Within a week it is clear to everybody including you that the person you protected for eleven weeks had been using you since March.',
    },
    {
      id: 'o_give',
      priority: 100,
      when: { verb: ['give'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'answer', value: 'named' },
        { kind: 'flag', id: 'named_a_source', value: true },
      ],
      summary:
        'You say the name. It takes under two seconds and the room does not react at all. The clerk types it, the citation is withdrawn, and you are on the steps in the sunshine by three o\'clock with the rest of your working life in front of you and one fewer person in it who will ever tell you anything.',
    },

    // --- refusing -------------------------------------------------------------
    {
      id: 'o_refuse_right',
      priority: 110,
      when: {
        verb: ['refuse'],
        pred: {
          any: [
            { truth: { fact: 'source_truth', eq: 'a contracts clerk nineteen years in that office, who expected nothing and asked for nothing' } },
            { truth: { fact: 'source_truth', eq: "the official's deputy, who wanted the job and has been acting in it since the 20th" } },
          ],
        },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'answer', value: 'refused' },
        { kind: 'flag', id: 'kept_faith', value: true },
      ],
      summary:
        'You say no, and the judge does what he said he would do, and it is eleven days rather than the four months you spent the morning being frightened of. The story stands. The person you did not name stays in that office, and the following March an envelope arrives at the paper with no note in it and a registry stamp on every page.',
    },
    {
      id: 'o_refuse',
      priority: 100,
      when: { verb: ['refuse'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'answer', value: 'refused' },
        { kind: 'flag', id: 'protected_a_user', value: true },
      ],
      summary:
        'You say no, and the judge does what he said he would do. You serve it. It is a good deal shorter than you were told and it is still eleven days, and you spend most of them working out that the principle you were standing on had somebody standing behind it who chose you on purpose.',
    },

    // --- withdrawing the story ------------------------------------------------
    {
      id: 'o_retract_right',
      priority: 110,
      when: {
        verb: ['retract'],
        pred: { truth: { fact: 'source_truth', eq: 'somebody using a name that has never been on that authority\'s payroll' } },
      },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'answer', value: 'withdrawn' },
        { kind: 'flag', id: 'withdrew_correctly', value: true },
      ],
      summary:
        'You tell the court the paper does not stand behind the fourth page and cannot stand behind the story built on it. There is nothing left to compel a name for, so nobody is compelled. It is the worst morning of your career and it is also the only version of it in which nobody is named for something that was never in that office in the first place.',
    },
    {
      id: 'o_retract',
      priority: 100,
      when: { verb: ['retract'] },
      outcome: 'success',
      effects: [
        { kind: 'flag', id: 'answer', value: 'withdrawn' },
        { kind: 'flag', id: 'withdrew_a_true_story', value: true },
      ],
      summary:
        'You tell the court the paper does not stand behind it. The citation falls away because there is no longer a story to protect a source for, and everybody goes home. Three pages of what you published were exactly what you said they were, and the man they were about reads the retraction twice and has it framed.',
    },
  ],

  injects: [
    {
      id: 'i_clerk_passes',
      kind: 'pressure',
      when: { turns: { gte: 2 } },
      once: true,
      actor: 'halloran',
      actor_type: 'character',
      verb: 'presses',
      demands_response: true,
      effects: [{ kind: 'disposition', actor: 'halloran', axis: 'fear', delta: 5 }],
      line: 'Halloran turns the offer another inch toward you. "He gave you twenty minutes so that you could be seen to have taken them. He did not give you twenty minutes so that you could arrive at something else."',
      summary: 'The lawyer pushes the offer.',
    },
    {
      id: 'i_ines_stands_up',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 3 } }, { not: { flag: 'worked_out', eq: true } }] },
      once: true,
      actor: 'ines',
      actor_type: 'character',
      verb: 'argues',
      demands_response: true,
      effects: [{ kind: 'flag', id: 'ines_committed', value: true }],
      line: 'Ines puts both hands on the back of a chair. "The paper is behind you. I have that in writing from Tuesday and I will read it out in that room if he asks me to."',
      summary: 'The editor commits the paper, out loud.',
    },
    {
      id: 'i_teague_moves',
      kind: 'pressure',
      when: { all: [{ turns: { gte: 4 } }, { not: { flag: 'teague_open', eq: true } }] },
      once: true,
      actor: 'teague',
      actor_type: 'character',
      verb: 'deflects',
      effects: [{ kind: 'disposition', actor: 'teague', axis: 'fear', delta: 10 }],
      line: 'Teague comes away from the window and sits down, which he has not done all morning, and asks Halloran whether he is required to stay.',
      summary: 'The man who made the introduction asks whether he can leave.',
    },
    {
      id: 'i_clerk_glass',
      kind: 'pressure',
      when: { clock: { gte: 12 } },
      once: true,
      actor: 'world',
      actor_type: 'world_process',
      verb: 'reminds',
      effects: [],
      line: 'The clerk stops at the glass panel this time instead of walking past it, looks in at the four of you, and holds up one hand with the fingers spread.',
      summary: 'Five minutes.',
    },
  ],

  processes: [
    {
      id: 'w_teague_goes',
      kind: 'actor',
      actor: 'teague',
      trigger: { when: { all: [{ flag: 'teague_open', eq: true }, { clock: { gte: 14 } }] } },
      once: true,
      effects: [
        { kind: 'clock', minutes: 1 },
        { kind: 'position', entity: 'teague', location: 'corridor' },
      ],
      line: 'Teague picks up his coat and goes out to the corridor without asking anybody this time, and sits on the bench where you can see him through the glass.',
      summary: 'The man who made the introduction leaves the room.',
    },
    {
      id: 'w_desk_calls',
      kind: 'system',
      actor: 'world',
      trigger: { every_minutes: 6, when: { clock: { gte: 6 } } },
      effects: [{ kind: 'resource', id: 'known', from: 'world', to: 'you', amount: 1 }],
      line: 'Somewhere down the corridor a payphone rings twice and stops, and Ines checks her watch against it.',
      summary: 'The newsroom is waiting to hear.',
    },
  ],

  outcome_dimensions: [
    {
      key: 'promise',
      label: 'The promise',
      question: 'Whether the person who trusted you was still protected when you walked out.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'kept_faith', eq: true }, points: 4, note: 'you were asked for the name twice and did not give it, and the person you promised never found out how close it came' },
        { when: { flag: 'withdrew_correctly', eq: true }, points: 3, note: 'nobody was named, because you took away the thing that was being used to compel a name' },
        { when: { flag: 'protected_a_user', eq: true }, points: 2, note: 'you kept the promise, and the promise turned out to have been made to somebody who was working you' },
        { when: { flag: 'withdrew_a_true_story', eq: true }, points: 2, note: 'nobody was named, and nobody needed to be, because there was no longer anything to name them about' },
        { when: { flag: 'named_a_user', eq: true }, points: 1, note: 'you gave up somebody who had used you, which is still a name you had promised not to say' },
        { when: { flag: 'named_a_source', eq: true }, points: 0, note: 'you gave the court the name of somebody who came to you because you said you would not' },
      ],
      bands: [
        { at_least: 4, label: 'kept' },
        { at_least: 3, label: 'kept, by another road' },
        { at_least: 2, label: 'kept at a price' },
        { at_least: 1, label: 'traded' },
        { at_least: 0, label: 'broken' },
      ],
    },
    {
      key: 'story',
      label: 'The story',
      question: 'Whether what the paper printed was still standing at the end of the day.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'kept_faith', eq: true }, points: 4, note: 'the story stood, and stood better for what it cost you' },
        { when: { flag: 'named_a_source', eq: true }, points: 3, note: 'the story stands, and the next one will be harder to get' },
        { when: { flag: 'protected_a_user', eq: true }, points: 2, note: 'the story stands on three pages and a fourth that nobody has looked at closely yet' },
        { when: { flag: 'named_a_user', eq: true }, points: 2, note: 'the story survives the morning and not the follow-up' },
        // A withdrawal scores low here even when withdrawing was the right call, because
        // this axis answers what was left of what the paper printed and the answer is
        // nothing. Taking it back at the right moment is paid for on the other two axes.
        { when: { flag: 'withdrew_correctly', eq: true }, points: 1, note: 'there was less there than you printed, and you were the one who said so' },
        { when: { flag: 'withdrew_a_true_story', eq: true }, points: 0, note: 'three pages of it were exactly what you said they were, and you took all four back' },
      ],
      bands: [
        { at_least: 4, label: 'standing' },
        { at_least: 3, label: 'standing, at a cost' },
        { at_least: 2, label: 'standing on less than you thought' },
        { at_least: 1, label: 'taken back' },
        { at_least: 0, label: 'taken back, and it was true' },
      ],
    },
    {
      key: 'yourself',
      label: 'What it cost you',
      question: 'What you personally walked out of the building carrying.',
      min: 0,
      max: 4,
      scoring: [
        { when: { flag: 'named_a_source', eq: true }, points: 4, note: 'you were on the steps by three, and nothing further happened to you at all' },
        { when: { flag: 'named_a_user', eq: true }, points: 4, note: 'you went home the same afternoon' },
        { when: { flag: 'withdrew_correctly', eq: true }, points: 3, note: 'no citation, and a paragraph on page two you will be asked about for years' },
        { when: { flag: 'withdrew_a_true_story', eq: true }, points: 2, note: 'no citation, and a retraction with your name on it' },
        { when: { flag: 'kept_faith', eq: true }, points: 1, note: 'eleven days, and every reporter in the state knew where you were' },
        { when: { flag: 'protected_a_user', eq: true }, points: 0, note: 'eleven days, for somebody who had picked you out in advance' },
      ],
      bands: [
        { at_least: 4, label: 'nothing' },
        { at_least: 3, label: 'a paragraph' },
        { at_least: 2, label: 'your name on a retraction' },
        { at_least: 1, label: 'eleven days' },
        { at_least: 0, label: 'eleven days, and the reason' },
      ],
    },
    {
      key: 'knew',
      label: 'What you knew',
      question: 'Whether you understood what you were choosing between before you chose.',
      min: 0,
      max: 4,
      scoring: [
        { when: { knows: { actor: 'you', fact: 'source_truth', correct: true } }, points: 2, note: 'you found out who it actually was before you answered' },
        { when: { knows: { actor: 'you', fact: 'deal_terms', correct: true } }, points: 1, note: 'you read the second page of the offer' },
        { when: { knows: { actor: 'you', fact: 'sentence_real', correct: true } }, points: 1, note: 'you established what refusing would really have cost, rather than what you were told' },
        { when: { knows: { actor: 'you', fact: 'page_four', correct: true } }, points: 1, note: 'you noticed the page that came out of nowhere' },
      ],
      bands: [
        { at_least: 4, label: 'you knew the room' },
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
      id: 'promise_consequence',
      label_left: 'Keep The Promise',
      label_right: 'Take The Consequence Off The Table',
      measures: 'Whether the undertaking you gave held when holding it started costing you personally.',
    },
    {
      id: 'told_checked',
      label_left: 'Act On What You Were Told',
      label_right: 'Read It Yourself',
      measures: 'Whether you took the room\'s account of the papers on the table, or looked at the papers.',
    },
  ],

  difficulty: {
    standard: { opposition_multiplier: 1, cost_multiplier: 1 },
  },

  invariants: {
    exclusive_flags: [
      { flags: ['named_a_source', 'named_a_user'], message: 'the person named was working you or they were not' },
      { flags: ['kept_faith', 'protected_a_user'], message: 'the promise was worth keeping or it was not' },
      { flags: ['withdrew_correctly', 'withdrew_a_true_story'], message: 'the story was sound or it was not' },
    ],
  },

  content_descriptors: {
    depicted: [
      'a contempt-of-court hearing and the prospect of a short custodial term',
      'professional pressure between a reporter, an editor and a lawyer',
      'a confidential source who may have been acting in bad faith',
      'public corruption referred to and not shown',
    ],
    discussable: ['imprisonment for contempt', 'a corrupt contract award', 'a paid introduction', 'a possibly fabricated document'],
    player_action_bounds: [
      'you may ask, press, read, tell, use the phone, give the name, refuse again, or withdraw the story',
      'you may not harm anyone in this room; nobody here can be hurt by you and the world will not resolve an attempt',
      'nobody here is a real person, and no real court, authority, newspaper or proceeding is depicted',
    ],
    intensity: 'strong',
    estimated_minutes: 13,
  },

  assets: { audio: [] },

  narrator_fallbacks: {
    'block.default': 'Not in this room, and not in the next twenty minutes.',
    'block.absent': '{name} is not in here. Whatever that was going to be, it waits for the corridor.',
    'block.dead': 'That is past being any use to anybody.',
    'block.destroyed': 'What is left of {name} will not tell you anything.',
    'block.out_of_reach': '{name} is not in this room, and going to find it costs minutes you have been counting.',
    'block.sealed': '{name} does not open for you, and all three of them would watch you try.',
    'block.no_target': 'Halloran gets there first. "{verb} {whom}?"',
    'block.broke': 'There is no call left in you. There were two and you have made them.',
    'block.short': 'You have {held} of that and not {wanted}, and everybody in this room can count.',
  },

  director: { rescue_budget: 1, min_turns_between_injects: 1 },
};

export default CONTEMPT;
