// WHAT THE WORLD NOTICES — badge rates, measured.
//
// A badge whose rarity was guessed is decoration. "Nothing Blew Up" shipped at 'notable'
// and was awarded on 264 of 264 finished runs across all eleven worlds, sitting on the
// profile page beside things almost nobody earns; six other badges were keyed on facts,
// flags and a resource that exist in exactly one world, so ten of the eleven could never
// award them at all. Neither showed up in a test, because the badge tests played the one
// world the badges were written against.
//
// This plays every world in nine shapes — the corpus long and short, commit early and
// late, spend hard, four moves and out, tell everybody, work quietly — and prints how
// often each badge actually lands, plus which badges each world can reach. Rarity is set
// from this table, not from how impressive the name sounds.
//
//   npm run audit:badges
//
// It is a TOOL, not a test: the shape mix here is deliberately extreme and real rates will
// be lower. What it is good for is the ORDERING, and for spotting a badge at 0% or 100%.

import { WORLDS } from '@/content/yourmove';
import { loadWorld, takeTurn } from '@/lib/aw';
import { awardBadges } from '@/lib/aw/play/badges';
import { observePlay } from '@/lib/aw/play/observe';

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
  ];
}

/** Every commitment the world offers, phrased so it is typeable. */
function endingsFor(pkg: any): string[] {
  const out: string[] = [];
  for (const e of pkg.verbs.filter((v: any) => v.commitment))
    if (e.requires_target) for (const c of pkg.cast) out.push(`${e.label.toLowerCase()} ${c.name.split(' ')[0]}`);
    else out.push(e.label.toLowerCase());
  return out;
}

/** Every verb that costs something, so the spending badges get a real chance. */
function spendsFor(pkg: any): string[] {
  const out: string[] = [];
  for (const v of pkg.verbs.filter((x: any) => Object.values(x.effects_by_outcome ?? {}).some((fx: any) => fx.some((e: any) => e.kind === 'resource' && e.from === 'you' && e.amount > 0))))
    if (v.requires_target) for (const c of pkg.cast) out.push(`${v.aliases[0]} ${c.name.split(' ')[0]}`);
    else out.push(v.aliases[0]);
  return out;
}

async function main() {
  const tally = new Map<string, number>();
  let runs = 0;
  const perWorld = new Map<string, Set<string>>();

  for (const pkg of WORLDS) {
    const moves = corpusFor(pkg);
    const ends = endingsFor(pkg);
    const spends = spendsFor(pkg);
    const shapes: Record<string, string[]> = {
      full: moves,
      short: moves.slice(0, 3),
      // Somebody who reads a little and then commits — the commonest real shape, and the
      // one a corpus of questions never produces.
      commit: [...moves.slice(0, 4), ...ends],
      'commit-late': [...moves.slice(0, 10), ...ends],
      // Somebody who buys their way through it.
      spend: [...spends, ...spends, ...moves.slice(0, 3), ...ends],
      // Four moves and out.
      terse: [...ends],
      // Somebody who tells people what they find.
      tell: [...moves.slice(0, 5), ...pkg.cast.map((c: any) => `tell ${c.name.split(' ')[0]} what I know`), ...ends],
      // Somebody who works quietly. Nothing in any world TEACHES this phrasing; the badge
      // is meant to be found.
      covert: [...moves.slice(0, 3).map((m: string) => `quietly ${m}`), ...pkg.cast.map((c: any) => `quietly ask ${c.name.split(' ')[0]} what they saw`), ...ends],
      // Somebody who spends everything they were handed.
      broke: [...spends, ...spends, ...spends, ...spends, ...spends, ...ends],
    };
    for (let s = 0; s < 4; s++) {
      for (const style of Object.keys(shapes)) {
        const world = loadWorld(pkg, { run_id: `b-${pkg.slug}-${s}-${style}`, seed: `${pkg.slug}-s${s}`, now: () => new Date().toISOString() });
        const list = shapes[style]!;
        for (const m of list) {
          if (world.ended) break;
          await takeTurn(world, m);
        }
        let guard = 0;
        while (!world.ended && guard++ < 40) await takeTurn(world, 'wait');
        if (!world.ended) continue;
        runs++;
        const ev = observePlay(world);
        const badges = awardBadges(world, ev);
        const set = perWorld.get(pkg.slug) ?? new Set<string>();
        for (const b of badges) { tally.set(b.id, (tally.get(b.id) ?? 0) + 1); set.add(b.id); }
        perWorld.set(pkg.slug, set);
      }
    }
  }

  console.log(`runs: ${runs}`);
  for (const [id, n] of [...tally].sort((a, b) => b[1] - a[1]))
    console.log(`  ${(n / runs * 100).toFixed(0).padStart(3)}%  ${id}  (${n})`);
  console.log('\nper world:');
  for (const [w, set] of perWorld) console.log(`  ${w.padEnd(18)} ${[...set].join(', ') || '(none)'}`);

}
main();
