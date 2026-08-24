import { AccountPanel } from '@/components/yourmove/AccountPanel';
import { accountView } from '@/lib/yourmove/account';

export const dynamic = 'force-dynamic';

// The lightest account that does the one job worth doing: making a profile survive a
// different device. No email, no password, no verification step, nothing personal stored.
export default async function AccountPage() {
  const account = await accountView();

  return (
    <div className="ym-gate">
      <p className="ym-wordmark">Your Move</p>
      <h1>Your play code</h1>
      <p className="ym-tagline">
        A code is how your play follows you from one device to another. There is no email, no password and nothing
        to verify — just a code you keep.
      </p>

      <AccountPanel initial={account} />

      <p className="ym-actions">
        <a className="ym-button" href="/how-you-play">
          How you play →
        </a>
        <a className="ym-button" href="/">
          Back to the room →
        </a>
      </p>
    </div>
  );
}
