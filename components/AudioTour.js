'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const CHOICE_KEY = 'teww-tour-choice';
const AUTO_DELAY_SECONDS = 8;

// Map pathname → pre-recorded audio track in /public/audio.
// Generated with Windows SAPI (see prisma/seed.mjs siblings — audio files
// committed under public/audio/). Falls back to the home tour.
const TOUR_TRACKS = {
  '/':             '/audio/tour-home.wav',
  '/about':        '/audio/tour-about.wav',
  '/programs':     '/audio/tour-programs.wav',
  '/donate':       '/audio/tour-donate.wav',
  '/media':        '/audio/tour-media.wav',
  '/documents':    '/audio/tour-documents.wav',
  '/volunteers':   '/audio/tour-volunteers.wav',
};

function trackFor(pathname) {
  return TOUR_TRACKS[pathname] || TOUR_TRACKS['/'];
}

export default function AudioTour() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_DELAY_SECONDS);
  const autoTimerRef = useRef(null);
  const tickTimerRef = useRef(null);
  const audioRef = useRef(null);

  function clearTimers() {
    if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
    if (tickTimerRef.current) { clearInterval(tickTimerRef.current); tickTimerRef.current = null; }
  }

  function ensureAudio() {
    if (typeof window === 'undefined') return null;
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = 'auto';
      audioRef.current = a;
    }
    return audioRef.current;
  }

  function playTrack(src) {
    const a = ensureAudio();
    if (!a) return Promise.resolve(false);
    if (a.src !== src && !a.src.endsWith(src)) a.src = src;
    a.currentTime = 0;
    return a.play().then(() => true).catch(() => false);
  }

  function stopAudio() {
    const a = audioRef.current;
    if (!a) return;
    try { a.pause(); a.currentTime = 0; } catch {}
  }

  function dismiss(choice) {
    clearTimers();
    setVisible(false);
    try { sessionStorage.setItem(CHOICE_KEY, choice); } catch {}
  }

  function startTour() {
    clearTimers();
    setVisible(false);
    try { sessionStorage.setItem(CHOICE_KEY, 'audio'); } catch {}
    playTrack(trackFor(pathname));
  }

  useEffect(() => {
    let existing = null;
    try { existing = sessionStorage.getItem(CHOICE_KEY); } catch {}

    if (typeof window !== 'undefined') {
      window.startAudioTour = () => {
        clearTimers();
        setVisible(false);
        playTrack(trackFor(window.location.pathname));
      };
      window.stopAudioTour = () => {
        clearTimers();
        setVisible(false);
        stopAudio();
      };
      window.getAudioTourState = () => {
        const a = audioRef.current;
        if (!a) return { hasAudio: false };
        return {
          hasAudio: true,
          src: a.src,
          paused: a.paused,
          currentTime: a.currentTime,
          duration: Number.isFinite(a.duration) ? a.duration : null,
          readyState: a.readyState,
          error: a.error ? { code: a.error.code, message: a.error.message } : null,
        };
      };
    }

    if (existing) return;

    setVisible(true);
    setCountdown(AUTO_DELAY_SECONDS);

    tickTimerRef.current = setInterval(() => {
      setCountdown((n) => (n > 0 ? n - 1 : 0));
    }, 1000);

    autoTimerRef.current = setTimeout(() => {
      startTour();
    }, AUTO_DELAY_SECONDS * 1000);

    return () => {
      clearTimers();
      stopAudio();
    };
    // Run once on mount; track resolved at play time via window.location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      className="audio-tour-toast"
      role="dialog"
      aria-live="polite"
      aria-label="Audio tour notification"
    >
      <div className="att-icon" aria-hidden="true">
        <i className="ph-fill ph-speaker-high"></i>
      </div>
      <div className="att-body">
        <strong>Audio tour starts in {countdown}s</strong>
        <p>Prefer to browse on your own? You can continue without audio assistance.</p>
      </div>
      <div className="att-actions">
        <button
          type="button"
          className="att-btn att-btn-primary"
          onClick={() => dismiss('no-audio')}
        >
          Use without assistance
        </button>
        <button
          type="button"
          className="att-btn att-btn-ghost"
          onClick={startTour}
        >
          Start now
        </button>
      </div>
    </div>
  );
}
