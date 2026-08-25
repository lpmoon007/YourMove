import { redirect } from 'next/navigation';

import { WorldBrief } from '@/components/yourmove/WorldBrief';
import { DEFAULT_WORLD, WORLDS } from '@/content/yourmove';
import { startRun } from '@/lib/yourmove/actions';

// The front door.
//
// With one world this IS that world's brief: making somebody choose from a list of one
// is a click that teaches nothing. With several it is the lobby. Neither screen is a
// special case in the code — the list decides.
export default async function Entry({ searchParams }: { searchParams: Promise<{ seed?: string }> }) {
  const { seed } = await searchParams;

  if (WORLDS.length > 1) return <Lobby />;

  const chosen = seed?.trim() || `${DEFAULT_WORLD.slug}-001`;
  async function begin() {
    'use server';
    const run = await startRun(DEFAULT_WORLD.slug, chosen);
    redirect(`/yourmove/${run.run_id}`);
  }
  return <WorldBrief pkg={DEFAULT_WORLD} seed={chosen} begin={begin} others={[]} />;
}

function Lobby() {
  return (
    <div className="ym-gate">
      <p className="ym-wordmark">Your Move</p>
      <h1>Pick a world.</h1>
      <p className="ym-tagline">
        Each one drops you into a situation already in progress, with a clock running and people who want different
        things. You type what you would actually do. The world answers.
      </p>
      <ul className="ym-world-list">
        {WORLDS.map((w) => (
          <li key={w.slug}>
            <a href={`/world/${w.slug}`}>
              <strong>{w.title}</strong>
              <span>{w.genre}</span>
              <span className="ym-world-tagline">{w.tagline}</span>
              <span className="ym-meta">
                About {w.content_descriptors.estimated_minutes} minutes · intensity: {w.content_descriptors.intensity}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p>
        <a className="ym-button" href="/how-you-play">
          How you play →
        </a>
      </p>
    </div>
  );
}
