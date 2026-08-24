'use client';
// The clock.
//
// World time is spent, not elapsed: it only moves when you do something, because the
// engine resolves a turn at a time and the cost of an action is part of the rules. So
// this cannot free-run — a second hand ticking on its own would be promising a pressure
// the world is not applying, and the run would never end while you sat still.
//
// What it can do is read like a clock and behave like one at the moment time is actually
// spent: minutes and seconds, counting down through the cost of the move you just made.

import { useEffect, useRef, useState } from 'react';

/** How long the count-down animation takes, whatever number of minutes it covers. */
const SPEND_MS = 900;

export function Clock({ minutes }: { minutes: number | null }) {
  // Shown in seconds throughout, so the descent can pass through them.
  const target = minutes === null ? null : minutes * 60;
  const [shown, setShown] = useState<number | null>(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) {
      setShown(null);
      return;
    }
    let from: number | null = null;
    setShown((current) => {
      from = current;
      return current;
    });
    if (from === null || from === target) {
      setShown(target);
      return;
    }

    const start = performance.now();
    const startedAt = from;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / SPEND_MS);
      // Ease out, so it drops fast and settles — a clock being spent, not a slider.
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(startedAt + (target - startedAt) * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target]);

  const seconds = shown ?? 0;
  const urgent = target !== null && target <= 5 * 60;
  const spending = shown !== null && target !== null && shown !== target;

  return (
    <div className={`ym-clock${urgent ? ' ym-clock-urgent' : ''}${spending ? ' ym-clock-spending' : ''}`}>
      <span className="ym-clock-num" aria-hidden>
        {shown === null ? '—' : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}
      </span>
      <span className="ym-clock-unit">
        {minutes === null ? 'no clock' : 'left before the van goes'}
      </span>
      <span className="ym-sr">
        {minutes === null ? 'No clock on this run.' : `${minutes} minutes left before the van goes.`}
      </span>
    </div>
  );
}
