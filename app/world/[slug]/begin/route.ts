import { redirect } from 'next/navigation';

import { worldBySlug } from '@/content/yourmove';
import { startRun } from '@/lib/yourmove/actions';

export const dynamic = 'force-dynamic';

/**
 * The door in from the 90-second version.
 *
 * Somebody out on the front of the house read a moment and made a move on it. This starts
 * their run and plays that move for real — same engine, same rules, same seeded draw as
 * any other turn. What they were promised would happen and what actually happens are
 * allowed to differ, and usually should.
 *
 * A route handler rather than a page, deliberately: starting a run mints this browser's
 * device id, and Next.js refuses to write a cookie while a page is rendering. As a page
 * this was a 500 on the one link the whole handover depends on.
 */
export async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const pkg = worldBySlug(slug);
  if (!pkg) redirect('/');

  const url = new URL(request.url);
  const opening = url.searchParams.get('opening') ?? undefined;
  const seed = url.searchParams.get('seed') ?? undefined;

  // An opening that does not exist is not worth an error page: show them the brief and
  // let them start it themselves.
  const choice = pkg.world.opening?.choices.find((c) => c.id === opening);
  if (!choice) redirect(`/world/${pkg.slug}`);

  const run = await startRun(pkg.slug, seed, choice.id);
  redirect(`/yourmove/${run.run_id}`);
}
