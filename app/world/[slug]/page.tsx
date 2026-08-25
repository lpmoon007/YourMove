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
  searchParams: Promise<{ seed?: string }>;
}) {
  const { slug } = await params;
  const pkg = worldBySlug(slug);
  if (!pkg) notFound();

  const { seed } = await searchParams;
  const chosen = seed?.trim() || `${pkg.slug}-001`;

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
