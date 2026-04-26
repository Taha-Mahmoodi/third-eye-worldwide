'use client';

import Link from 'next/link';

/*
 * Hero CTA row. Donate + Projects links use next/link; the "Listen
 * to audio tour" button calls the global wired up by AudioTour.
 */
export default function HeroActions() {
  return (
    <div className="hero-btns">
      <Link href="/donate" className="btn-accent">
        <i className="ph-fill ph-heart" aria-hidden="true"></i> Donate Now
      </Link>
      <Link href="/projects" className="btn-ghost">
        Our Projects <i className="ph ph-arrow-right" aria-hidden="true"></i>
      </Link>
      <button
        type="button"
        className="hero-listen"
        aria-label="Listen to an audio tour of this page"
        onClick={() => typeof window !== 'undefined' && window.startAudioTour?.()}
      >
        <i className="ph ph-speaker-high" aria-hidden="true"></i> Listen to audio tour
      </button>
    </div>
  );
}
