// ITEM 4 — the Canonical Truth Layer. The hidden answers.
//
// L2: written exactly once, at load, from the seed. No system, no model, no Director,
// no player argument changes it. This class has no setter after seal(), and the
// invariant engine re-checks its fingerprint on EVERY write (item 6, Truth class), so a
// mutation anywhere — including engine-internal — fails the integrity suite.
//
// It is structurally separate from world state so no generic state write can reach it,
// and it is never handed to the Narrator or to character prompt construction.

import type { Rng } from './rng';
import type { TruthTemplate } from './package';

export class TruthLayer {
  private values: Record<string, string>;
  private bindings: Record<string, string>;
  private sealed = false;
  private fingerprintCache = '';

  private constructor(values: Record<string, string>, bindings: Record<string, string>) {
    this.values = values;
    this.bindings = bindings;
  }

  /** Draw canonical truth from the template + the seed. Called once, by the loader. */
  static draw(template: TruthTemplate, rng: Rng): TruthLayer {
    const vars: Record<string, string> = {};
    for (const v of template.variables) {
      if (v.kind === 'choice') vars[v.id] = rng.pick(`truth:${v.id}`, v.choices ?? [], v.weights);
      else vars[v.id] = String(rng.int(`truth:${v.id}`, v.min ?? 0, v.max ?? 1));
    }
    const values: Record<string, string> = {};
    for (const [factId, src] of Object.entries(template.facts)) {
      values[factId] = src.from_variable ? (vars[src.from_variable] ?? '') : String(src.value ?? '');
    }
    const bindings: Record<string, string> = {};
    for (const [token, varId] of Object.entries(template.bindings)) bindings[`@${token}`] = vars[varId] ?? '';
    const layer = new TruthLayer(values, bindings);
    layer.seal();
    return layer;
  }

  /** Restore for replay. Truth is part of the run record; it is never re-drawn. */
  static restore(values: Record<string, string>, bindings: Record<string, string>): TruthLayer {
    const layer = new TruthLayer({ ...values }, { ...bindings });
    layer.seal();
    return layer;
  }

  private seal(): void {
    this.values = Object.freeze({ ...this.values });
    this.bindings = Object.freeze({ ...this.bindings });
    this.fingerprintCache = fingerprint(this.values);
    this.sealed = true;
    Object.freeze(this);
  }

  /** ENGINE ONLY. Never reachable from a projection, a prompt, or a package. */
  read(factId: string): string | undefined {
    return this.values[factId];
  }

  /** Resolve a binding token like '@culprit' to the drawn value. */
  bind(token: string): string | undefined {
    return this.bindings[token];
  }

  isBinding(token: string): boolean {
    return token in this.bindings;
  }

  /** Engine-only snapshot for the resolver, the outcome scorer, and the reveal screen
   *  (the reveal happens AFTER the run ends, never during play). */
  entries(): Readonly<Record<string, string>> {
    return this.values;
  }

  /** Item 6, Truth invariant: unchanged since load. Compared on every write. */
  fingerprint(): string {
    return this.fingerprintCache;
  }

  verifyUnchanged(): boolean {
    return this.sealed && fingerprint(this.values) === this.fingerprintCache;
  }
}

function fingerprint(values: Record<string, string>): string {
  const canonical = Object.keys(values)
    .sort()
    .map((k) => `${k}=${values[k]}`)
    .join('');
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < canonical.length; i++) {
    h1 = Math.imul(h1 ^ canonical.charCodeAt(i), 16777619) >>> 0;
    h2 = Math.imul(h2 + canonical.charCodeAt(i) * (i + 1), 2246822519) >>> 0;
  }
  return `${h1.toString(16)}${h2.toString(16)}`;
}
