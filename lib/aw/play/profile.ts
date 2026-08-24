// HOW YOU PLAY — the profile.
//
// Turns accumulated evidence into something a player can look at. Three rules hold
// everywhere in this file:
//
//   1. It describes play, never a person. "You tend to", never "you are".
//   2. Nothing is permanent. Recent play counts for more, and a dimension with thin
//      evidence says so rather than guessing.
//   3. A dimension the worlds never tested is reported as untested, never as neutral.
//
// Contradictions are not smoothed away. A player who negotiates in one world and
// escalates in another reads as context-dependent, which is more interesting than a
// number in the middle.

import { CORE_EIGHT, CONFIDENCE_COPY, type PlayConfidence, type PlayDimension } from './dimensions';
import type { PlayEvidence } from './observe';

export interface PlayRead {
  dimension: string;
  left: string;
  right: string;
  measures: string;
  /** −1..1. Null when nothing has tested this. */
  position: number | null;
  /** 0..100 for a slider. Null when untested. */
  slider: number | null;
  confidence: PlayConfidence | null;
  confidence_note: string;
  /** The sentence a player reads. */
  read: string;
  /** How many separate moments fed this. */
  opportunities: number;
  worlds: string[];
  /** Moments that pushed toward the side the player sits on. */
  evidence: PlayEvidence[];
  /** Moments that pushed the other way. Shown, never hidden. */
  counter_evidence: PlayEvidence[];
  /** Set when the same player plays this dimension very differently depending on where
   *  they are — or, in one world, from one run to the next. Averaging two opposite runs
   *  into a confident middle would be a lie about both of them. */
  varies_by: 'world' | 'run' | null;
  variation: { label: string; position: number }[] | null;
}

export interface PlayProfile {
  taxonomy: string;
  runs: number;
  worlds: string[];
  reads: PlayRead[];
  /** One earned label, or null while the evidence is too thin to name anything. */
  title: { name: string; because: string } | null;
  /** Things that are true at the same time and pull in different directions. */
  contradictions: string[];
  /** The standing caveat. Shipped with every read. */
  note: string;
}

const UNTESTED = 'No world has put you in this situation yet.';

/**
 * Recent play weighs more. A run from long ago still counts, but it does not define
 * somebody forever. `runOrder` is oldest → newest.
 */
function recencyWeight(runId: string, runOrder: string[]): number {
  const i = runOrder.indexOf(runId);
  if (i < 0 || runOrder.length <= 1) return 1;
  return 0.55 + 0.45 * (i / (runOrder.length - 1));
}

export function buildProfile(
  evidence: PlayEvidence[],
  opts: { runOrder?: string[]; extraDimensions?: PlayDimension[] } = {},
): PlayProfile {
  const runOrder = opts.runOrder ?? [...new Set(evidence.map((e) => e.run_id))];
  const dims = [...CORE_EIGHT, ...(opts.extraDimensions ?? [])];

  const reads: PlayRead[] = dims.map((d) => {
    const mine = evidence.filter((e) => e.dimension === d.id);
    if (!mine.length) {
      return {
        dimension: d.id,
        left: d.left,
        right: d.right,
        measures: d.measures,
        position: null,
        slider: null,
        confidence: null,
        confidence_note: UNTESTED,
        read: UNTESTED,
        opportunities: 0,
        worlds: [],
        evidence: [],
        counter_evidence: [],
        varies_by: null,
        variation: null,
      };
    }

    const weightOf = (e: PlayEvidence) => e.strength * e.confidence * recencyWeight(e.run_id, runOrder);
    const total = mine.reduce((n, e) => n + weightOf(e), 0);
    const position = total ? mine.reduce((n, e) => n + e.direction * weightOf(e), 0) / total : 0;

    const worlds = [...new Set(mine.map((e) => e.world_id))];
    const groupBy = (key: (e: PlayEvidence) => string) => {
      const keys = [...new Set(mine.map(key))];
      return keys.map((k) => {
        const inGroup = mine.filter((e) => key(e) === k);
        const t = inGroup.reduce((n, e) => n + weightOf(e), 0);
        return { label: k, position: t ? inGroup.reduce((n, e) => n + e.direction * weightOf(e), 0) / t : 0 };
      });
    };
    const spreadOf = (g: { position: number }[]) =>
      g.length > 1 ? Math.max(...g.map((x) => x.position)) - Math.min(...g.map((x) => x.position)) : 0;

    const perWorld = groupBy((e) => e.world_id);
    const perRun = groupBy((e) => e.run_id);

    let confidence: PlayConfidence;
    let varies_by: 'world' | 'run' | null = null;
    let variation: { label: string; position: number }[] | null = null;
    if (mine.length < 3) confidence = 'emerging';
    else if (perWorld.length >= 2 && spreadOf(perWorld) >= 0.8) {
      confidence = 'context-dependent';
      varies_by = 'world';
      variation = perWorld;
    } else if (perRun.length >= 2 && spreadOf(perRun) >= 0.9) {
      // Same world, opposite nights. Still not one number.
      confidence = 'context-dependent';
      varies_by = 'run';
      variation = perRun;
    } else if (mine.length < 8) confidence = 'developing';
    else confidence = 'established';

    const read =
      confidence === 'context-dependent'
        ? `${varies_by === 'world' ? 'This changes with the world you are in.' : 'This has swung hard from one run to the next.'} ${d.copy_mixed}`
        : Math.abs(position) < 0.2
          ? d.copy_mixed
          : position < 0
            ? d.copy_left
            : d.copy_right;

    const towardSide = (e: PlayEvidence) => (position >= 0 ? e.direction > 0 : e.direction < 0);
    return {
      dimension: d.id,
      left: d.left,
      right: d.right,
      measures: d.measures,
      position: Math.round(position * 100) / 100,
      slider: Math.round(((position + 1) / 2) * 100),
      confidence,
      confidence_note: CONFIDENCE_COPY[confidence],
      read,
      opportunities: mine.length,
      worlds,
      evidence: mine.filter(towardSide).slice(-5),
      counter_evidence: mine.filter((e) => !towardSide(e)).slice(-3),
      varies_by,
      variation,
    };
  });

  return {
    taxonomy: evidence[0]?.taxonomy ?? 'play-v0.1',
    runs: runOrder.length,
    worlds: [...new Set(evidence.map((e) => e.world_id))],
    reads,
    title: chooseTitle(reads),
    contradictions: findContradictions(reads),
    note:
      'These are patterns in how you have played so far, not traits and not permanent. ' +
      'Different worlds bring out different sides of a player, and enough new moves will move any of these.',
  };
}

// ---------------------------------------------------------------------------
// Titles — earned from combinations, never assigned, never permanent.
// ---------------------------------------------------------------------------

interface TitleRule {
  name: string;
  because: string;
  /** dimension → the side it must lean, with how far. */
  needs: Record<string, number>;
}

const TITLES: TitleRule[] = [
  { name: 'The Broker', because: 'you negotiate, and you bring people in while you do it', needs: { force_diplomacy: 0.35, solo_coalition: 0.35 } },
  { name: 'The Diplomat', because: 'you look for agreement before you look for leverage', needs: { force_diplomacy: 0.5 } },
  { name: 'The Hammer', because: 'you apply pressure openly and keep hold of it yourself', needs: { force_diplomacy: -0.4, direct_cunning: -0.3, control_delegation: -0.25 } },
  { name: 'The Fox', because: 'you work sideways, take your time, and move when the room does', needs: { direct_cunning: 0.4, speed_deliberation: 0.3, loyalty_opportunism: 0.3 } },
  { name: 'The Quiet Power', because: 'you build agreement without telling anyone everything', needs: { force_diplomacy: 0.3, direct_cunning: 0.35, solo_coalition: 0.3 } },
  { name: 'The Lone Operator', because: 'you keep the critical path yourself and you say what you mean', needs: { solo_coalition: -0.4, direct_cunning: -0.3 } },
  { name: 'The Calculated Gambler', because: 'you sit with a decision, then put real weight behind it', needs: { preserve_risk: 0.4, speed_deliberation: 0.3 } },
  { name: 'The Blitz', because: 'you move early, hard, and without waiting for the picture', needs: { speed_deliberation: -0.4, caution_boldness: 0.35 } },
  { name: 'The Guardian', because: 'you protect what you have and the people who helped you build it', needs: { preserve_risk: -0.35, loyalty_opportunism: -0.35 } },
  { name: 'The Patient Hunter', because: 'you wait, you keep your reasoning to yourself, and you do not spend what you have', needs: { speed_deliberation: 0.35, direct_cunning: 0.3, preserve_risk: -0.3 } },
  { name: 'The Closer', because: 'you decide fast, say it out loud, and accept what follows', needs: { speed_deliberation: -0.35, direct_cunning: -0.3, caution_boldness: 0.3 } },
  { name: 'The Architect', because: 'you take your time, hand people real ownership, and build the thing together', needs: { control_delegation: 0.35, speed_deliberation: 0.3, solo_coalition: 0.3 } },
];

function chooseTitle(reads: PlayRead[]): PlayProfile['title'] {
  const pos = new Map(
    reads.filter((r) => r.position !== null && r.confidence !== 'context-dependent').map((r) => [r.dimension, r.position!]),
  );
  const solid = reads.filter((r) => r.confidence === 'developing' || r.confidence === 'established').length;
  // Nothing gets named on one thin run.
  if (solid < 2) return null;

  let best: { rule: TitleRule; score: number } | null = null;
  for (const rule of TITLES) {
    let score = 0;
    let ok = true;
    for (const [dim, need] of Object.entries(rule.needs)) {
      const p = pos.get(dim);
      if (p === undefined || (need > 0 ? p < need : p > need)) {
        ok = false;
        break;
      }
      score += Math.abs(p);
    }
    if (ok && (!best || score > best.score)) best = { rule, score };
  }
  return best ? { name: best.rule.name, because: best.rule.because } : null;
}

// ---------------------------------------------------------------------------
// Contradictions are the interesting part, so they are surfaced rather than averaged out.
// ---------------------------------------------------------------------------

const PAIRS: { a: string; b: string; when: (a: number, b: number) => boolean; say: string }[] = [
  {
    a: 'preserve_risk',
    b: 'caution_boldness',
    when: (a, b) => a < -0.3 && b > 0.3,
    say: 'You are careful with what you hold and bold about what you do with it.',
  },
  {
    a: 'speed_deliberation',
    b: 'solo_coalition',
    when: (a, b) => a > 0.3 && b > 0.3,
    say: 'You take your time deciding, then move quickly once other people are behind you.',
  },
  {
    a: 'force_diplomacy',
    b: 'direct_cunning',
    when: (a, b) => a > 0.3 && b > 0.3,
    say: 'You negotiate rather than push, but you do not show your whole hand while you do it.',
  },
  {
    a: 'solo_coalition',
    b: 'control_delegation',
    when: (a, b) => a > 0.3 && b < -0.3,
    say: 'You bring people in, and then you keep hold of the important part yourself.',
  },
  {
    a: 'loyalty_opportunism',
    b: 'force_diplomacy',
    when: (a, b) => a > 0.3 && b > 0.3,
    say: 'You change position readily, and you do it by agreement rather than by force.',
  },
];

function findContradictions(reads: PlayRead[]): string[] {
  const pos = new Map(reads.filter((r) => r.position !== null && r.confidence !== 'emerging').map((r) => [r.dimension, r.position!]));
  const out: string[] = [];
  for (const p of PAIRS) {
    const a = pos.get(p.a);
    const b = pos.get(p.b);
    if (a !== undefined && b !== undefined && p.when(a, b)) out.push(p.say);
  }
  for (const r of reads)
    if (r.confidence === 'context-dependent' && r.variation && r.variation.length > 1) {
      const sorted = [...r.variation].sort((x, y) => x.position - y.position);
      out.push(
        r.varies_by === 'world'
          ? `You play ${r.left.toLowerCase()} in ${sorted[0]!.label} and ${r.right.toLowerCase()} in ${sorted[sorted.length - 1]!.label}.`
          : `On ${r.left} / ${r.right} you have played both ends hard, in different runs of the same world.`,
      );
    }
  return out;
}

/** The one-run card: how you played THIS world, without any cross-run history. */
export function buildRunCard(evidence: PlayEvidence[]): { reads: PlayRead[]; sentence: string } {
  const profile = buildProfile(evidence);
  const tested = profile.reads.filter((r) => r.position !== null).sort((a, b) => Math.abs(b.position!) - Math.abs(a.position!));
  const top = tested.slice(0, 4);
  const sentence = top.length
    ? top
        .map((r) => (r.position! < 0 ? r.left.toLowerCase() : r.right.toLowerCase()))
        .reduce((acc, word, i, arr) => (i === arr.length - 1 && arr.length > 1 ? `${acc} and ${word}` : i ? `${acc}, ${word}` : word), '')
    : '';
  return {
    reads: tested,
    sentence: sentence ? `In this one you played ${sentence}.` : 'This run was too short to read anything from.',
  };
}
