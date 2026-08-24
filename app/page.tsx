import { redirect } from 'next/navigation';

import { LAST_JOB } from '@/content/yourmove/last-job';
import { startRun } from '@/lib/yourmove/actions';

// The front door (core flow 2-3). One screen, then you are in the room.
//
// The cold open is supposed to land the player with a DEFINED ROLE, a visible clock, an
// incomplete brief and one immediate pressure. This screen supplies the first, the third
// and the fourth; the clock starts on the next one. It is orientation, not exposition:
// enough to know what you are doing and nothing about what is actually going on.
export default async function Entry({ searchParams }: { searchParams: Promise<{ seed?: string }> }) {
  const w = LAST_JOB.world;
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
      <p className="ym-wordmark">Your Move</p>
      <h1>{LAST_JOB.title}</h1>
      <p className="ym-tagline">{LAST_JOB.tagline}</p>

      <div className="ym-brief">
        <div className="ym-brief-row">
          <h2>You are</h2>
          <p>
            <strong>{w.player.role}</strong> — {w.player.you}
          </p>
        </div>
        <div className="ym-brief-row">
          <h2>Where</h2>
          <p>{w.premise}</p>
        </div>
        <div className="ym-brief-row">
          <h2>Right now</h2>
          <p>{w.player.pressure}</p>
        </div>
        <div className="ym-brief-row ym-brief-goal">
          <h2>What you want</h2>
          <p>{w.player.objective}</p>
        </div>
      </div>

      <div className="ym-brief">
        <div className="ym-brief-row">
          <h2>How this works</h2>
          <ul className="ym-how">
            <li>
              <strong>Type what you would actually do</strong>, in plain English — “ask Dez what he saw”, “read the
              call log”, “offer Marla ten grand”. Not commands. Sentences.
            </li>
            <li>
              <strong>Every action costs time.</strong> You have {w.duration_minutes} minutes and the clock only moves
              forward. Waiting is a move too.
            </li>
            <li>
              <strong>Nobody in the room is neutral.</strong> One of them is wrong about something and sure of it.
              One of them will lie to your face. You cannot tell which by how they behave.
            </li>
            <li>
              <strong>Naming someone ends it.</strong> So does walking out. Everything else, you can come back from.
            </li>
          </ul>
        </div>
      </div>

      <details className="ym-contract">
        <summary>What this contains, and what you are allowed to do</summary>
        <h2>Depicted</h2>
        <ul>
          {cd.depicted.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <h2>Your bounds</h2>
        <ul>
          {cd.player_action_bounds.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="ym-meta">
          About {cd.estimated_minutes} minutes · intensity: {cd.intensity} · seed <code>{chosen}</code> — the answers
          were decided before you arrived and will not change because you argue well.
        </p>
      </details>

      <form action={begin}>
        <button className="ym-button" type="submit">
          Start the clock →
        </button>
      </form>
    </div>
  );
}
