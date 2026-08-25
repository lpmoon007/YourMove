'use client';
// ITEM 21 — the Play Interface. Functional. Presentation is item 28, in V1B.
//
// It renders only from projections (L4) and embeds no game logic: every decision in this
// file is about layout and focus. Free text is the primary affordance; the verb chips are
// scaffolding for a player who freezes, and they are never the complete action space.

import { useEffect, useRef, useState, useTransition } from 'react';

import type { RunView } from '@/lib/yourmove/actions';
import { submitAction } from '@/lib/yourmove/actions';
import { Clock } from './Clock';
import { useDictation } from './useDictation';

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

  // Speaking fills the box; it never sends. A misheard word can end this run, so the
  // player reads it back and commits, the same as if they had typed it.
  //
  // Anything already typed is kept and spoken words are added to it, because half a
  // sentence typed and the rest said out loud is a thing people do, and swallowing what
  // somebody already wrote would be its own small betrayal.
  const spokenAfter = useRef('');
  const voice = useDictation({
    names: run.ui.present.map((p) => p.name),
    disabled: pending || Boolean(run.ended),
    onText: (heard, final) => {
      const prefix = spokenAfter.current;
      setText(prefix ? `${prefix} ${heard}` : heard);
      if (final) inputRef.current?.focus();
    },
  });

  const listen = () => {
    if (voice.listening) return voice.stop();
    spokenAfter.current = text.trim();
    voice.start();
  };

  const ui = run.ui;
  const remaining = ui.minutes_remaining;

  return (
    <div className="ym-shell">
        <header className="ym-head">
          <div>
            <h1 className="ym-title">{run.title}</h1>
            <p className="ym-tagline">
              You are <strong>{ui.you.role}</strong>. {ui.you.objective}
            </p>
          </div>
          <Clock minutes={remaining} label={ui.clock_label} />
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
                  <p className="ym-headline">
                    Nothing is hidden from you any more. The next screen shows what was actually true, what you
                    were told that was not, and what you never found out.
                  </p>
                  <a className="ym-button" href={`/yourmove/${run.run_id}/debrief`}>
                    See what was actually true →
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
                  placeholder={
                    voice.listening
                      ? 'Listening…'
                      : voice.supported
                        ? 'What do you do? Say it or type it.'
                        : 'What do you do? Type anything.'
                  }
                  onChange={(e) => setText(e.target.value)}
                  disabled={pending}
                  autoComplete="off"
                />
                {voice.supported ? (
                  <button
                    className={`ym-send ym-mic${voice.listening ? ' ym-mic-live' : ''}`}
                    type="button"
                    onClick={listen}
                    disabled={pending}
                    aria-pressed={voice.listening}
                    aria-label={voice.listening ? 'Stop listening' : 'Say your move out loud'}
                  >
                    {voice.listening ? 'Listening — tap to stop' : 'Speak'}
                  </button>
                ) : null}
                <button className="ym-send" type="submit" disabled={pending || !text.trim()}>
                  {pending ? '…' : 'Do it'}
                </button>
              </form>
            ) : null}

            {voice.problem ? <p className="ym-error">{voice.problem}</p> : null}
            {error ? <p className="ym-error">{error}</p> : null}

            {voice.supported && !run.ended ? (
              <p className="ym-meta ym-mic-note">
                Say it the way you would say it to someone: “ask the driver what he saw”. The words land in the box
                and nothing happens until you send them. Your browser does the listening, and some browsers send the
                audio to their own speech service to do it.
              </p>
            ) : null}

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
              <h2>You</h2>
              <p className="ym-you">{ui.you.description}</p>
            </section>

            <section>
              <h2>In the room</h2>
              <ul className="ym-cast">
                {ui.present.map((p) => (
                  <li key={p.id}>
                    <strong>{p.name}</strong>
                    <span className="ym-role">{p.role}</span>
                    <span className="ym-mood">{p.disposition_read}</span>
                    <span className="ym-cast-line">{p.intro}</span>
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
