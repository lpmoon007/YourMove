import { debrief } from '@/lib/yourmove/actions';

export const dynamic = 'force-dynamic';

// The reveal and the causal debrief. The only screen where canonical truth is ever
// rendered, and it is reachable only after the run has ended.
//
// Everything here is written for someone who has played once and knows nothing else. No
// engine vocabulary reaches this page: no "Director", no event verbs, no actor ids, no
// content versions. If a line here needs the codebase to make sense, it is a defect.
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

  const learned = d.reveal.truth.filter((t) => t.player_status !== 'unknown');
  const wrong = learned.filter((t) => t.correct === false);

  return (
    <div className="ym-debrief">
      <p className="ym-wordmark">How it ended</p>
      <h1>{d.title}</h1>
      <p className="ym-ending">{d.outcome.reason}</p>

      <h2>Where that leaves you</h2>
      <div className="ym-axes">
        {d.outcome.axes.map((a) => (
          <div className="ym-axis" key={a.key}>
            <h3>{a.label}</h3>
            <div className="ym-band">{a.band}</div>
            <p className="ym-axis-q">{a.question}</p>
            <ul>
              {a.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
              {!a.notes.length ? <li>nothing moved this either way</li> : null}
            </ul>
          </div>
        ))}
      </div>

      <h2>What was actually true</h2>
      <p className="ym-section-note">
        Decided before you walked in, and unchanged by anything anyone said. This is the first time you are
        seeing it.
      </p>
      <ul className="ym-truth">
        {d.reveal.truth.map((t) => (
          <li key={t.fact} className={t.correct === true ? 'ym-right' : t.correct === false ? 'ym-wrong' : 'ym-missed'}>
            {t.statement}
            {t.player_status === 'unknown' ? (
              <span className="ym-fact-tag">you never found this out</span>
            ) : t.correct === false ? (
              <span className="ym-fact-tag">you left believing: {t.player_believed}</span>
            ) : (
              <span className="ym-fact-tag">you had this right</span>
            )}
          </li>
        ))}
      </ul>

      {d.reveal.lied_to.length ? (
        <>
          <h2>What you were told that was wrong</h2>
          <ul className="ym-truth">
            {d.reveal.lied_to.map((l, i) => (
              <li key={i} className={l.sincere ? '' : 'ym-wrong'}>
                You asked {l.about}. <strong>{l.liar_display}</strong> said <em>{l.told_you}</em>. It was actually{' '}
                <em>{l.actually ?? 'something else'}</em>.
                <span className="ym-fact-tag">{l.why}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {d.reveal.never_found.length ? (
        <>
          <h2>What you never found out</h2>
          <p className="ym-section-note">
            All of this was reachable in the nineteen minutes you had. Each line lists the ways there were to get
            it.
          </p>
          <ul className="ym-truth">
            {d.reveal.never_found.map((n) => (
              <li key={n.fact} className="ym-missed">
                You never found out {n.statement}.
                {n.paths.map((p, i) => (
                  <span className="ym-fact-tag" key={i}>
                    {p}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>What your moves set off</h2>
      <p className="ym-section-note">
        Everything below is traced from what you typed. Nothing here is a guess about your reasoning.
      </p>
      <ul className="ym-chain">
        {d.chains.map((c) => (
          <li key={c.trigger.event_id}>
            <strong>
              <span className="ym-chain-time">{c.trigger.world_time} min</span> you typed: “{c.trigger.line}”
            </strong>
            <ul>
              {c.consequences.slice(0, 4).map((s) => (
                <li key={s.event_id}>↳ {s.line}</li>
              ))}
            </ul>
          </li>
        ))}
        {!d.chains.length ? (
          <li className="ym-missed">Nothing you did echoed anywhere. That is its own kind of result.</li>
        ) : null}
      </ul>

      <h2>How you played this one</h2>
      <p className="ym-section-note">{d.run_card.sentence}</p>
      <div className="ym-runcard">
        {d.run_card.reads.slice(0, 6).map((r) => (
          <div className="ym-runcard-row" key={r.dimension}>
            <span className="ym-runcard-label">{r.position! < 0 ? r.left : r.right}</span>
            <span className="ym-runcard-bar">
              <span style={{ width: `${Math.round(Math.abs(r.position!) * 100)}%` }} />
            </span>
          </div>
        ))}
        {!d.run_card.reads.length ? <p className="ym-missed">Too few moves to read anything from.</p> : null}
      </div>

      {d.badges.length ? (
        <>
          <h2>The world noticed</h2>
          <ul className="ym-badges">
            {d.badges.map((b) => (
              <li key={b.id} className={`ym-badge ym-rarity-${b.rarity}`}>
                <strong>{b.name}</strong>
                <span className="ym-badge-rarity">{b.rarity}</span>
                <span className="ym-badge-for">{b.earned_for}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>The run in numbers</h2>
      <ul className="ym-truth">
        <li>
          You learned {learned.length} of the {d.reveal.truth.length} things there were to know
          {wrong.length ? `, and were wrong about ${wrong.length} of them` : ''}.
        </li>
        <li>
          {d.unprompted_events} thing{d.unprompted_events === 1 ? '' : 's'} happened tonight that you did not set in
          motion. The room moves whether or not you do.
        </li>
        <li>
          This world was built from the phrase <code>{d.seed}</code>. The same phrase always builds the same night,
          so a friend playing it faces exactly what you faced.
        </li>
      </ul>

      <p style={{ marginTop: 28 }}>
        <a className="ym-button" href="/how-you-play">
          How you play →
        </a>{' '}
        <a className="ym-button" href="/">
          Play it again →
        </a>
      </p>
    </div>
  );
}
