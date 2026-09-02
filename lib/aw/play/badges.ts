// HOW YOU PLAY — badges.
//
// Things the world noticed. Every one is earned from something that actually happened in
// the event spine, and every one describes a move or an outcome, never a person.
//
// Secret badges exist and are not listed until they are earned: "???" with a rarity is a
// better hook than a checklist.
//
// TWO RULES, both learned the hard way and both checked by tests/aw/howyouplay.test.ts:
//
// 1. NOTHING HERE MAY NAME A WORLD'S OWN CONTENT. This file shipped keyed on `leak_source`,
//    `sedan_truth`, the flags `named_right` / `named_wrong` and a resource called `cash` —
//    every one of them The Last Job's and nobody else's. Six of eleven badges were therefore
//    unearnable in ten of the eleven worlds, and no test saw it, because the badge tests
//    played The Last Job. A badge is a reading of the SHAPE of a run: a commitment made, a
//    lie caught, a thing found for yourself, an axis carried. Every world has those.
//
// 2. A BADGE THAT ALWAYS FIRES IS NOT A BADGE. "Nothing Blew Up" was awarded on 264 of 264
//    finished runs across all eleven worlds, because a backfire needs a risk the player has
//    to go out of their way to take. It was a certificate of attendance sitting on the
//    profile page next to genuinely rare things. Rarity is measured against real play, not
//    guessed: scripts/audit-badges.ts plays every world in six shapes and prints the rate.

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
  const findable = reveal.truth.length;
  const share = findable ? learned.length / findable : 0;

  // The shape of the run, in terms every world has.
  const commitVerbs = new Set(world.pkg.verbs.filter((v) => v.commitment).map((v) => v.id));
  const committed = acts.some((e) => commitVerbs.has(e.verb));
  const disclosures = spine.filter((e) => e.verb === 'fact_disclosed');
  const forYourself = disclosures.filter((e) => e.actor_id === 'observation').length;
  const passedOn = disclosures.filter((e) => e.actor_id === world.playerId).length;
  const axisShares = outcome.axes.map((a) => (a.max ? a.points / a.max : 0));
  const axisAvg = axisShares.length ? axisShares.reduce((n, x) => n + x, 0) / axisShares.length : 0;
  const axisMin = axisShares.length ? Math.min(...axisShares) : 0;

  // --- achievement ---------------------------------------------------------
  if (committed && wrong.length === 0 && share >= 0.6)
    add({ id: 'called_it', name: 'Called It', earned_for: 'you committed to something you could not take back, and everything you were going on was true', category: 'achievement', rarity: 'exceptional' });
  if (findable && learned.length === findable)
    add({ id: 'left_nothing', name: 'Left Nothing on the Table', earned_for: 'you found every findable thing before the clock ran out', category: 'achievement', rarity: 'exceptional' });
  if (axisAvg >= 0.75 && axisMin >= 0.35)
    add({ id: 'clean_night', name: 'A Clean Night', earned_for: 'it came out strong on every count at once', category: 'achievement', rarity: 'legendary' });

  // --- discovery -----------------------------------------------------------
  if (forYourself >= 2)
    add({ id: 'looked_yourself', name: 'Looked For Yourself', earned_for: `you found ${forYourself} things by going and looking instead of taking somebody's word`, category: 'discovery', rarity: 'standard' });
  if (reveal.lied_to.some((l) => !l.sincere))
    add({ id: 'caught_it', name: 'Caught the Lie', earned_for: 'somebody told you something they knew was untrue, and it is on the record', category: 'discovery', rarity: 'notable' });
  // A world seeds its cast knowing most of what is findable, so telling somebody
  // something they do not already have is genuinely hard to do even once: measured at
  // well under one run in a hundred across all eleven worlds.
  if (passedOn >= 1)
    add({ id: 'told_them', name: 'You Knew It First', earned_for: 'you put something into the room that nobody else in it had', category: 'discovery', rarity: 'exceptional' });

  // --- style ---------------------------------------------------------------
  // Not "you spent half of it": no world's clock is long enough for that, measured. What
  // is real is a run where most of the moves cost something — buying your way through.
  // A verb costs you something when one of its outcomes moves a resource OUT of the
  // player. Verbs carry no `cost` field: the spending is in effects_by_outcome, which is
  // why an earlier version of this looked for one and found nothing anywhere.
  const costingVerbs = new Set(
    world.pkg.verbs
      .filter((v) =>
        Object.values(v.effects_by_outcome ?? {}).some((fx) =>
          fx.some((e) => e.kind === 'resource' && e.from === world.playerId && e.amount > 0),
        ),
      )
      .map((v) => v.id),
  );
  const paid = acts.filter((e) => costingVerbs.has(e.verb)).length;
  if (paid >= 3 && paid >= acts.length * 0.5)
    add({ id: 'paid_for_it', name: 'Paid For Every Inch', earned_for: `${paid} of your ${acts.length} moves cost you something you were carrying`, category: 'style', rarity: 'rare' });
  if (acts.length <= 4 && committed && axisAvg >= 0.4)
    add({ id: 'few_moves', name: 'Not One Wasted Move', earned_for: `you finished the whole thing in ${acts.length} move${acts.length === 1 ? '' : 's'} and still got somewhere`, category: 'style', rarity: 'rare' });
  if (evidence.filter((e) => e.dimension === 'direct_cunning' && e.direction > 0.5).length >= 2)
    add({ id: 'sideways', name: 'Worked It Sideways', earned_for: 'more than once you moved without letting the room see it', category: 'style', rarity: 'exceptional' });
  if (acts.length >= 6 && acts.every((e) => e.payload.outcome !== 'backfire' && e.payload.outcome !== 'failure'))
    add({ id: 'nothing_blew_up', name: 'Nothing Blew Up', earned_for: `all ${acts.length} of your moves landed — not one of them came back empty`, category: 'style', rarity: 'rare' });

  // --- rare / secret -------------------------------------------------------
  if (committed && wrong.length > 0)
    add({ id: 'sure_wrong', name: 'Sure About the Wrong Thing', earned_for: 'you committed to something you could not take back while holding a fact that was false', category: 'rare', rarity: 'standard', secret: true });
  if (committed && share <= 0.2)
    add({ id: 'went_anyway', name: 'Went Anyway', earned_for: 'you made the irreversible move with almost none of the picture in your hands', category: 'rare', rarity: 'notable', secret: true });
  if (wrong.length === 0 && learned.length >= 4)
    add({ id: 'wrong_about_nothing', name: 'Wrong About Nothing', earned_for: 'you left believing only true things', category: 'rare', rarity: 'notable', secret: true });

  return out;
}

export const RARITY_ORDER: BadgeRarity[] = ['standard', 'notable', 'rare', 'exceptional', 'legendary'];
