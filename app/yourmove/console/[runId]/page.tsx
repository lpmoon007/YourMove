import { consoleAuthorized, runDetail } from '@/lib/yourmove/console';

export const dynamic = 'force-dynamic';

// One run, read from the facilitator side: the adjudication trail, and — behind an
// explicit checkbox — the twelve-measurement leadership overlay.
export default async function ConsoleRunPage({
  params,
  searchParams,
}: {
  params: Promise<{ runId: string }>;
  searchParams: Promise<{ key?: string; lfs12?: string }>;
}) {
  const { runId } = await params;
  const { key, lfs12 } = await searchParams;
  if (!consoleAuthorized(key)) {
    return (
      <div className="ym-gate">
        <h1>Console</h1>
        <p className="ym-tagline">Not authorized.</p>
      </div>
    );
  }

  const overlayOn = lfs12 === '1';
  const d = await runDetail(runId, { lfs12: overlayOn });
  if (!d) {
    return (
      <div className="ym-gate">
        <h1>No such run</h1>
        <p className="ym-tagline">
          <a href={`/yourmove/console?key=${encodeURIComponent(key!)}`}>Back to the list</a>
        </p>
      </div>
    );
  }

  return (
    <div className="ym-console">
      <p className="ym-meta">
        <a href={`/yourmove/console?key=${encodeURIComponent(key!)}`}>← all runs</a>
      </p>
      <h1>{d.run_id}</h1>
      <p className="ym-meta">
        {d.world_title} · seed <code>{d.seed}</code> · content {d.content_version} · engine {d.engine_version} ·{' '}
        {d.status} ·{' '}
        {d.turns} turns · {d.world_time} world-minutes · {d.director_interventions} Director interventions ·{' '}
        {d.rescues_used} rescue{d.rescues_used === 1 ? '' : 's'} · {d.rejections} rejected write
        {d.rejections === 1 ? '' : 's'}
      </p>

      {d.outcome ? (
        <p className="ym-meta">
          <strong>{d.outcome.reason}</strong> — {d.outcome.headline}
        </p>
      ) : null}

      {/* ------------------------------------------------------------------
          The overlay switch. Off by default and off on every fresh load: it is
          a lens someone chooses to look through, not a setting the run carries.
         ------------------------------------------------------------------ */}
      <form className="ym-overlay-toggle" method="get">
        <input type="hidden" name="key" value={key} />
        <input type="checkbox" id="lfs12" name="lfs12" value="1" defaultChecked={overlayOn} />
        <div>
          <label htmlFor="lfs12">
            <strong>Read this run through the leadership-failure lens</strong> (the twelve measurements)
          </label>
          <p>
            Applies the Tier A / Tier B behavioral panel to what this player actually did. It is an interpretation
            taken after the fact: it did not touch the run, the player never saw it, and a marker the world never
            gave them a chance to exercise is reported as not exercised rather than as a zero.
          </p>
          <p>
            <button className="ym-chip" type="submit" style={{ marginTop: 6 }}>
              {overlayOn ? 'Refresh the read' : 'Apply the overlay'}
            </button>
          </p>
        </div>
      </form>

      {d.lfs12 ? (
        <section>
          <h2 style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 11 }}>
            {d.lfs12.lens_version} · {d.lfs12.taxonomy}
          </h2>
          <div className="ym-tierline">
            <span>
              Tier A <strong>{d.lfs12.tier_a ?? 'n/a'}</strong>
            </span>
            <span>
              Tier B <strong>{d.lfs12.tier_b ?? 'n/a'}</strong>
            </span>
            <span>
              Quadrant <strong>{d.lfs12.quadrant}</strong>
            </span>
          </div>
          <table className="ym-markers">
            <thead>
              <tr>
                <th></th>
                <th>Measurement</th>
                <th>Rate</th>
                <th>Score</th>
                <th>Read</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {d.lfs12.markers.map((m) => (
                <tr key={m.key} className={m.exercised ? '' : 'ym-marker-off'}>
                  <td>{m.key}</td>
                  <td>{m.label}</td>
                  <td>{m.raw === null ? '—' : `${Math.round(m.raw * 100)}%`}</td>
                  <td>
                    {m.normalized === null ? (
                      '—'
                    ) : (
                      <>
                        <span className="ym-bar" style={{ width: `${Math.max(2, m.normalized / 2)}px` }} />{' '}
                        {m.normalized}
                      </>
                    )}
                  </td>
                  <td>{m.read}</td>
                  <td>{m.evidence.length || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ym-meta" style={{ marginTop: 10 }}>
            {d.lfs12.note}
          </p>
        </section>
      ) : null}

      <h2 style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 11, marginTop: 28 }}>
        Adjudication trail
      </h2>
      <table>
        <thead>
          <tr>
            <th>t</th>
            <th>Typed</th>
            <th>Verb</th>
            <th>Stage 2</th>
            <th>Rule path</th>
            <th>Outcome</th>
            <th>Draw</th>
          </tr>
        </thead>
        <tbody>
          {d.moves.map((m, i) => (
            <tr key={i}>
              <td>{m.world_time}m</td>
              <td>{m.typed}</td>
              <td>{m.verb}</td>
              <td>{m.stage2}</td>
              <td>{m.rule_path}</td>
              <td>{m.outcome}</td>
              <td>{m.draw === null ? '—' : m.draw.toFixed(4)}</td>
            </tr>
          ))}
          {!d.moves.length ? (
            <tr>
              <td colSpan={7} className="ym-empty">
                No player actions yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
