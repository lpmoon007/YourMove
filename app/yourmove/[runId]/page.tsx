import { PlayApp } from '@/components/yourmove/PlayApp';
import { loadRun } from '@/lib/yourmove/actions';

export const dynamic = 'force-dynamic';

export default async function PlayPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = await loadRun(runId);
  if (!run) {
    return (
      <div className="ym-gate">
        <h1>That run is gone</h1>
        <p className="ym-tagline">
          Runs live in memory until a database is configured, so a server restart ends them. Start a new one.
        </p>
        <a className="ym-button" href="/yourmove">
          Start again →
        </a>
      </div>
    );
  }
  return <PlayApp initial={run} />;
}
