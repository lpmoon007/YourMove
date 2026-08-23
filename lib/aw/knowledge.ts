// ITEM 11 — the Knowledge and Belief Tracker.
//
// What every actor knows, believes, or has been told, tracked separately from what is
// true. Never the same object as canonical truth, and never merged with it.
//
// This is what makes the reveal screen possible, makes "you never asked her about the
// manifest" a query instead of a guess, and makes deception mechanical rather than
// narrative decoration. It is also the SOLE source for character prompt construction
// (L6): if a fact is not here for that character, it is not in the prompt.

import type { Effect, KnowledgeRecord, KnowledgeStatus, KnowledgeStore } from './types';

const UNKNOWN: KnowledgeRecord = {
  status: 'unknown',
  value: null,
  source_actor: null,
  acquired_at: null,
  fidelity: 0,
  distortion: null,
  confidence: 0,
  contradicted: false,
  provenance: [],
};

/** Ranked so a stronger acquisition never silently downgrades to a weaker one. */
const STRENGTH: Record<KnowledgeStatus, number> = {
  unknown: 0,
  told: 2,
  believed_false: 2,
  inferred: 3,
  observed: 4,
};

export class KnowledgeTracker {
  private store: KnowledgeStore;

  constructor(initial: KnowledgeStore = {}) {
    this.store = initial;
  }

  get(actor: string, fact: string): KnowledgeRecord {
    return this.store[actor]?.[fact] ?? UNKNOWN;
  }

  knows(actor: string, fact: string): boolean {
    const r = this.get(actor, fact);
    return r.status !== 'unknown' && r.status !== 'believed_false';
  }

  /** Told-but-not-believed still counts as "has heard it" — a different question. */
  hasHeard(actor: string, fact: string): boolean {
    return this.get(actor, fact).status !== 'unknown';
  }

  factsFor(actor: string): { fact: string; record: KnowledgeRecord }[] {
    return Object.entries(this.store[actor] ?? {})
      .filter(([, r]) => r.status !== 'unknown')
      .map(([fact, record]) => ({ fact, record }));
  }

  /** Facts this actor has never acquired — the "what you never asked" query. */
  missingFor(actor: string, allFacts: string[]): string[] {
    return allFacts.filter((f) => !this.hasHeard(actor, f));
  }

  snapshot(): KnowledgeStore {
    return structuredClone(this.store);
  }

  /**
   * Produce the post-write knowledge store WITHOUT committing, so the invariant engine
   * can validate it before the consequence engine commits (item 6: all or none).
   */
  preview(effects: readonly Effect[], worldTime: number, eventId: string | null): KnowledgeStore {
    const next = structuredClone(this.store) as KnowledgeStore;
    for (const e of effects) {
      if (e.kind !== 'knowledge') continue;
      next[e.actor] = next[e.actor] ?? {};
      const prior = next[e.actor]![e.fact] ?? UNKNOWN;

      // Nothing enters knowledge implicitly, and a weaker acquisition never overwrites a
      // stronger one — being told something you already saw does not un-see it.
      const keepPrior = STRENGTH[prior.status] > STRENGTH[e.status];
      const value = e.value ?? prior.value;
      const contradicted =
        prior.status !== 'unknown' && prior.value !== null && value !== null && prior.value !== value;

      next[e.actor]![e.fact] = keepPrior
        ? { ...prior, contradicted: prior.contradicted || contradicted, provenance: [...prior.provenance, ...(eventId ? [eventId] : [])] }
        : {
            status: e.status,
            value,
            source_actor: e.source ?? null,
            acquired_at: prior.acquired_at ?? worldTime,
            fidelity: e.fidelity ?? 1,
            distortion: e.distortion ?? null,
            confidence: e.confidence ?? (e.status === 'observed' ? 0.9 : e.status === 'told' ? 0.6 : 0.5),
            contradicted: prior.contradicted || contradicted,
            provenance: [...prior.provenance, ...(eventId ? [eventId] : [])],
          };
    }
    return next;
  }

  commit(next: KnowledgeStore): void {
    this.store = next;
  }

  /** Load-time seeding only (item 3). Bypasses nothing: there is no play-time caller. */
  seed(actor: string, fact: string, record: Partial<KnowledgeRecord> & { status: KnowledgeStatus }): void {
    this.store[actor] = this.store[actor] ?? {};
    this.store[actor]![fact] = { ...UNKNOWN, confidence: 0.8, fidelity: 1, ...record };
  }

  /** Who told whom, in order — the debrief's "who misled you" query. */
  provenanceOf(actor: string, fact: string): { source: string | null; at: number | null; events: string[] } {
    const r = this.get(actor, fact);
    return { source: r.source_actor, at: r.acquired_at, events: r.provenance };
  }
}
