'use client';
// ITEM 21 — the Play Interface. Functional. Presentation is item 28, in V1B.
//
// It renders only from projections (L4) and embeds no game logic: every decision in this
// file is about layout and focus. Free text is the primary affordance; the verb chips are
// scaffolding for a player who freezes, and they are never the complete action space.

import { useEffect, useRef, useState, useTransition } from 'react';

import type { RunView } from '@/lib/yourmove/actions';
import { submitAction } from '@/lib/yourmove/actions';

export function PlayApp({ initial }: { initial: RunView }) {
  const [run, setRun] = useState<RunView>(initial);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
  }, [run.transcript.length, pending]);

  useEffect(() => {
    if (!pending && !run.ended) inputRef.current?.focus();
  }, [pending, run.ended]);

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || pending || run.ended) return;
    setText('');
    setError(null);
    start(async () => {
      const next = await submitAction(run.run_id, trimmed);
      if ('error' in next) setError(next.error);
      else setRun(next);
    });
  };

  const ui = run.ui;
  const remaining = ui.minutes_remaining;
  const urgent = remaining !== null && remaining <= 5;

  return (
    <div className="ym-shell">
        <header className="ym-head">
          <div>
            <h1 className="ym-title">{run.title}</h1>
            <p className="ym-tagline">{run.tagline}</p>
          </div>
          <div className={`ym-clock${urgent ? ' ym-clock-urgent' : ''}`}>
            <span className="ym-clock-num">{remaining ?? '—'}</span>
            <span className="ym-clock-unit">minutes left</span>
          </div>
        </header>

        <div className="ym-body">
          <main className="ym-main">
            <div className="ym-feed" ref={feedRef}>
              {run.transcript.map((entry, i) => (
                <div key={i} className={`ym-entry ym-${entry.kind}`}>
                  {entry.kind === 'you' ? <span className="ym-caret">&gt;</span> : null}
                  <span>{entry.text}</span>
                </div>
              ))}
              {pending ? <div className="ym-entry ym-thinking">the room moves…</div> : null}
              {run.ended ? (
                <div className="ym-ended">
                  <p>{run.ended.label}</p>
                  {run.outcome ? <p className="ym-headline">{run.outcome.headline}</p> : null}
                  <a className="ym-button" href={`/yourmove/${run.run_id}/debrief`}>
                    What was actually true →
                  </a>
                </div>
              ) : null}
            </div>

            {!run.ended ? (
              <form
                className="ym-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(text);
                }}
              >
                <input
                  ref={inputRef}
                  className="ym-input"
                  value={text}
                  placeholder="What do you do? Type anything."
                  onChange={(e) => setText(e.target.value)}
                  disabled={pending}
                  autoComplete="off"
                />
                <button className="ym-send" type="submit" disabled={pending || !text.trim()}>
                  {pending ? '…' : 'Do it'}
                </button>
              </form>
            ) : null}

            {error ? <p className="ym-error">{error}</p> : null}

            {!run.ended && ui.verb_chips.length ? (
              <div className="ym-chips">
                <span className="ym-chips-label">stuck?</span>
                {ui.verb_chips.map((c) => (
                  <button key={c.id} className="ym-chip" onClick={() => setText((t) => (t ? t : `${c.label.toLowerCase()} `))}>
                    {c.label}
                  </button>
                ))}
              </div>
            ) : null}
          </main>

          <aside className="ym-side">
            <section>
              <h2>In the room</h2>
              <ul className="ym-cast">
                {ui.present.map((p) => (
                  <li key={p.id}>
                    <strong>{p.name}</strong>
                    <span className="ym-role">{p.role}</span>
                    <span className="ym-mood">{p.disposition_read}</span>
                  </li>
                ))}
                {!ui.present.length ? <li className="ym-empty">You are alone.</li> : null}
              </ul>
            </section>

            <section>
              <h2>On hand</h2>
              <ul className="ym-res">
                {ui.resources.map((r) => (
                  <li key={r.id}>
                    <span>{r.label}</span>
                    <strong>{r.id === 'cash' ? `$${r.amount.toLocaleString()}` : r.amount}</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2>What you know</h2>
              <ul className="ym-facts">
                {ui.known_facts.map((f) => (
                  <li key={f.id} className={f.status === 'told' ? 'ym-fact-soft' : ''}>
                    {f.statement}
                    <span className="ym-fact-tag">{f.status === 'observed' ? 'saw it' : f.status}</span>
                  </li>
                ))}
                {!ui.known_facts.length ? <li className="ym-empty">Nothing yet. Nobody has told you anything.</li> : null}
              </ul>
            </section>

            {ui.documents.length ? (
              <section>
                <h2>{ui.documents[0]!.title}</h2>
                <pre className="ym-doc">{ui.documents[0]!.body}</pre>
              </section>
            ) : null}

            {!run.live_prose ? (
              <p className="ym-note">
                No model key configured — the world is running on its deterministic renderer. The rules are identical;
                the prose is plainer.
              </p>
            ) : null}
        </aside>
      </div>
    </div>
  );
}
