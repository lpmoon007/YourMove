import { redirect } from 'next/navigation';

import { LAST_JOB } from '@/content/yourmove/last-job';
import { startRun } from '@/lib/yourmove/actions';

// The entry. Content contract on one screen, acknowledged once, then a single Play
// button (core flow 2-3). No account, no exposition dump — the cold open does that job.
export default async function YourMoveEntry({ searchParams }: { searchParams: Promise<{ seed?: string }> }) {
  const cd = LAST_JOB.content_descriptors;
  // V1A holds the seed fixed (the build order defers per-run variation to V1C), but the
  // seed infrastructure is live now, so an author can demonstrate a different world by
  // asking for one. Turning this into the default is a one-line change in V1C.
  const { seed } = await searchParams;
  const chosen = seed?.trim() || 'last-job-001';

  async function begin() {
    'use server';
    const run = await startRun(chosen);
    redirect(`/yourmove/${run.run_id}`);
  }

  return (
    <div className="ym-gate">
      <h1>{LAST_JOB.title}</h1>
      <p className="ym-tagline">{LAST_JOB.tagline}</p>

      <div className="ym-contract">
        <h2>What this contains</h2>
        <ul>
          {cd.depicted.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <h2>What you can do</h2>
        <ul>
          {cd.player_action_bounds.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="ym-meta">
          About {cd.estimated_minutes} minutes · intensity: {cd.intensity} · you type whatever you want, in plain
          English, and the world answers with what actually follows.
        </p>
        <p className="ym-meta">
          seed <code>{chosen}</code> — the answers were decided before you arrived and will not change because you
          argue well.
        </p>
      </div>

      <form action={begin}>
        <button className="ym-button" type="submit">
          Start the clock →
        </button>
      </form>
    </div>
  );
}
