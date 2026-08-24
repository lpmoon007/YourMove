// HOW YOU PLAY — badges.
//
// Things the world noticed. Every one is earned from something that actually happened in
// the event spine, and every one describes a move or an outcome, never a person.
//
// Secret badges exist and are not listed until they are earned: "???" with a rarity is a
// better hook than a checklist.

import { buildReveal, scoreOutcome } from '../outcome';
import type { World } from '../world';
import type { PlayEvidence } from './observe';

export type BadgeCategory = 'achievement' | 'discovery' | 'style' | 'world' | 'rare';
export type BadgeRarity = 'standard' | 'notable' | 'rare' | 'exceptional' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  /** What you did to get it. Always an action or an outcome. */
  earned_for: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  /** Hidden from the list until earned. */
  secret?: boolean;
  world_id: string;
  run_id: string;
}

/** Awarded from a finished run. Pure: reads the spine and the reveal, writes nothing. */
export function awardBadges(world: World, evidence: PlayEvidence[]): Badge[] {
  if (!world.ended) return [];
  const out: Badge[] = [];
  const reveal = buildReveal(world);
  const outcome = scoreOutcome(world);
  const st = world.store.read();
  const spine = world.spine.all();
  const acts = spine.filter((e) => e.actor_type === 'player' && e.verb !== 'unclear');

  const add = (b: Omit<Badge, 'world_id' | 'run_id'>) =>
    out.push({ ...b, world_id: world.pkg.slug, run_id: world.run_id });

  const learned = reveal.truth.filter((t) => t.player_status !== 'unknown');
  const wrong = learned.filter((t) => t.correct === false);
  const namedRight = st.flags['named_right'] === true;
  const namedWrong = st.flags['named_wrong'] === true;

  // --- achievement ---------------------------------------------------------
  if (namedRight && learned.some((t) => t.fact === 'leak_source' && t.correct))
    add({ id: 'called_it', name: 'Called It', earned_for: 'you worked out who it was and then said so out loud', category: 'achievement', rarity: 'notable' });
  if (learned.length === reveal.truth.length)
    add({ id: 'left_nothing', name: 'Left Nothing on the Table', earned_for: 'you found every findable thing before the clock ran out', category: 'achievement', rarity: 'exceptional' });
  if (outcome.axes.every((a) => a.points >= a.max * 0.8))
    add({ id: 'clean_night', name: 'A Clean Night', earned_for: 'every axis came out strong at once', category: 'achievement', rarity: 'legendary' });

  // --- discovery -----------------------------------------------------------
  if (learned.some((t) => t.fact === 'sedan_truth' && t.correct))
    add({ id: 'looked_yourself', name: 'Looked For Yourself', earned_for: 'you checked the thing everyone was panicking about instead of taking their word', category: 'discovery', rarity: 'standard' });
  if (reveal.lied_to.some((l) => !l.sincere))
    add({ id: 'caught_it', name: 'Caught the Lie', earned_for: 'somebody told you something they knew was untrue, and it is on the record', category: 'discovery', rarity: 'rare' });

  // --- style ---------------------------------------------------------------
  const spentAll = Object.values(st.resources.cash ?? {}).reduce((n, v) => n + v, 0);
  if ((st.resources.cash?.[world.playerId] ?? 0) < spentAll * 0.5)
    add({ id: 'everyone_owes', name: 'Everyone Owes You a Favor', earned_for: 'you spent more than half the money buying your way through the room', category: 'style', rarity: 'notable' });
  if (acts.length <= 4)
    add({ id: 'few_words', name: 'A Man of Few Moves', earned_for: `you finished the whole thing in ${acts.length} moves`, category: 'style', rarity: 'rare' });
  if (evidence.filter((e) => e.dimension === 'direct_cunning' && e.direction > 0.5).length >= 2)
    add({ id: 'sideways', name: 'Worked It Sideways', earned_for: 'more than once you moved without letting the room see it', category: 'style', rarity: 'notable' });
  if (acts.every((e) => e.payload.outcome !== 'backfire'))
    add({ id: 'nothing_blew_up', name: 'Nothing Blew Up', earned_for: 'not one move you made went badly wrong', category: 'style', rarity: 'notable' });

  // --- rare / secret -------------------------------------------------------
  if (namedWrong)
    add({ id: 'wrong_name', name: 'Said the Wrong Name', earned_for: 'you accused someone who had done nothing', category: 'rare', rarity: 'notable', secret: true });
  if (world.truth.read('leak_source') === 'nobody' && !namedWrong && !namedRight)
    add({ id: 'nobody_did_it', name: 'Nobody Did It', earned_for: 'there was no leak, and you did not talk yourself into one', category: 'rare', rarity: 'legendary', secret: true });
  if (wrong.length === 0 && learned.length >= 4)
    add({ id: 'wrong_about_nothing', name: 'Wrong About Nothing', earned_for: 'you left believing only true things', category: 'rare', rarity: 'exceptional', secret: true });

  return out;
}

export const RARITY_ORDER: BadgeRarity[] = ['standard', 'notable', 'rare', 'exceptional', 'legendary'];
