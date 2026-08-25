import { notFound, redirect } from 'next/navigation';

import { WorldBrief } from '@/components/yourmove/WorldBrief';
import { WORLDS, worldBySlug } from '@/content/yourmove';
import { startRun } from '@/lib/yourmove/actions';

export const dynamic = 'force-dynamic';

/** One world's brief. The same screen the front door shows when there is only one. */
export default async function WorldPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seed?: string; opening?: string }>;
}) {
  const { slug } = await params;
  const pkg = worldBySlug(slug);
  if (!pkg) notFound();

  const { seed, opening } = await searchParams;
  const chosen = seed?.trim() || `${pkg.slug}-001`;

  // Arriving with a move already made: the taster on the front of the house sent them,
  // and the first turn is played the moment the run starts.
  const carried = pkg.world.opening?.choices.find((c) => c.id === opening);
  if (carried) redirect(`/world/${pkg.slug}/begin?opening=${encodeURIComponent(carried.id)}&seed=${encodeURIComponent(chosen)}`);

  async function begin() {
    'use server';
    const run = await startRun(pkg!.slug, chosen);
    redirect(`/yourmove/${run.run_id}`);
  }

  return (
    <WorldBrief
      pkg={pkg}
      seed={chosen}
      begin={begin}
      others={WORLDS.filter((w) => w.slug !== pkg.slug).map((w) => ({
        slug: w.slug,
        title: w.title,
        genre: w.genre,
      }))}
    />
  );
}
