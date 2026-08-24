// HOW YOU PLAY — the Core Eight.
//
// These describe OBSERVABLE PLAY, never a person. The system says "this is how you tended
// to play in these worlds"; it never says "this is who you are". Every string in this file
// is written to that rule, and a test in tests/aw/howyouplay.test.ts fails the build if any
// of them slips into personality language.
//
// Neither end of any spectrum is better than the other. A player can use force brilliantly
// in one room and diplomacy disastrously in the next.

export const PLAY_TAXONOMY = 'play-v0.1';

export interface PlayDimension {
  id: string;
  /** −1.0 end. */
  left: string;
  /** +1.0 end. */
  right: string;
  /** What it watches for, in the player's words. */
  measures: string;
  /** Copy for a player sitting toward each end. Always "you tend to", never "you are". */
  copy_left: string;
  copy_right: string;
  /** Shown when the evidence sits near the middle. */
  copy_mixed: string;
}

export const CORE_EIGHT: PlayDimension[] = [
  {
    id: 'force_diplomacy',
    left: 'Force',
    right: 'Diplomacy',
    measures: 'How you tend to create movement when people push back.',
    copy_left: 'When resistance appears, you tend to increase leverage rather than wait for agreement.',
    copy_right: 'You usually try to create agreement before you apply pressure.',
    copy_mixed: 'You have pushed and you have negotiated, depending on who was in front of you.',
  },
  {
    id: 'caution_boldness',
    left: 'Caution',
    right: 'Boldness',
    measures: 'How much you still do not know when you commit.',
    copy_left: 'You tend to protect against the downside before committing heavily.',
    copy_right: 'You are willing to make consequential moves before the picture is complete.',
    copy_mixed: 'Sometimes you wait for the picture, sometimes you move without it.',
  },
  {
    id: 'solo_coalition',
    left: 'Solo',
    right: 'Coalition',
    measures: 'How much you turn other people into part of the solution.',
    copy_left: 'You tend to keep the critical path under your own control.',
    copy_right: 'You regularly turn other people into part of the solution.',
    copy_mixed: 'You bring people in for some things and handle others yourself.',
  },
  {
    id: 'speed_deliberation',
    left: 'Speed',
    right: 'Deliberation',
    measures: 'How quickly you move from not knowing to committing.',
    copy_left: 'You prefer making a workable decision quickly and adjusting afterward.',
    copy_right: 'You tend to keep options open until you understand more of the situation.',
    copy_mixed: 'You move fast on some things and sit on others.',
  },
  {
    id: 'control_delegation',
    left: 'Control',
    right: 'Delegation',
    measures: 'Whether you hold the important actions yourself or hand them to someone else.',
    copy_left: 'When something matters, you prefer to stay close to it.',
    copy_right: 'You are comfortable giving other people real ownership and letting them run.',
    copy_mixed: 'You hand off some things and keep a hand on others.',
  },
  {
    id: 'preserve_risk',
    left: 'Preserve',
    right: 'Risk',
    measures: 'How much of what you already hold you will put on the table for a bigger return.',
    copy_left: 'You usually protect what you have already built before reaching for more.',
    copy_right: 'You are willing to put real assets at risk when the upside looks worth it.',
    copy_mixed: 'You have spent freely in some rooms and held tight in others.',
  },
  {
    id: 'direct_cunning',
    left: 'Direct',
    right: 'Cunning',
    measures: 'How openly you go after what you want.',
    copy_left: 'You usually make your intentions clear and deal with resistance in the open.',
    copy_right: 'You are comfortable controlling what other people know and letting them draw their own conclusions.',
    copy_mixed: 'You have played some rooms straight and worked others sideways.',
  },
  {
    id: 'loyalty_opportunism',
    left: 'Loyalty',
    right: 'Opportunism',
    measures: 'How much your existing commitments shape what you do next.',
    copy_left: 'Once you commit to people, you tend to stay with them even when it costs you.',
    copy_right: 'You are willing to change position when the world opens a new one.',
    copy_mixed: 'You have held to people in some rooms and moved on in others.',
  },
];

export const CORE_EIGHT_IDS = CORE_EIGHT.map((d) => d.id);

export function dimension(id: string, extra: PlayDimension[] = []): PlayDimension | undefined {
  return CORE_EIGHT.find((d) => d.id === id) ?? extra.find((d) => d.id === id);
}

/** How much the world has actually seen. Never a score, and never permanent. */
export type PlayConfidence = 'emerging' | 'developing' | 'established' | 'context-dependent';

export const CONFIDENCE_COPY: Record<PlayConfidence, string> = {
  emerging: 'barely enough to notice yet',
  developing: 'a pattern starting to show',
  established: 'this has repeated across several real situations',
  'context-dependent': 'this changes a lot depending on the world',
};
