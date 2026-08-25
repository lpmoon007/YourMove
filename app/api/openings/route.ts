import { WORLDS } from '@/content/yourmove';

export const dynamic = 'force-dynamic';

/**
 * The 90-second moments, for whatever is running on the front of the house.
 *
 * It reads them from here rather than keeping its own copy, because a copy drifts: the
 * moment a verb changes or a world is renamed, a hand-written taster starts offering
 * moves this engine cannot take, and "enter the full world" becomes a door into nothing.
 *
 * Public, read-only, and nothing in it is a secret — it is marketing copy plus the link
 * that plays it. `enter` is the whole handover: send somebody there and their run starts
 * with that move already made.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const openings = WORLDS.filter((w) => w.world.opening).map((w) => ({
    world: w.slug,
    title: w.title,
    genre: w.genre,
    tagline: w.tagline,
    estimated_minutes: w.content_descriptors.estimated_minutes,
    prompt: w.world.opening!.prompt,
    choices: w.world.opening!.choices.map((c) => ({
      id: c.id,
      label: c.label,
      preview: c.preview,
      enter: `${origin}/world/${w.slug}?opening=${encodeURIComponent(c.id)}`,
    })),
  }));

  return Response.json(
    { openings },
    {
      headers: {
        // Read by a different site on a different domain, and there is nothing here worth
        // protecting — it is the copy that is meant to be shown to strangers.
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=60, stale-while-revalidate=600',
      },
    },
  );
}
