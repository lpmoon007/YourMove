import { debrief } from '@/lib/yourmove/actions';

export const dynamic = 'force-dynamic';

// ITEMS 24-26 — the multi-axis outcome, the reveal, and the causal debrief.
// This is the only screen in the product where canonical truth is ever rendered, and it
// is reachable only after the run has ended.
export default async function DebriefPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const d = await debrief(runId);

  if ('error' in d) {
    return (
      <div className="ym-gate">
        <h1>Not yet</h1>
        <p className="ym-tagline">{d.error}</p>
        <a className="ym-button" href={`/yourmove/${runId}`}>
          Back to the room →
        </a>
      </div>
    );
  }

  const found = d.reveal.truth.filter((t) => t.player_status !== 'unknown');
  const wrong = found.filter((t) => t.correct === false);

  return (
    <div className="ym-debrief">
      <h1>{d.title}</h1>
      <p className="ym-tagline">
        {d.outcome.reason} · {d.outcome.headline}
      </p>

      <div className="ym-axes">
        {d.outcome.axes.map((a) => (
          <div className="ym-axis" key={a.key}>
            <h3>{a.label}</h3>
            <div className="ym-band">{a.band}</div>
            <ul>
              {a.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2>What was actually true</h2>
      <ul className="ym-truth">
        {d.reveal.truth.map((t) => (
          <li key={t.fact} className={t.correct === true ? 'ym-right' : t.correct === false ? 'ym-wrong' : 'ym-missed'}>
            {t.statement}
            {t.player_status === 'unknown' ? (
              <span className="ym-fact-tag"> you never found this out</span>
            ) : t.correct === false ? (
              <span className="ym-fact-tag"> you had it as: {t.player_believed}</span>
            ) : (
              <span className="ym-fact-tag"> you had this right</span>
            )}
          </li>
        ))}
      </ul>

      {d.reveal.lied_to.length ? (
        <>
          <h2>Who told you something that was not so</h2>
          <ul className="ym-truth">
            {d.reveal.lied_to.map((l, i) => (
              <li key={i}>
                <strong>{l.liar_display}</strong> said {l.told_you}. It was {l.actually ?? 'not that'}.{' '}
                {l.sincere ? 'They believed it.' : 'They knew better.'}
                <span className="ym-fact-tag">why: {l.why}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {d.reveal.never_found.length ? (
        <>
          <h2>What you never asked</h2>
          <ul className="ym-truth">
            {d.reveal.never_found.map((n) => (
              <li key={n.fact} className="ym-missed">
                {n.statement}
                {n.paths.map((p, i) => (
                  <span className="ym-fact-tag" key={i}>
                    you could have: {p}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>What your moves caused</h2>
      <ul className="ym-chain">
        {d.chains.map((c) => (
          <li key={c.trigger.event_id}>
            <strong>
              {c.trigger.world_time}m — {c.trigger.line}
            </strong>
            <ul>
              {c.consequences.slice(0, 4).map((s) => (
                <li key={s.event_id} className={s.player_caused ? '' : 'ym-missed'}>
                  ↳ {s.line}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {!d.chains.length ? <li className="ym-missed">Nothing you did echoed. That is its own result.</li> : null}
      </ul>

      <p className="ym-meta" style={{ marginTop: 28 }}>
        seed <code>{d.seed}</code> · content {d.content_version} · {Math.round(d.director_share * 100)}% of what
        happened was introduced by the Director rather than by you.{' '}
        {found.length} fact{found.length === 1 ? '' : 's'} found, {wrong.length} of them wrong.
      </p>
      <p>
        <a className="ym-button" href="/yourmove">
          Again, from the top →
        </a>
      </p>
    </div>
  );
}
