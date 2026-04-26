'use client';

import { useEffect, useState } from 'react';

/**
 * Live countdown to a target ISO datetime.
 * Renders a skeleton on the server (all zeros) and hydrates to real
 * values on the client so the server-rendered HTML matches the initial
 * client render, avoiding hydration mismatches.
 */
interface CountdownProps {
  targetIso: string;
  ariaPrefix?: string;
}

interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export default function Countdown({ targetIso, ariaPrefix = 'Time remaining:' }: CountdownProps) {
  const [remaining, setRemaining] = useState<RemainingTime | null>(null);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    if (Number.isNaN(target)) {
      setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
      return;
    }

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
        return false;
      }
      const totalSec = Math.floor(diff / 1000);
      setRemaining({
        days:    Math.floor(totalSec / 86400),
        hours:   Math.floor((totalSec % 86400) / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
        done: false,
      });
      return true;
    };

    if (!tick()) return;
    const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const view: RemainingTime = remaining || { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };
  const pad = (n: number) => String(n).padStart(2, '0');

  const ariaText = view.done
    ? 'Launch time has arrived.'
    : `${ariaPrefix} ${view.days} days, ${view.hours} hours, ${view.minutes} minutes, ${view.seconds} seconds.`;

  return (
    <div
      className={`countdown${view.done ? ' countdown-done' : ''}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">{ariaText}</span>
      <div className="countdown-cell" aria-hidden="true">
        <span className="countdown-num">{pad(view.days)}</span>
        <span className="countdown-lbl">Days</span>
      </div>
      <span className="countdown-sep" aria-hidden="true">:</span>
      <div className="countdown-cell" aria-hidden="true">
        <span className="countdown-num">{pad(view.hours)}</span>
        <span className="countdown-lbl">Hours</span>
      </div>
      <span className="countdown-sep" aria-hidden="true">:</span>
      <div className="countdown-cell" aria-hidden="true">
        <span className="countdown-num">{pad(view.minutes)}</span>
        <span className="countdown-lbl">Minutes</span>
      </div>
      <span className="countdown-sep" aria-hidden="true">:</span>
      <div className="countdown-cell" aria-hidden="true">
        <span className="countdown-num">{pad(view.seconds)}</span>
        <span className="countdown-lbl">Seconds</span>
      </div>
    </div>
  );
}
