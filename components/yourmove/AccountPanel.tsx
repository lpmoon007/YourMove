'use client';
// The play-code screen.
//
// One job: let somebody carry their play from the laptop to the phone. It asks for no
// email, no password and no name it does not need, and it says so plainly, because a
// sign-up wall is the fastest way to end a game before it starts.
//
// The code is shown exactly once, on this screen, immediately after it is minted. The
// server keeps only a hash of it and genuinely cannot show it again.

import { useState, useTransition } from 'react';

import {
  createPlayCode,
  renameAccount,
  signInWithCode,
  signOutOfAccount,
  type AccountView,
} from '@/lib/yourmove/account';

export function AccountPanel({ initial }: { initial: AccountView }) {
  const [account, setAccount] = useState(initial);
  const [freshCode, setFreshCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<void>) => {
    setError(null);
    setNotice(null);
    start(async () => {
      await fn();
    });
  };

  const make = () =>
    run(async () => {
      const res = await createPlayCode(name);
      if ('error' in res) return setError(res.error);
      setFreshCode(res.code);
      setAccount({ signed_in: true, display_name: res.display_name, account_id: null, devices: 1 });
    });

  const use = () =>
    run(async () => {
      const res = await signInWithCode(codeInput);
      if ('error' in res) return setError(res.error);
      setCodeInput('');
      setFreshCode(null);
      setAccount({ signed_in: true, display_name: res.display_name, account_id: null, devices: 2 });
      setNotice('This device is on your code now. Everything you play here counts toward the same profile.');
    });

  const rename = () =>
    run(async () => {
      const res = await renameAccount(name);
      if ('error' in res) return setError(res.error);
      setAccount((a) => ({ ...a, display_name: res.display_name }));
      setName('');
      setNotice('Name saved.');
    });

  const out = () =>
    run(async () => {
      await signOutOfAccount();
      setAccount({ signed_in: false, display_name: null, account_id: null, devices: 1 });
      setFreshCode(null);
      setNotice('This browser is playing on its own again. Your code still works wherever you type it.');
    });

  const copy = async () => {
    if (!freshCode) return;
    try {
      await navigator.clipboard.writeText(freshCode);
      setCopied(true);
    } catch {
      setCopied(false);
      setError('Copying did not work in this browser. Select the code and copy it by hand.');
    }
  };

  // --- the code, shown once ------------------------------------------------
  if (freshCode) {
    return (
      <div className="ym-brief">
        <div className="ym-brief-row">
          <h2>Write this down now</h2>
          <p className="ym-code">{freshCode}</p>
          <p>
            This is the only screen that will ever show it. It is not stored anywhere it could be read back, so
            nobody — including us — can recover it for you.
          </p>
          <p className="ym-actions">
            <button className="ym-send" type="button" onClick={copy}>
              {copied ? 'Copied' : 'Copy the code'}
            </button>
            <a className="ym-button" href="/how-you-play">
              Done →
            </a>
          </p>
          <p className="ym-meta">
            Type it on any other device to carry your play there. Anyone who has it is playing as you, so treat it
            like a key rather than a username.
          </p>
        </div>
      </div>
    );
  }

  // --- already on a code ---------------------------------------------------
  if (account.signed_in) {
    return (
      <div className="ym-brief">
        <div className="ym-brief-row">
          <h2>This device is on a code</h2>
          <p>
            {account.display_name ? (
              <>
                Playing as <strong>{account.display_name}</strong>.
              </>
            ) : (
              'No name set — the code works the same either way.'
            )}{' '}
            {account.devices > 1
              ? `Play from ${account.devices} devices is on this code.`
              : 'Type your code on another device to bring your play with you.'}
          </p>
          {notice ? <p className="ym-meta">{notice}</p> : null}
        </div>

        <div className="ym-brief-row">
          <h2>Change the name</h2>
          <p className="ym-composer">
            <input
              className="ym-input"
              value={name}
              maxLength={40}
              placeholder={account.display_name ?? 'What should we call you?'}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="ym-send" type="button" disabled={pending} onClick={rename}>
              Save
            </button>
          </p>
        </div>

        <div className="ym-brief-row">
          <h2>Step off this device</h2>
          <p>
            This browser goes back to playing on its own. Nothing is deleted — everything you have played stays on
            the code, and typing it here again brings it back.
          </p>
          <p className="ym-actions">
            <button className="ym-send" type="button" disabled={pending} onClick={out}>
              Sign out of this browser
            </button>
          </p>
        </div>

        {error ? <p className="ym-error">{error}</p> : null}
      </div>
    );
  }

  // --- no code yet ---------------------------------------------------------
  return (
    <div className="ym-brief">
      <div className="ym-brief-row">
        <h2>Make a code</h2>
        <p>
          Everything you have already played in this browser comes with it. A name is optional and shows up nowhere
          but here.
        </p>
        <p className="ym-composer">
          <input
            className="ym-input"
            value={name}
            maxLength={40}
            placeholder="A name, if you want one"
            onChange={(e) => setName(e.target.value)}
          />
          <button className="ym-send" type="button" disabled={pending} onClick={make}>
            Make my code
          </button>
        </p>
      </div>

      <div className="ym-brief-row">
        <h2>Already have one</h2>
        <p>Type it here and this device joins the same profile.</p>
        <p className="ym-composer">
          <input
            className="ym-input"
            value={codeInput}
            spellCheck={false}
            autoCapitalize="none"
            placeholder="ym-4f2a9c-raven-tunnel-…"
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <button className="ym-send" type="button" disabled={pending} onClick={use}>
            Use it
          </button>
        </p>
        <p className="ym-meta">Capitals, spaces and a missing “ym-” at the front are all fine.</p>
      </div>

      {error ? <p className="ym-error">{error}</p> : null}
      {notice ? <p className="ym-meta">{notice}</p> : null}
    </div>
  );
}
