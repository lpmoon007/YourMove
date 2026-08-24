// HOW YOU PLAY — a behavioral game-profile layer over finished runs.
//
// It measures observable play and never personality. Everything it produces says "this is
// how you tended to play in these worlds"; nothing it produces says "this is who you are".
//
// It is strictly downstream of the simulation: observe() reads a finished event spine, and
// no module in lib/aw outside this directory imports anything from it. A play dimension
// cannot reach a resolution, and a resolution cannot know a dimension exists.

export { CORE_EIGHT, CORE_EIGHT_IDS, CONFIDENCE_COPY, PLAY_TAXONOMY, dimension } from './dimensions';
export type { PlayDimension, PlayConfidence } from './dimensions';
export { observePlay, worldDimensions } from './observe';
export type { PlayEvidence, PlaySignal } from './observe';
export { buildProfile, buildRunCard } from './profile';
export type { PlayProfile, PlayRead } from './profile';
export { awardBadges, RARITY_ORDER } from './badges';
export type { Badge, BadgeCategory, BadgeRarity } from './badges';
