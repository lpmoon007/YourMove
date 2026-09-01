// WHAT NEVER HAPPENS.
//
// Three Director rescues shipped for months having never once fired: the line printed, the
// write was rejected, the stuck player got nothing. Nothing said so, because a world with
// dead content passes every test a world with live content passes.
//
// This plays every world hard — its own corpus forwards and backwards, every ending on a
// seed for every value of every seeded variable, informed pressure on each character after
// establishing a few facts first, and a long stall for the time-triggered beats — and
// reports the overrides, injects and processes it never managed to reach.
//
// It is a TOOL and not a test, deliberately. Reachability is not decidable and the last few
// items on its list are usually hard rather than dead: getting to zero would mean encoding
// each world's own preconditions here, which is the world's job. Read the list and judge.
// The parts that ARE decidable — a flag nothing sets, a branch with no words of its own, a
// source who cannot disclose, a walk faster than the map — are validator rules instead.
//
//   npm run audit:aw
//
// Every finding so far came from disbelieving the first output: four rounds of this
// harness were wrong before the worlds were.

import { WORLDS } from '@/content/yourmove';
import { loadWorld, takeTurn } from '@/lib/aw';

function surfaceOf(pkg: any) {
  return {
    things: pkg.entities.filter((e: any) => e.searchable).map((e: any) => e.name.replace(/^the /, '')),
    look: pkg.verbs.find((v: any) => v.object_verb)?.aliases[0] ?? 'look at',
    pressure: pkg.verbs.find((v: any) => v.id !== 'ask' && v.speech && v.requires_target)?.aliases[0] ?? 'ask',
  };
}

function corpusFor(pkg: any): string[] {
  const people = pkg.cast.map((c: any) => c.name.split(' ')[0]!);
  const things = pkg.entities.filter((e: any) => e.searchable).map((e: any) => e.name.replace(/^the /, ''));
  const look = pkg.verbs.find((v: any) => v.object_verb)?.aliases[0] ?? 'look at';
  const pressure = pkg.verbs.find((v: any) => v.id !== 'ask' && v.speech && v.requires_target)?.aliases[0] ?? 'ask';
  return [
    ...pkg.world.example_actions,
    ...(pkg.world.opening?.choices ?? []).map((c: any) => c.move),
    ...things.map((t: string) => `${look} the ${t}`),
    ...people.map((n: string) => `ask ${n} what they saw`),
    ...people.map((n: string) => `${pressure} ${n}`),
    ...people.map((n: string) => `${n}, how sure are you?`),
    ...things.map((t: string) => `${look} the ${t}`),          // second pass: repeats
    ...people.map((n: string) => `${pressure} ${n}`),
    pkg.verbs.find((v: any) => !v.requires_target && !v.commitment)?.aliases[0] ?? 'wait',
  ];
}

// Checked by hand and reached, with the move that did it. Generic play does not get to
// these — each needs a phrasing or a precondition this harness does not know to build —
// so they are listed as answered rather than as questions. Anything NOT in here that the
// audit reports is a question nobody has answered yet.
const VERIFIED_REACHABLE: Record<string, string> = {
  'late-edition/o_promise_priya': '"promise Priya the source is protected"',
  'late-edition/i_nell_threatens': 'press Nell repeatedly until her trust falls under twenty',
  'late-edition/w_nell_goes': 'the above, then let the clock reach 26',
  'four-minutes/o_ellis_turns': '"press Ellis about who is paying him" — the bare press has no topic to match',
  'no-prey-no-pay/o_corner_coyle': 'read the watch bill and the chart first, then press Coyle',
  'no-prey-no-pay/w_coyle_goes_up': 'the above, then wait',
  'no-prey-no-pay/o_pay_tuck': '"pay Tuck forty pieces"',
  'the-fair-copy/o_assure_vane': '"assure Vane"',
  'the-fair-copy/o_charge_kearns_right': '"name the forger Kearns" on a seed where the hand is the adjutant',
};

async function main() {
  let totalDead = 0;
  let unexplained = 0;
  for (const pkg of WORLDS as any[]) {
    const firedInjects = new Set<string>();
    const firedProcesses = new Set<string>();
    const firedOverrides = new Set<string>();
    const corpus = corpusFor(pkg);
    const { things, look, pressure } = surfaceOf(pkg);
    const endings = pkg.verbs.filter((v: any) => v.commitment);

    const collect = (w: any, t: any) => {
      for (const k of Object.keys(w.counters.fired_at_turn)) {
        if (k.startsWith('inject:')) firedInjects.add(k.slice(7));
        if (k.startsWith('process:')) firedProcesses.add(k.slice(8));
      }
      const rule = t?.adjudication?.stage3_rule_path;
      if (typeof rule === 'string' && rule.startsWith('override:')) firedOverrides.add(rule.slice(9).replace(/:(matched|unmatched)$/, ''));
    };

    // Seeds chosen so every value of every seeded variable is actually reached. The
    // truth-gated branches of an ending only fire on their own truth, so sampling six
    // seeds made half of them look dead when they were simply never drawn.
    const wanted = new Map<string, string>();
    const varIds = (pkg.truth_template?.variables ?? []).map((v: any) => v.id);
    const factFor = (vid: string) =>
      Object.entries(pkg.truth_template.facts).find(([, d]: any) => d.from_variable === vid)?.[0];
    for (let i = 0; i < 200 && wanted.size < 40; i++) {
      const probe = loadWorld(pkg, { run_id: 'probe', seed: `${pkg.slug}-audit-${i}` });
      const key = varIds.map((v: string) => String(probe.truth.read(factFor(v) ?? ''))).join('|');
      if (!wanted.has(key)) wanted.set(key, `${pkg.slug}-audit-${i}`);
    }
    for (const seed of wanted.values()) {
      // 1. the whole corpus in order, as deep as the clock allows
      {
        const w = loadWorld(pkg, { run_id: `a-${seed}`, seed });
        for (const m of corpus) { const t = await takeTurn(w, m); collect(w, t); if (t.ended) break; }
      }
      // 2. the corpus reversed, so late-gated content gets a different route in
      {
        const w = loadWorld(pkg, { run_id: `b-${seed}`, seed });
        for (const m of [...corpus].reverse()) { const t = await takeTurn(w, m); collect(w, t); if (t.ended) break; }
      }
      // 3. each ending, on turn one AND after a short run-up. Ten moves of run-up spent
      //    the whole clock in the shorter worlds, so the ending never got typed at all —
      //    which made every ending override look dead when they all work.
      for (const e of endings) {
        for (const runUp of [[], corpus.slice(0, 3), corpus.slice(0, 5)]) {
          const w = loadWorld(pkg, { run_id: `c-${seed}-${e.id}-${runUp.length}`, seed });
          // A commitment that needs a target is blocked by its bare label, so name somebody.
          const forms = e.requires_target
            ? pkg.cast.map((c: any) => `${e.label.toLowerCase()} ${c.name.split(' ')[0]}`)
            : [e.label.toLowerCase(), ...e.aliases.slice(0, 2)];
          for (const m of [...runUp, ...forms]) {
            const t = await takeTurn(w, m); collect(w, t); if (t.ended) break;
          }
        }
      }
      // 4a. informed pressure: establish a few facts FIRST, then lean on each person in
      //     turn. The corpus reads every object before it speaks to anybody, which spends
      //     the whole clock in a twelve-minute world — so the cornering overrides, which
      //     need two facts and then a press, never got their press.
      for (const person of pkg.cast) {
        const name = person.name.split(' ')[0];
        for (const n of [2, 3, 4]) {
          const w = loadWorld(pkg, { run_id: `p-${seed}-${person.id}-${n}`, seed });
          const reads = things.slice(0, n).map((t: string) => `${look} the ${t}`);
          for (const m of [...reads, `${pressure} ${name}`, `tell ${name} what I know`, `${pressure} ${name}`, 'wait', 'wait']) {
            const t = await takeTurn(w, m); collect(w, t); if (t.ended) break;
          }
        }
      }

      // 4b. a long stall, so time-triggered content has every chance
      {
        const w = loadWorld(pkg, { run_id: `d-${seed}`, seed });
        for (let i = 0; i < 30; i++) { const t = await takeTurn(w, 'wait'); collect(w, t); if (t.ended) break; }
      }
    }

    const dead: string[] = [];
    for (const i of pkg.injects ?? []) if (!firedInjects.has(i.id)) dead.push(`inject ${i.id}`);
    for (const w of pkg.processes ?? []) if (!firedProcesses.has(w.id)) dead.push(`process ${w.id}`);
    for (const o of pkg.overrides ?? []) if (!firedOverrides.has(o.id)) dead.push(`override ${o.id}`);
    totalDead += dead.length;
    const n = (pkg.injects?.length ?? 0) + (pkg.processes?.length ?? 0) + (pkg.overrides?.length ?? 0);
    const open = dead.filter((d) => !VERIFIED_REACHABLE[`${pkg.slug}/${d.split(' ')[1]}`]);
    const answered = dead.length - open.length;
    console.log(
      `${pkg.slug.padEnd(17)} ${String(n - dead.length).padStart(2)}/${String(n).padEnd(2)} fired` +
        (answered ? `   (${answered} checked by hand, reachable)` : '') +
        (open.length ? `   UNEXPLAINED: ${open.join(', ')}` : ''),
    );
    unexplained += open.length;
  }
  console.log(`\n${totalDead} never fired here; ${unexplained} of those are unexplained.`);
  if (!unexplained) console.log('Everything else on that list has been driven by hand and reaches.');
}
main();
