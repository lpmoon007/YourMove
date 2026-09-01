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
  //
  // With one exception, and it is not a small one. A COMMITMENT ends the run and cannot be
  // taken back, so a one-word alias for it has to be the thing the player is saying rather
  // than a word that happened to appear. "Give Vane my word that no other NAME leaves this
  // tent" is not an accusation, and it hanged him. A single word only selects a commitment
  // when it opens the sentence; a phrase ("name the forger") is specific enough anywhere.
  const words = low.trim().split(/\s+/);
  /** Which word does this alias start at? -1 when it is not there as whole words. */
  const startsAt = (alias: string): number => {
    const parts = alias.split(' ');
    for (let i = 0; i + parts.length <= words.length; i += 1)
      if (parts.every((p, k) => words[i + k] === p)) return i;
    return -1;
  };
  // You commit by LEADING with it. "Hold pressure for Eastgate" is a decision; "ask
  // Salcedo about holding pressure for Eastgate" is a question, and the difference is
  // where the phrase sits. Three words of grace covers "I would rather sign it".
  const selectable = (v: VerbDef, alias: string) => {
    if (!v.commitment) return true;
    const at = startsAt(alias);
    return at >= 0 && at <= 2;
  };

  // WHERE the alias sits decides, and only then how long it is. Picking the longest match
  // anywhere in the sentence let a word later in it beat the word the player led with: in
  // the world about who made the call, "ask Marla about the call" picked `call` over `ask`
  // — four letters against three — and dialed the phone instead of asking her. "ask Cyrus
  // when the call went out" and "who made the call?" went the same way, and a taster's own
  // "tell Ruiz ... I have nothing to add to it" was heard as `refuse`, which quietly spent
  // one of three silences. A sentence's action is the verb it opens with; a verb further
  // in is what the sentence is ABOUT. Length still breaks a tie at the same position, so
  // "say to" beats "say".
  let verb: VerbDef | null = null;
  let matchAt = Number.POSITIVE_INFINITY;
  let matchLen = 0;
  for (const v of input.vocabulary) {
    for (const alias of [v.id, ...v.aliases]) {
      const a = alias.toLowerCase().replace(/_/g, ' ');
      const at = startsAt(a);
      if (at < 0) continue;
      if (at > matchAt || (at === matchAt && a.length <= matchLen)) continue;
      if (!selectable(v, a)) continue;
      verb = v;
      matchAt = at;
      matchLen = a.length;
    }
  }

  // --- a bare question is still a question ---------------------------------
  //
  // "how sure are you, Dez?" names no verb from the vocabulary, and answering it with
  // "say that plainly" is the world admitting it was not listening. A question put to
  // somebody in the room is the package's question verb, aimed at them.
  const question = isQuestion(raw);

  // --- targets: any actor / entity / location named in the text ---
  const targets: string[] = [];

  // A person says "the case", not "the general's dispatch case". An object answers to the
  // last word of its name as well as to all of it — but only where nothing else in the
  // room ends the same way, because "the book" with a night book AND a vehicle book on the
  // desk is a question rather than a reference, and the world should ask rather than pick.
  const headNoun = (name: string): string => {
    const words = name
      .toLowerCase()
      .replace(/^(the|a|an|your|his|her|their)\s+/, '')
      .trim()
      .split(/\s+/);
    return words.length > 1 ? (words[words.length - 1] ?? '') : '';
  };
  const spokenFor = new Set<string>();
  for (const e of input.surface.entities) {
    spokenFor.add(e.name.toLowerCase());
    spokenFor.add(e.id.toLowerCase());
  }
  const headCount = new Map<string, number>();
  for (const e of input.surface.entities) {
    const h = headNoun(e.name);
    if (h.length > 3) headCount.set(h, (headCount.get(h) ?? 0) + 1);
  }
  const shortNameFor = (e: { id: string; name: string }): string[] => {
    const h = headNoun(e.name);
    // Not when two things share it, and not when it is already some other thing's whole name.
    if (h.length > 3 && headCount.get(h) === 1 && !spokenFor.has(h)) return [h];
    return [];
  };

  const named = [
    ...input.surface.actors.map((a) => ({ id: a.id, words: [a.name, a.name.split(' ')[0] ?? a.name, a.id] })),
    ...input.surface.entities.map((e) => ({ id: e.id, words: [e.name, e.id, ...shortNameFor(e)] })),
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

  // A sentence that OPENS as a question is a question, even when a verb alias turns up
  // later in it. "who made the call?" is putting it to the room, not reaching for the
  // phone, and the phone is what it got. The interrogative has to come FIRST: "ask Marla
  // who called it in" opens with a verb and stays one.
  const asksFirst = interrogativeAt(raw);
  const leadsAsQuestion = asksFirst >= 0 && asksFirst < matchAt;

  if ((!verb || leadsAsQuestion) && question) {
    const asking = input.vocabulary.find((v) => v.question_verb) ?? input.vocabulary.find((v) => v.speech && v.requires_target);
    // Only when there is somebody to ask. A question aimed at nobody is still unclear, and
    // it is also how "how do I open the safe" keeps opening the safe.
    if (asking && targets.some((t) => input.surface.actors.some((a) => a.id === t))) verb = asking;
    // Opens as a question, names nobody and nothing: "who made the call?" is not a decision
    // to pick up the phone. Better to ask the player who they mean, in world, than to spend
    // a turn and somebody's attention on a guess.
    else if (leadsAsQuestion && !targets.length) verb = null;
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

const INTERROGATIVE =
  /^(who|what|when|where|why|how|which|whose|is|are|was|were|do|does|did|can|could|will|would|should|have|has|had|am)$/i;

/**
 * A question mark, or the shape of one without it — people drop the mark, and they put
 * the name first: "Marla who else has a key". So the interrogative is looked for in the
 * opening few words rather than only at the very front.
 */
function isQuestion(raw: string): boolean {
  if (/\?/.test(raw)) return true;
  const opening = raw
    .toLowerCase()
    .split(/[^\p{L}']+/u)
    .filter(Boolean)
    .slice(0, 3);
  return opening.some((w) => INTERROGATIVE.test(w));
}

/** Where the first interrogative sits, as a word index, or -1 if the sentence does not
 *  open with one. Only the first three words count: a "who" deep in a sentence is part of
 *  what is being asked about, not the asking. */
function interrogativeAt(raw: string): number {
  const opening = raw
    .toLowerCase()
    .split(/[^\p{L}']+/u)
    .filter(Boolean)
    .slice(0, 3);
  return opening.findIndex((w) => INTERROGATIVE.test(w));
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
