import type { ScenarioPackage } from '@/lib/aw/package';

// The brief a player reads before the clock starts.
//
// Every string on this screen is read by somebody who knows nothing: not the cast, not
// the crime, not the genre, not what any name refers to. It comes entirely from the
// world's own data, so a second world gets the same screen without a line of new code —
// and the same obligation to fill in every field.
export function WorldBrief({
  pkg,
  seed,
  begin,
  others,
}: {
  pkg: ScenarioPackage;
  seed: string;
  begin: () => Promise<void>;
  /** The other worlds on offer, when there are any. */
  others: { slug: string; title: string; genre: string }[];
}) {
  const w = pkg.world;
  const cd = pkg.content_descriptors;

  return (
    <div className="ym-gate">
      <p className="ym-wordmark">Your Move</p>
      <h1>{pkg.title}</h1>
      <p className="ym-genre">{pkg.genre}</p>
      <p className="ym-tagline">{pkg.tagline}</p>

      <div className="ym-brief">
        <div className="ym-brief-row">
          <h2>What has already happened</h2>
          <p>{w.setup}</p>
        </div>
        <div className="ym-brief-row">
          <h2>You are</h2>
          <p>
            <strong>{w.player.role}</strong> — {w.player.you}
          </p>
        </div>
        <div className="ym-brief-row">
          <h2>Who is in the room with you</h2>
          <ul className="ym-cast-intro">
            {pkg.cast.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong>
                <span className="ym-cast-role">{c.role}</span>
                <span className="ym-cast-line">{c.intro}</span>
              </li>
            ))}
          </ul>
          <p className="ym-meta">{w.cast_note}</p>
        </div>
        <div className="ym-brief-row">
          <h2>The trouble</h2>
          <p>{w.trouble}</p>
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
              <strong>Type what you would actually do</strong>, in plain English —{' '}
              {w.example_actions.map((ex, i) => (
                <span key={ex}>
                  {i ? ', ' : ''}
                  &ldquo;{ex}&rdquo;
                </span>
              ))}
              . Not commands. Sentences. Questions work too — ask somebody something the way you would ask a person.
            </li>
            {w.duration_minutes === null ? null : (
              <li>
                <strong>Every action costs time.</strong> You have {w.duration_minutes} minutes and the clock only
                moves forward. Waiting is a move too.
              </li>
            )}
            {w.house_rules.map((rule) => {
              // The first sentence is the headline; the rest is the explanation.
              const split = /^(.+?[.!?])\s+(.*)$/.exec(rule);
              return (
                <li key={rule}>
                  <strong>{split ? split[1] : rule}</strong>
                  {split ? ` ${split[2]}` : null}
                </li>
              );
            })}
            <li>
              <strong>Nobody will tell you the right move.</strong> There is no hint system and no correct path. The
              world just answers what you actually do.
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
          About {cd.estimated_minutes} minutes · intensity: {cd.intensity} · seed <code>{seed}</code> — the answers
          were decided before you arrived and will not change because you argue well.
        </p>
      </details>

      <form action={begin}>
        <button className="ym-button" type="submit">
          Start the clock →
        </button>
      </form>

      {others.length ? (
        <div className="ym-elsewhere">
          <h2>Somewhere else entirely</h2>
          <ul className="ym-world-list">
            {others.map((o) => (
              <li key={o.slug}>
                <a href={`/world/${o.slug}`}>
                  <strong>{o.title}</strong>
                  <span>{o.genre}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
