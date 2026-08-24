// ITEM 7 — the Intent Parser. Free text in, structured action out.
//
// It resolves, evaluates and decides NOTHING (that is items 8-10), and it never sees
// canonical truth or hidden state. Ambiguous input returns LOW CONFIDENCE rather than a
// guess; the engine turns low confidence into an in-world clarifying line from a
// character, never a system error.
//
// This module is pure. The model-backed parser lives in model/parse.ts and falls back
// to `deterministicParse` on any failure, so the engine runs with no API key at all.

import type { VerbDef } from './package';
import type { Intent } from './types';

export interface ParseSurface {
  /** Names and ids the player could plausibly be referring to. No hidden entities. */
  actors: { id: string; name: string }[];
  entities: { id: string; name: string }[];
  resources: { id: string; label: string }[];
  location: { id: string; name: string } | null;
}

export interface ParseInput {
  raw: string;
  vocabulary: VerbDef[];
  surface: ParseSurface;
  /** Last few public lines, for pronoun resolution only. */
  recent: string[];
}

export interface IntentParser {
  parse(input: ParseInput): Promise<{ intent: Intent; model: string | null; raw_output: string | null }>;
}

const SECRECY_MARKERS: [RegExp, Intent['secrecy']][] = [
  [/\b(quietly|without (?:telling|letting)|behind (?:his|her|their) back|in secret|secretly|slip(?:ping)? out)\b/i, 'covert'],
  [/\b(discreet(?:ly)?|low[- ]key|off to the side|pull(?:ing)? (?:him|her|them) aside)\b/i, 'discreet'],
];

/**
 * The deterministic parser. Also the fallback for the model parser, so a key outage
 * degrades the quality of parsing, never the availability of the world.
 */
export function deterministicParse(input: ParseInput): Intent {
  const raw = input.raw.trim();
  const low = ` ${raw.toLowerCase().replace(/[^\p{L}\p{N}$.,'\- ]/gu, ' ')} `;

  // --- verb: longest alias wins, so "hand over" beats "hand" ---
  let verb: VerbDef | null = null;
  let matchLen = 0;
  for (const v of input.vocabulary) {
    for (const alias of [v.id, ...v.aliases]) {
      const a = alias.toLowerCase().replace(/_/g, ' ');
      if (a.length > matchLen && new RegExp(`(^|\\s)${escapeRe(a)}(\\s|$)`, 'i').test(low)) {
        verb = v;
        matchLen = a.length;
      }
    }
  }

  // --- targets: any actor / entity / location named in the text ---
  const targets: string[] = [];
  const named = [
    ...input.surface.actors.map((a) => ({ id: a.id, words: [a.name, a.name.split(' ')[0] ?? a.name, a.id] })),
    ...input.surface.entities.map((e) => ({ id: e.id, words: [e.name, e.id] })),
    ...(input.surface.location ? [{ id: input.surface.location.id, words: [input.surface.location.name] }] : []),
  ];
  for (const n of named)
    for (const w of n.words)
      if (w && w.length > 2 && new RegExp(`(^| )${escapeRe(w.toLowerCase())}(\\b|$)`, 'i').test(low)) {
        if (!targets.includes(n.id)) targets.push(n.id);
        break;
      }

  // --- resources committed: "$5,000", "5000 of the cash", "half the money" ---
  const resources: { id: string; amount: number }[] = [];
  const money = /\$\s?([\d,]+)|\b([\d,]{3,})\b/.exec(raw);
  const firstResource = input.surface.resources[0];
  if (firstResource) {
    if (money) {
      const amount = Number((money[1] ?? money[2] ?? '0').replace(/,/g, ''));
      if (amount > 0) resources.push({ id: firstResource.id, amount });
    } else if (/\b(all (?:the|of the|our)? ?(?:money|cash)|everything)\b/i.test(raw)) {
      resources.push({ id: firstResource.id, amount: -1 }); // -1 = "all of it", bound later
    } else if (/\bhalf\b/i.test(raw)) {
      resources.push({ id: firstResource.id, amount: -2 }); // -2 = "half"
    }
  }

  let secrecy: Intent['secrecy'] = 'open';
  for (const [re, level] of SECRECY_MARKERS) if (re.test(raw)) secrecy = level;

  const addressee =
    input.surface.actors.find((a) => targets.includes(a.id))?.id ??
    (/\b(ask|tell|say|call|talk|warn|accuse|offer|show)\b/i.test(raw) ? (targets[0] ?? null) : null);

  const goal = extractGoal(raw);

  // --- confidence: never guess. Low confidence routes to an in-world clarification. ---
  let confidence: number;
  if (!verb) confidence = raw.split(/\s+/).length <= 2 ? 0.2 : 0.35;
  else if (verb.requires_target && !targets.length) confidence = 0.45;
  else confidence = 0.85;
  if (raw.length < 3) confidence = 0.1;

  return {
    verb: verb?.id ?? 'other',
    targets,
    method: null,
    instrument: null,
    resources,
    goal,
    secrecy,
    addressee,
    confidence,
    raw,
    ...(verb ? {} : { description: raw }),
  };
}

function extractGoal(raw: string): string | null {
  const m = /\b(?:so that|to see if|in order to|because|so I can|to find out)\b(.+)$/i.exec(raw);
  return m ? m[1]!.trim().replace(/[.]$/, '') : null;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Below this, the world asks what you mean — in character (item 7). */
export const CLARIFY_THRESHOLD = 0.4;

export function needsClarification(i: Intent): boolean {
  return i.confidence < CLARIFY_THRESHOLD;
}

/** A pure, deterministic parser wrapped in the async contract. */
export const localParser: IntentParser = {
  async parse(input) {
    return { intent: deterministicParse(input), model: null, raw_output: null };
  },
};
