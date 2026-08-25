import { storeStatus } from '@/lib/aw/store';
import { envDiagnostics } from '@/lib/yourmove/env';

export const dynamic = 'force-dynamic';

// Is this deployment actually keeping anything?
//
// A missing environment variable used to present as a game that worked perfectly and
// threw everything away on the next deploy: the app fell back to in-memory storage and
// said nothing, because there was nowhere to say it. This is that somewhere.
//
// Nothing here is a secret. It reports variable NAMES and yes/no, never values, never a
// URL, never a project reference, never a fragment of a key — everything on this page is
// information you could get by watching the app misbehave, arranged so you do not have to.
export default async function SetupPage() {
  const store = await storeStatus();
  const env = envDiagnostics();

  const rows: { label: string; ok: boolean; detail: string }[] = [
    {
      label: 'Runs are being kept',
      ok: store.durable,
      detail: store.durable
        ? 'Every run, profile and play code is written to the database and survives a deploy.'
        : (store.reason ?? 'Runs are being held in this server’s memory.'),
    },
    {
      label: 'Database address',
      ok: Boolean(env.url.found),
      detail: env.url.found
        ? `Read from ${env.url.found}.`
        : `Not set. Any one of these works: ${env.url.accepted.join(', ')}.`,
    },
    {
      label: 'Service-role key',
      ok: Boolean(env.service_role.found),
      detail: env.service_role.found
        ? `Read from ${env.service_role.found}.`
        : `Not set. Any one of these works: ${env.service_role.accepted.join(', ')}. This one is the usual culprit — the address alone is not enough.`,
    },
    {
      label: 'Model key',
      ok: env.model_key,
      detail: env.model_key
        ? 'ANTHROPIC_API_KEY is set, so the world writes its own prose.'
        : 'ANTHROPIC_API_KEY is not set. The game is fully playable — the rules are identical — but every line is the deterministic renderer rather than written prose.',
    },
    {
      label: 'Facilitator console',
      ok: env.console_secret,
      detail: env.console_secret
        ? 'YOURMOVE_CONSOLE_SECRET is set. The console opens at /yourmove/console?key=…'
        : 'YOURMOVE_CONSOLE_SECRET is not set, so the console stays shut. That is a safe default, not a fault.',
    },
  ];

  const healthy = store.durable && Boolean(env.url.found) && Boolean(env.service_role.found);

  return (
    <div className="ym-gate">
      <p className="ym-wordmark">Your Move</p>
      <h1>{healthy ? 'This deployment is keeping everything.' : 'This deployment is throwing runs away.'}</h1>
      <p className="ym-tagline">
        {healthy
          ? 'Nothing needs doing. Everything below is here so you can check it again in six months without reading any code.'
          : 'The game plays correctly. It is just not writing anything down, so every run, profile and play code disappears the next time this deploys.'}
      </p>

      <ul className="ym-check">
        {rows.map((r) => (
          <li key={r.label} className={r.ok ? 'ym-check-ok' : 'ym-check-bad'}>
            <strong>{r.label}</strong>
            <span>{r.detail}</span>
          </li>
        ))}
      </ul>

      {!healthy ? (
        <div className="ym-brief">
          <div className="ym-brief-row">
            <h2>What to do about it</h2>
            <p>
              Set the two missing variables on the hosting project, pointing at the Your Move Supabase project — not
              at any other project that happens to be in the same account — and deploy again. Environment variables
              only take effect on a new deployment, so changing them without redeploying looks like nothing happened.
            </p>
            <p className="ym-meta">
              If the address and the key are set and this page still says runs are not being kept, the database they
              point at is missing the Your Move migrations, and the reason above will say so. Nothing is ever written
              to a database that cannot prove it is this one.
            </p>
          </div>
        </div>
      ) : null}

      <p className="ym-actions">
        <a className="ym-button" href="/">
          Back to the front door →
        </a>
      </p>
    </div>
  );
}
