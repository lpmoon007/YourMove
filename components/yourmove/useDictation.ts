'use client';
// Speaking instead of typing.
//
// This uses the speech recognition the browser already has, which means no key, no
// service and no audio going anywhere Your Move controls. It also means it is not
// everywhere: Safari and Chrome have it, Firefox does not. Where it is missing there is
// no broken button — the composer is simply the composer, and typing was always the
// primary way in.
//
// Nothing here ever submits a move. A misheard word in this game can end a run, so the
// words land in the box and the player presses the button, exactly as if they had typed.

import { useCallback, useEffect, useRef, useState } from 'react';

import { snapNames, tidyUtterance } from '@/lib/yourmove/dictation';

// The Web Speech API is not in lib.dom, so the shape this uses is declared here rather
// than pulled in as a dependency. Only the parts actually touched.
interface Recognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface Dictation {
  /** False when the browser cannot do this at all. Show nothing rather than a dead button. */
  supported: boolean;
  listening: boolean;
  /** In the player's words, never a browser error string. */
  problem: string | null;
  start(): void;
  stop(): void;
}

export function useDictation(opts: {
  /** Called with the words so far, and again when the sentence is finished. */
  onText: (text: string, final: boolean) => void;
  /** The names in the room, so a near-miss can be snapped to one of them. */
  names: string[];
  /** Turned off while the world is busy and once the run is over. */
  disabled?: boolean;
}): Dictation {
  const { onText, names, disabled } = opts;
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  // Kept in refs so the recognizer's callbacks always see the current ones without the
  // recognizer being torn down and rebuilt mid-sentence.
  const onTextRef = useRef(onText);
  const namesRef = useRef(names);
  onTextRef.current = onText;
  namesRef.current = names;

  useEffect(() => setSupported(recognitionCtor() !== null), []);

  const stop = useCallback(() => {
    recognition.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (disabled || recognition.current) return;
    const Ctor = recognitionCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let heard = '';
      let final = false;
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const result = e.results[i]!;
        heard += result[0]?.transcript ?? '';
        if (result.isFinal) final = true;
      }
      const text = tidyUtterance(final ? snapNames(heard, namesRef.current) : heard);
      if (text) onTextRef.current(text, final);
    };

    rec.onerror = (e) => {
      // The browser's words are for developers. These are for the person in the room.
      setProblem(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? 'Your browser is not letting this page use the microphone. Allow it in the address bar, or just type.'
          : e.error === 'no-speech'
            ? 'Did not catch that. Try again, or type it.'
            : e.error === 'audio-capture'
              ? 'No microphone found. Typing still works.'
              : 'The microphone stopped working. Typing still works.',
      );
    };

    rec.onend = () => {
      recognition.current = null;
      setListening(false);
    };

    recognition.current = rec;
    setProblem(null);
    setListening(true);
    try {
      rec.start();
    } catch {
      recognition.current = null;
      setListening(false);
      setProblem('Could not start listening. Typing still works.');
    }
  }, [disabled]);

  // A run that ends, or a page that goes away, must not leave the microphone open.
  useEffect(() => {
    if (disabled) stop();
  }, [disabled, stop]);
  useEffect(() => () => recognition.current?.abort(), []);

  return { supported, listening, problem, start, stop };
}
