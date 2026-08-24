import { consoleAuthorised, listRuns } from '@/lib/yourmove/console';

export const dynamic = 'force-dynamic';

// The facilitator console. Not part of the game: nothing here is reachable from the
// player's app, and nothing here can change a run.
export default async function ConsolePage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  if (!consoleAuthorised(key)) {
    return (
      <div className="ym-gate">
        <h1>Console</h1>
        <p className="ym-tagline">
          Append <code>?key=…</code> with the value of <code>YOURMOVE_CONSOLE_SECRET</code>. If that variable is not
          set, the console stays shut.
        </p>
      </div>
    );
  }

  const runs = await listRuns();
  return (
    <div className="ym-console">
      <h1>Your Move — runs</h1>
      <p className="ym-meta">
        {runs.length} run{runs.length === 1 ? '' : 's'} on record. Open one to read its adjudication trail, and to
        apply the twelve-measurement leadership overlay if you want that view of it.
      </p>
      <table>
        <thead>
          <tr>
            <th>Run</th>
            <th>Seed</th>
            <th>Status</th>
            <th>Turns</th>
            <th>Outcome</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.run_id}>
              <td>
                <a href={`/yourmove/console/${r.run_id}?key=${encodeURIComponent(key!)}`}>{r.run_id}</a>
              </td>
              <td>{r.seed}</td>
              <td>{r.status}</td>
              <td>{r.turns}</td>
              <td>{r.headline ?? '—'}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {!runs.length ? (
            <tr>
              <td colSpan={6} className="ym-empty">
                Nothing yet. Play a run at <a href="/yourmove">/yourmove</a>.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
