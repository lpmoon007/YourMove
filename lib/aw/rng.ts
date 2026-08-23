// L11 — determinism. Every randomized construction and every resolution draw comes
// from here, and from nowhere else. `Math.random` must not appear anywhere in lib/aw.
//
// Streams are named and counted independently, so adding a draw in one part of the
// engine does not shift the numbers every other part receives. That is what makes a
// stored run replay to an identical final state after the engine changes elsewhere.

export interface RngSnapshot {
  seed: string;
  counters: Record<string, number>;
}

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

export class Rng {
  readonly seed: string;
  private counters: Record<string, number>;

  constructor(seed: string, counters: Record<string, number> = {}) {
    this.seed = seed;
    this.counters = { ...counters };
  }

  /** A uniform draw in [0,1) from the named stream. */
  draw(label: string): number {
    const n = (this.counters[label] ?? 0) + 1;
    this.counters[label] = n;
    return xmur3(`${this.seed}|${label}|${n}`)() / 4294967296;
  }

  /** Inclusive integer draw. */
  int(label: string, min: number, max: number): number {
    return min + Math.floor(this.draw(label) * (max - min + 1));
  }

  pick<T>(label: string, items: readonly T[], weights?: readonly number[]): T {
    if (!items.length) throw new Error(`Rng.pick called with no items (${label})`);
    const w = weights && weights.length === items.length ? weights : items.map(() => 1);
    const total = w.reduce((a, b) => a + b, 0);
    let r = this.draw(label) * total;
    for (let i = 0; i < items.length; i++) {
      r -= w[i]!;
      if (r <= 0) return items[i]!;
    }
    return items[items.length - 1]!;
  }

  snapshot(): RngSnapshot {
    return { seed: this.seed, counters: { ...this.counters } };
  }

  static restore(s: RngSnapshot): Rng {
    return new Rng(s.seed, s.counters);
  }
}

/** A stable id derived from the seed — so even ids are reproducible across replays. */
export function seededId(seed: string, label: string, n: number): string {
  const h = xmur3(`${seed}|${label}|${n}`);
  const a = h().toString(16).padStart(8, '0');
  const b = h().toString(16).padStart(8, '0');
  return `${label}_${a}${b}`;
}
