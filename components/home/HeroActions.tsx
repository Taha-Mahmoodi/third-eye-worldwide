'use client';

import Link from 'next/link';
import { ArrowRight, Heart, SpeakerHigh } from '@/components/icons';

/*
 * Hero CTA row. Donate + Projects links use next/link; the "Listen
 * to audio tour" button calls the global wired up by AudioTour.
 */
export default function HeroActions() {
  return (
    <div className="hero-btns">
      <Link href="/donate" className="btn-accent">
        <Heart weight="fill" size="1em" aria-hidden="true" /> Donate Now
      </Link>
      <Link href="/projects" className="btn-ghost">
        Our Projects <ArrowRight size="1em" aria-hidden="true" />
      </Link>
      <button
        type="button"
        className="hero-listen"
        aria-label="Listen to an audio tour of this page"
        onClick={() => typeof window !== 'undefined' && window.startAudioTour?.()}
      >
        <SpeakerHigh size="1em" aria-hidden="true" /> Listen to audio tour
      </button>
    </div>
  );
}
