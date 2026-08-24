// THE TWELVE-MEASUREMENT OVERLAY — the leadership-failure lens over a Your Move run.
//
// Your Move is entertainment. This lens is NOT part of the simulation: no engine module
// imports it, no projection exposes it, no player-facing surface calls it, and it can
// never change a resolution, a fact, or an outcome. It is a read of the finished event
// spine, produced only when a facilitator explicitly asks for it.
//
// It computes the same twelve markers as the leadership product's Behavioral Panel —
// Tier A A1..A6 (the individual read) and Tier B B1..B6 (the teaming read) — with the
// same keys, labels, composites and quadrant, so a Your Move run and a Signal run are
// speaking the same language. It is a SEPARATE IMPLEMENTATION reading this engine's
// spine; the two products share the vocabulary, not the code (convergence brief 9.1:
// one simulation core, two applications, two interpretation layers).
//
// Two disciplines are carried over verbatim and matter more than the numbers:
//   1. Never score an opportunity the world did not present. A marker the run never
//      exercised reports `exercised: false`, never a zero.
//   2. Every marker cites the events that justify it.

import type { WorldEvent } from '../types';
import type { World } from '../world';

export const LFS12_LENS_VERSION = 'lfs12-v0.1';
export const LFS12_TAXONOMY = 'panel-v0.1';

export type Tier = 'A' | 'B';
export type Confidence = 'high' | 'medium' | 'low';

export interface Lfs12Marker {
  key: string;
  label: string;
  tier: Tier;
  /** 0..1 rate per opportunity the world actually offered. Null when not exercised. */
  raw: number | null;
  /** 0..100, difficulty-adjusted. Null when not exercised. */
  normalized: number | null;
  confidence: Confidence;
  exercised: boolean;
  /** Why this marker reads the way it does, in one line. */
  read: string;
  /** Event ids that justify the score. No citation, no claim. */
  evidence: string[];
  /** Denominator: what the world offered. Null when nothing was offered. */
  opportunities: number | null;
}

export interface Lfs12Read {
  lens_version: string;
  taxonomy: string;
  run_id: string;
  scenario: string;
  content_version: string;
  markers: Lfs12Marker[];
  tier_a: number | null;
  tier_b: number | null;
  quadrant: 'multiplier' | 'lone_genius' | 'connector' | 'struggling' | 'na';
  /** Plain-language caveat that ships with every read. */
  note: string;
}

const MARKS: { key: string; label: string; tier: Tier }[] = [
  { key: 'A1', label: 'Information-seeking', tier: 'A' },
  { key: 'A2', label: 'Decision calibration', tier: 'A' },
  { key: 'A3', label: 'Consultation breadth', tier: 'A' },
  { key: 'A4', label: 'Truth-seeking over comfort', tier: 'A' },
  { key: 'A5', label: 'Intent–action integrity', tier: 'A' },
  { key: 'A6', label: 'Composure under escalation', tier: 'A' },
  { key: 'B1', label: 'Airtime equality', tier: 'B' },
  { key: 'B2', label: 'Voice / speaking up', tier: 'B' },
  { key: 'B3', label: 'Backup & support', tier: 'B' },
  { key: 'B4', label: 'Unique-information sharing', tier: 'B' },
  { key: 'B5', label: 'Responsiveness / closed-loop', tier: 'B' },
  { key: 'B6', label: 'Mutual monitoring', tier: 'B' },
];

const NOT_EXERCISED = 'the world never presented this opportunity — not scored';

/**
 * Apply the overlay. `enabled` must be explicitly true: the default everywhere in this
 * codebase is OFF, so an accidental import can never turn a game into an assessment.
 */
export function applyLfs12(world: World, opts: { enabled: boolean }): Lfs12Read | null {
  if (!opts.enabled) return null;

  const spine = world.spine.all();
  const player = world.playerId;
  const pkg = world.pkg;
  const cast = pkg.cast.map((c) => c.id);
  const difficulty = pkg.difficulty[world.config.difficulty]?.opposition_multiplier ?? 1;

  const playerActs = spine.filter((e) => e.actor_type === 'player');
  const resolved = playerActs.filter((e) => e.verb !== 'unclear' && e.verb !== 'attempt_blocked');
  const disclosures = spine.filter((e) => e.verb === 'fact_disclosed');
  const injects = spine.filter((e) => e.actor_type === 'director');

  const mk = (
    key: string,
    raw: number | null,
    confidence: Confidence,
    exercised: boolean,
    read: string,
    evidence: WorldEvent[] | string[],
    opportunities: number | null,
  ): Lfs12Marker => {
    const m = MARKS.find((x) => x.key === key)!;
    const r = exercised && raw !== null ? clamp01(raw) : null;
    return {
      key,
      label: m.label,
      tier: m.tier,
      raw: r,
      normalized: r === null ? null : Math.round(clamp01(r * (0.85 + 0.15 * difficulty)) * 100),
      confidence,
      exercised,
      read: exercised ? read : NOT_EXERCISED,
      evidence: (evidence as (WorldEvent | string)[]).map((e) => (typeof e === 'string' ? e : e.id)),
      opportunities,
    };
  };

  // --- A1 Information-seeking: of the facts this world made findable, how many did
  //     they actually go and get? --------------------------------------------------
  const findable = pkg.facts.filter((f) => pkg.discovery_paths.some((p) => p.fact === f.id));
  const learned = new Set(
    disclosures.filter((e) => e.targets.includes(player)).map((e) => String(e.payload.fact ?? '')),
  );
  const a1Evidence = disclosures.filter((e) => e.targets.includes(player));

  // --- A2 Decision calibration: did the irreversible commitment rest on evidence? ---
  const commitmentVerbs = new Set(pkg.verbs.filter((v) => v.commitment).map((v) => v.id));
  const commitments = resolved.filter((e) => commitmentVerbs.has(e.verb));
  const critical = pkg.facts.filter((f) => f.required_for_top_outcome).map((f) => f.id);
  const calibrated = commitments.filter((c) => {
    const learnedBefore = disclosures.filter((d) => d.seq < c.seq && d.targets.includes(player)).map((d) => String(d.payload.fact ?? ''));
    return critical.length ? critical.every((f) => learnedBefore.includes(f)) : learnedBefore.length > 0;
  });

  // --- A3 Consultation breadth: how much of the room did they actually use? --------
  const addressed = new Set(resolved.flatMap((e) => e.targets.filter((t) => cast.includes(t))));

  // --- A4 Truth-seeking over comfort: did they go to the people holding the hard
  //     information, including the ones who make it uncomfortable? ------------------
  const holders = new Set<string>();
  for (const c of pkg.cast) for (const f of c.knows) if (findable.some((x) => x.id === f)) holders.add(c.id);
  for (const h of pkg.holds) if (h.status !== 'unknown' && cast.includes(h.actor)) holders.add(h.actor);
  const holdersQueried = [...holders].filter((h) => addressed.has(h));

  // --- A5 Intent–action integrity: when they said what they were doing, did they
  //     then do it? Not exercised if they never stated a goal. ---------------------
  const stated = resolved.filter((e) => Boolean((e.payload.intent as Record<string, unknown> | undefined)?.goal));
  const followedThrough = stated.filter((s) => {
    const target = s.targets[0];
    return resolved.some((later) => later.seq > s.seq && later.seq <= s.seq + 6 && (target ? later.targets.includes(target) : true));
  });

  // --- A6 Composure under escalation: after the world turned on them, did their play
  //     hold together, or did it come apart? ---------------------------------------
  const escalationPoint = injects.length ? Math.min(...injects.map((i) => i.seq)) : Infinity;
  const underEscalation = playerActs.filter((e) => e.seq > escalationPoint);
  const composed = underEscalation.filter(
    (e) => e.payload.outcome !== 'backfire' && e.verb !== 'attempt_blocked' && e.verb !== 'unclear',
  );

  // --- Tier B in a solo world -------------------------------------------------------
  // Three of the six need peers in the room to mean anything. In a one-human world they
  // are reported as not exercised — never as a zero, and never quietly dropped.
  const soloB = (key: string) =>
    mk(key, null, 'low', false, '', [], null);

  // B4 unique-information sharing: facts the player held that a character did not, and
  // whether the player passed them on.
  const playerFacts = world.knowledge.factsFor(player).map((f) => f.fact);
  let sharingOpportunities = 0;
  const shared: string[] = [];
  for (const f of playerFacts)
    for (const c of cast)
      if (!world.knowledge.hasHeard(c, f)) {
        sharingOpportunities += 1;
      } else {
        const via = disclosures.find((d) => d.actor_id === player && String(d.payload.fact) === f && d.targets.includes(c));
        if (via) {
          sharingOpportunities += 1;
          shared.push(via.id);
        }
      }

  // B5 responsiveness: beats that put a direct demand to the player, and whether the
  // player answered the actor who made it, within three turns.
  const demanding = injects.filter((e) => {
    const id = String(e.payload.inject ?? '');
    return pkg.injects.find((i) => i.id === id)?.demands_response === true;
  });
  const answered = demanding.filter((d) =>
    resolved.some((r) => r.seq > d.seq && r.seq <= d.seq + 6 && r.targets.includes(d.actor_id)),
  );

  const markers: Lfs12Marker[] = [
    mk(
      'A1',
      findable.length ? learned.size / findable.length : null,
      learned.size >= 2 ? 'high' : 'medium',
      findable.length > 0,
      `${learned.size} of ${findable.length} findable facts pulled out of the room.`,
      a1Evidence,
      findable.length,
    ),
    mk(
      'A2',
      commitments.length ? calibrated.length / commitments.length : null,
      'medium',
      commitments.length > 0,
      `${calibrated.length} of ${commitments.length} irreversible commitment(s) made with the decisive facts in hand.`,
      commitments,
      commitments.length,
    ),
    mk(
      'A3',
      cast.length ? addressed.size / cast.length : null,
      'high',
      cast.length > 0,
      `spoke to ${addressed.size} of ${cast.length} people in the room.`,
      resolved.filter((e) => e.targets.some((t) => cast.includes(t))),
      cast.length,
    ),
    mk(
      'A4',
      holders.size ? holdersQueried.length / holders.size : null,
      'medium',
      holders.size > 0,
      `went to ${holdersQueried.length} of ${holders.size} people who were actually holding something.`,
      resolved.filter((e) => e.targets.some((t) => holders.has(t))),
      holders.size,
    ),
    mk(
      'A5',
      stated.length ? followedThrough.length / stated.length : null,
      stated.length >= 2 ? 'medium' : 'low',
      stated.length > 0,
      `stated an intention ${stated.length} time(s) and followed it through ${followedThrough.length} time(s).`,
      stated,
      stated.length,
    ),
    mk(
      'A6',
      underEscalation.length ? composed.length / underEscalation.length : null,
      underEscalation.length >= 3 ? 'medium' : 'low',
      underEscalation.length > 0,
      `${composed.length} of ${underEscalation.length} moves after the pressure landed still held together.`,
      underEscalation,
      underEscalation.length,
    ),
    soloB('B1'),
    soloB('B2'),
    soloB('B3'),
    mk(
      'B4',
      sharingOpportunities ? shared.length / sharingOpportunities : null,
      'low',
      sharingOpportunities > 0,
      `passed on ${shared.length} of ${sharingOpportunities} thing(s) only they knew.`,
      shared,
      sharingOpportunities,
    ),
    mk(
      'B5',
      demanding.length ? answered.length / demanding.length : null,
      'medium',
      demanding.length > 0,
      `answered ${answered.length} of ${demanding.length} direct demand(s) put to them.`,
      demanding,
      demanding.length,
    ),
    soloB('B6'),
  ];

  return {
    lens_version: LFS12_LENS_VERSION,
    taxonomy: LFS12_TAXONOMY,
    run_id: world.run_id,
    scenario: pkg.slug,
    content_version: pkg.content_version,
    markers,
    tier_a: composite(markers, 'A'),
    tier_b: composite(markers, 'B'),
    quadrant: quadrantOf(composite(markers, 'A'), composite(markers, 'B')),
    note:
      'A v0.1 hypothesis lens applied to an entertainment run, not a validated assessment. ' +
      'Markers with no opportunity are reported as not exercised, never as zero. ' +
      'Nothing here influenced the run: the overlay reads the event log after the fact.',
  };
}

function composite(markers: Lfs12Marker[], tier: Tier): number | null {
  const scored = markers.filter((m) => m.tier === tier && m.exercised && m.normalized !== null);
  if (!scored.length) return null;
  const w = (c: Confidence) => (c === 'high' ? 1 : c === 'medium' ? 0.6 : 0.3);
  let num = 0;
  let den = 0;
  for (const m of scored) {
    num += (m.normalized as number) * w(m.confidence);
    den += w(m.confidence);
  }
  return den ? Math.round(num / den) : null;
}

function quadrantOf(a: number | null, b: number | null): Lfs12Read['quadrant'] {
  if (a === null || b === null) return 'na';
  const hiA = a >= 55;
  const hiB = b >= 55;
  return hiA && hiB ? 'multiplier' : hiA && !hiB ? 'lone_genius' : !hiA && hiB ? 'connector' : 'struggling';
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
