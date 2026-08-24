import { PlayApp } from '@/components/yourmove/PlayApp';
import { loadRun } from '@/lib/yourmove/actions';

export const dynamic = 'force-dynamic';

export default async function PlayPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = await loadRun(runId);
  if (!run) {
    return (
      <div className="ym-gate">
        <h1>That night is over</h1>
        <p className="ym-tagline">
          This run has expired and cannot be picked back up. The room is still there, though, and it starts the
          same way every time.
        </p>
        <a className="ym-button" href="/">
          Start a new one →
        </a>
      </div>
    );
  }
  return <PlayApp initial={run} />;
}
