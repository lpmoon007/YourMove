// ITEM 12 — the Narrator. Renders resolved outcomes into prose and dialogue.
//
// Receives the resolved effect set, the public state projection, and — for dialogue —
// the speaking character's knowledge state and voice profile. Nothing else.
//
// It MUST NOT receive canonical truth. It MUST NOT receive another character's knowledge.
// It MUST NOT introduce facts, entities, resources or outcomes that are not in the
// resolved effects. Everything it produces passes post-generation validation, and on
// refusal or validation failure it degrades to an AUTHORED fallback line rather than
// breaking the fiction.
//
// This module is pure: the model call lives in model/narrate.ts and uses these types.

import type { ScenarioPackage } from './package';
import type { CharacterProjection, NarratorProjection, OutcomeClass } from './types';

export interface NarrationRequest {
  /** The factual summary of what the RULES decided. The prose renders this. */
  summary: string;
  outcome: OutcomeClass | 'blocked' | 'clarify';
  projection: NarratorProjection;
  /** Present when a character speaks. Their knowledge is the only knowledge in scope. */
  speaker: CharacterProjection | null;
  /** Authored lines (Director injects, world processes) that must survive intact. */
  authored_lines: string[];
  /** What the player learned this turn, already rendered. The Narrator may state these
   *  and nothing else — they are the only new facts in scope. */
  revealed: { statement: string; from: string | null }[];
  /** Which authored fallback to use if generation fails. */
  fallback_key: string;
  /** What the player typed — for tone, never for truth. */
  player_text: string;
}

export interface NarrationOutput {
  text: string;
  model: string | null;
  raw_output: string | null;
  fell_back: boolean;
  validation: ValidationReport;
}

export interface Narrator {
  render(req: NarrationRequest): Promise<{ text: string; model: string | null; raw_output: string | null }>;
}

export interface ValidationReport {
  ok: boolean;
  problems: string[];
}

/**
 * Post-generation validation (item 12). Three checks, all mechanical:
 *   1. no entity named outside the permitted set
 *   2. no numeric claim contradicting state
 *   3. no fact asserted outside the speaker's knowledge
 */
export function validateNarration(text: string, req: NarrationRequest, pkg: ScenarioPackage): ValidationReport {
  const problems: string[] = [];
  const permitted = new Set(req.projection.permitted_entities.map((n) => n.toLowerCase()));

  // 1 — entities
  const universe = [
    ...pkg.cast.map((c) => c.name),
    ...pkg.entities.map((e) => e.name),
    ...pkg.locations.map((l) => l.name),
  ];
  for (const name of universe) {
    if (permitted.has(name.toLowerCase())) continue;
    if (new RegExp(`\\b${escapeRe(name)}\\b`, 'i').test(text)) problems.push(`named "${name}", which is not in scene`);
  }

  // 2 — numeric claims. Any figure of three digits or more must match something real.
  const allowed = new Set<string>();
  for (const r of req.projection.player_resources) allowed.add(String(r.amount));
  allowed.add(String(req.projection.clock));
  for (const m of text.matchAll(/\$?\b(\d[\d,]{2,})\b/g)) {
    const n = m[1]!.replace(/,/g, '');
    if (!allowed.has(n)) problems.push(`claimed the figure ${m[1]}, which is not in state`);
  }

  // 3 — a speaker cannot assert what they do not hold (L6). Heuristic but mechanical:
  // if the canonical subject of a fact the speaker does NOT hold is named alongside that
  // fact's distinctive wording, the line is asserting knowledge it was never given.
  if (req.speaker) {
    const held = new Set(req.speaker.knows.map((k) => k.fact));
    for (const f of pkg.facts) {
      if (held.has(f.id)) continue;
      const marker = distinctiveWords(f.statement);
      if (marker.length && marker.every((w) => new RegExp(`\\b${escapeRe(w)}\\b`, 'i').test(text)))
        problems.push(`${req.speaker.name} asserted "${f.id}", which is not in their knowledge state`);
    }
  }

  return { ok: problems.length === 0, problems };
}

/** The deterministic renderer. Used when no model is configured, and as the last resort
 *  before the authored fallback. It never adds a fact: it restates the resolution. */
export function localNarrate(req: NarrationRequest): string {
  const parts: string[] = [];
  if (req.summary) parts.push(req.summary);
  for (const r of req.revealed) parts.push(r.from ? `${r.from} gives you this much: ${r.statement}` : r.statement);
  for (const line of req.authored_lines) parts.push(line);
  return parts.join('\n\n');
}

/** Fail to authored text rather than break fiction (item 12). */
export function fallbackLine(pkg: ScenarioPackage, key: string): string {
  return (
    pkg.narrator_fallbacks[key] ??
    pkg.narrator_fallbacks['narration.default'] ??
    'The room shifts around what just happened. Nobody says anything yet.'
  );
}

/**
 * The full narration path: generate, validate, and degrade invisibly on failure.
 * `narrator` may be null (no key configured) — the deterministic renderer takes over.
 */
export async function narrate(
  pkg: ScenarioPackage,
  req: NarrationRequest,
  narrator: Narrator | null,
): Promise<NarrationOutput> {
  if (!narrator) {
    const text = localNarrate(req);
    return { text, model: null, raw_output: null, fell_back: false, validation: { ok: true, problems: [] } };
  }
  try {
    const out = await narrator.render(req);
    const validation = validateNarration(out.text, req, pkg);
    if (!validation.ok || !out.text.trim()) {
      return {
        text: fallbackLine(pkg, req.fallback_key),
        model: out.model,
        raw_output: out.raw_output,
        fell_back: true,
        validation,
      };
    }
    return { text: out.text.trim(), model: out.model, raw_output: out.raw_output, fell_back: false, validation };
  } catch {
    return {
      text: fallbackLine(pkg, req.fallback_key),
      model: null,
      raw_output: null,
      fell_back: true,
      validation: { ok: false, problems: ['generation failed'] },
    };
  }
}

function distinctiveWords(statement: string): string[] {
  return statement
    .replace('{value}', '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 6)
    .slice(0, 2);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
