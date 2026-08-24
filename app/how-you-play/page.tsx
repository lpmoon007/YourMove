import { CORE_EIGHT } from '@/lib/aw/play';
import { accountView } from '@/lib/yourmove/account';
import { howYouPlay } from '@/lib/yourmove/actions';

export const dynamic = 'force-dynamic';

// HOW YOU PLAY.
//
// Everything on this page describes play. Nothing on it describes a person. There is no
// "you are", no trait, no score, no assessment, and no permanence — a test in
// tests/aw/howyouplay.test.ts fails the build if that language appears anywhere in the
// dimension copy, and the same discipline applies to every sentence written here.
export default async function HowYouPlayPage() {
  const { profile, badges, runs } = await howYouPlay();
  const account = await accountView();
  const tested = profile.reads.filter((r) => r.position !== null);
  const visibleBadges = badges.filter((b) => !b.secret);
  const secretsFound = badges.filter((b) => b.secret);

  if (!runs) {
    return (
      <div className="ym-gate">
        <p className="ym-wordmark">How You Play</p>
        <h1>Nothing to notice yet</h1>
        <p className="ym-tagline">
          This page fills in as you play. It watches what you actually do — whether you push or negotiate, move
          early or wait, hold what you have or spend it — and shows you the pattern.
        </p>
        <p className="ym-actions">
          <a className="ym-button" href="/">
            Play a world →
          </a>
          <a className="ym-button" href="/account">
            Play code →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="ym-debrief">
      <p className="ym-wordmark">How You Play</p>
      <h1>A pattern the world has started to notice.</h1>
      <p className="ym-section-note" style={{ maxWidth: '72ch' }}>
        Every world puts you in different situations. Over time this watches how you tend to act: whether you
        negotiate or push, move quickly or take your time, protect what you have or put it on the table. These
        aren&rsquo;t traits and they aren&rsquo;t permanent — they&rsquo;re simply patterns in how you&rsquo;ve played
        so far. Enter different worlds, make different moves, see what changes.
      </p>
      <p className="ym-meta">
        Read from {runs} run{runs === 1 ? '' : 's'} across {profile.worlds.length} world
        {profile.worlds.length === 1 ? '' : 's'}.{' '}
        {account.signed_in
          ? `On your play code${account.devices > 1 ? `, across ${account.devices} devices` : ''}.`
          : 'Only on this browser — a play code carries it to your other devices.'}
      </p>

      {profile.title ? (
        <div className="ym-title-card">
          <p className="ym-title-label">Right now the world would call you</p>
          <p className="ym-title-name">{profile.title.name}</p>
          <p className="ym-title-why">Because {profile.title.because}.</p>
          <p className="ym-meta">Titles come and go. Play differently and this will change.</p>
        </div>
      ) : (
        <div className="ym-title-card">
          <p className="ym-title-label">No title yet</p>
          <p className="ym-title-why">
            One run is a night, not a pattern. Play another world and the world will have something to call you.
          </p>
        </div>
      )}

      <h2>The eight things it watches</h2>
      <div className="ym-sliders">
        {profile.reads.map((r) => (
          <details className="ym-slider" key={r.dimension} open={r.confidence === 'context-dependent'}>
            <summary>
              <span className="ym-slider-row">
                <span className="ym-slider-left">{r.left}</span>
                <span className="ym-track">
                  {r.slider === null ? (
                    <span className="ym-track-empty">not tested yet</span>
                  ) : (
                    <span className="ym-knob" style={{ left: `calc(${r.slider}% - 6px)` }} />
                  )}
                </span>
                <span className="ym-slider-right">{r.right}</span>
              </span>
              <span className={`ym-conf ym-conf-${r.confidence ?? 'none'}`}>{r.confidence ?? 'untested'}</span>
            </summary>

            <div className="ym-slider-body">
              <p className="ym-slider-read">{r.read}</p>
              <p className="ym-meta">
                {r.measures} · {r.confidence_note}
                {r.opportunities ? ` · read from ${r.opportunities} moment${r.opportunities === 1 ? '' : 's'}` : ''}
              </p>

              {r.variation ? (
                <p className="ym-meta">
                  {r.varies_by === 'world'
                    ? 'It reads differently depending on the world: '
                    : 'It has swung between runs of the same world: '}
                  {r.variation.map((v) => `${v.label} ${v.position < 0 ? r.left : r.right}`).join(' · ')}
                </p>
              ) : null}

              {r.evidence.length ? (
                <>
                  <h4>Why the world thinks this</h4>
                  <ul className="ym-evidence">
                    {r.evidence.map((e, i) => (
                      <li key={i}>
                        {e.context}
                        {e.quote ? <span className="ym-quote">you typed “{e.quote}”</span> : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {r.counter_evidence.length ? (
                <>
                  <h4>And what cuts the other way</h4>
                  <ul className="ym-evidence ym-counter">
                    {r.counter_evidence.map((e, i) => (
                      <li key={i}>
                        {e.context}
                        {e.quote ? <span className="ym-quote">you typed “{e.quote}”</span> : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </details>
        ))}
      </div>

      {profile.contradictions.length ? (
        <>
          <h2>Two things at once</h2>
          <p className="ym-section-note">
            These pull in different directions and are both true. That is usually the most interesting thing on
            this page.
          </p>
          <ul className="ym-truth">
            {profile.contradictions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>What the world has noticed</h2>
      {visibleBadges.length || secretsFound.length ? (
        <ul className="ym-badges">
          {[...secretsFound, ...visibleBadges].map((b) => (
            <li key={b.id} className={`ym-badge ym-rarity-${b.rarity}`}>
              <strong>{b.name}</strong>
              <span className="ym-badge-rarity">{b.rarity}</span>
              <span className="ym-badge-for">{b.earned_for}</span>
            </li>
          ))}
          <li className="ym-badge ym-badge-locked">
            <strong>???</strong>
            <span className="ym-badge-rarity">hidden</span>
            <span className="ym-badge-for">Some of these are not listed until you find them.</span>
          </li>
        </ul>
      ) : (
        <p className="ym-section-note">Nothing yet. Finish a run and the world will start keeping notes.</p>
      )}

      <p className="ym-meta" style={{ marginTop: 30, maxWidth: '72ch' }}>
        {profile.note} {tested.length < CORE_EIGHT.length
          ? `${CORE_EIGHT.length - tested.length} of the eight have not come up yet — a world has to actually put you in the situation before there is anything to read.`
          : ''}
      </p>
      <p className="ym-actions">
        <a className="ym-button" href="/">
          Play again →
        </a>
        <a className="ym-button" href="/account">
          {account.signed_in ? 'Your play code →' : 'Keep this on another device →'}
        </a>
      </p>
    </div>
  );
}
