'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    startTeTour?: () => void;
    startAudioTour?: () => void;
    stopAudioTour?: () => void;
    pauseAudioTour?: () => void;
    resumeAudioTour?: () => void;
    toggleAudioTour?: () => void;
    getAudioTourState?: () => {
      hasAudio: boolean;
      src?: string;
      paused?: boolean;
      ended?: boolean;
      currentTime?: number;
      duration?: number | null;
      readyState?: number;
      error?: { code: number; message: string } | null;
    };
  }
}

type PlayerState = 'idle' | 'playing' | 'paused';

/*
 * Launch-time tour overlay. Shows a big red modal in the centre of the
 * screen on first visit and, after an 8-second countdown (or on Start
 * Now click), hands control to the TE voice assistant — TE introduces
 * itself and starts listening.
 *
 * The legacy pre-recorded WAV tour is kept under /public/audio for
 * backward compat with anything that still calls window.startAudioTour
 * — but the default flow now uses TE's voice synthesis instead.
 */

const CHOICE_KEY = 'teww-tour-choice';
const AUTO_DELAY_SECONDS = 8;

// Pathname → pre-recorded audio fallback. Only used if window.startTeTour
// is unavailable (e.g. VoiceAssistant didn't mount or browser lacks
// SpeechSynthesis).
const TOUR_TRACKS: Record<string, string> = {
  '/':           '/audio/tour-home.wav',
  '/about':      '/audio/tour-about.wav',
  '/projects':   '/audio/tour-projects.wav',
  '/donate':     '/audio/tour-donate.wav',
  '/media':      '/audio/tour-media.wav',
  '/documents':  '/audio/tour-documents.wav',
  '/volunteers': '/audio/tour-volunteers.wav',
};

function fmtTime(secs: number): string {
  if (!Number.isFinite(secs)) return '0:00';
  const s = Math.max(0, Math.floor(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function AudioTour() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_DELAY_SECONDS);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stoppingRef = useRef(false);

  function clearTimers() {
    if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
    if (tickTimerRef.current) { clearInterval(tickTimerRef.current); tickTimerRef.current = null; }
  }

  function ensureAudio() {
    if (typeof window === 'undefined') return null;
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = 'auto';
      a.addEventListener('play',           () => { stoppingRef.current = false; setPlayerState('playing'); });
      a.addEventListener('playing',        () => { stoppingRef.current = false; setPlayerState('playing'); });
      a.addEventListener('pause',          () => {
        if (stoppingRef.current) { stoppingRef.current = false; setPlayerState('idle'); return; }
        setPlayerState(a.ended ? 'idle' : 'paused');
      });
      a.addEventListener('ended',          () => { setPlayerState('idle'); setPosition(0); });
      a.addEventListener('timeupdate',     () => setPosition(a.currentTime));
      a.addEventListener('loadedmetadata', () => setDuration(Number.isFinite(a.duration) ? a.duration : 0));
      a.addEventListener('durationchange', () => setDuration(Number.isFinite(a.duration) ? a.duration : 0));
      audioRef.current = a;
    }
    return audioRef.current;
  }

  function playFallbackTrack() {
    const a = ensureAudio();
    if (!a) return;
    const src = TOUR_TRACKS[window.location.pathname] || TOUR_TRACKS['/'];
    if (a.src !== src && !a.src.endsWith(src)) a.src = src;
    a.currentTime = 0;
    a.play().catch(() => {});
  }

  function stopAudio() {
    const a = audioRef.current;
    if (!a) return;
    stoppingRef.current = true;
    try { a.pause(); a.currentTime = 0; } catch {}
    setPlayerState('idle');
    setPosition(0);
  }

  function pauseAudio() {
    const a = audioRef.current;
    if (!a || a.paused || a.ended) return;
    try { a.pause(); } catch {}
  }

  function resumeAudio() {
    const a = audioRef.current;
    if (!a) return;
    if (a.ended || a.currentTime >= (a.duration || Infinity)) a.currentTime = 0;
    a.play().catch(() => {});
  }

  function toggleAudio() {
    const a = audioRef.current;
    if (!a || !a.src) { playFallbackTrack(); return; }
    if (a.paused || a.ended) resumeAudio();
    else pauseAudio();
  }

  // Hand the tour off to TE. If TE isn't available (no
  // SpeechSynthesis), fall back to playing the route's WAV file so
  // the user still gets *some* audio intro.
  function startTour() {
    clearTimers();
    setVisible(false);
    try { sessionStorage.setItem(CHOICE_KEY, 'audio'); } catch {}
    if (typeof window !== 'undefined' && typeof window.startTeTour === 'function') {
      window.startTeTour();
    } else {
      playFallbackTrack();
    }
  }

  function dismiss(choice: string) {
    clearTimers();
    setVisible(false);
    try { sessionStorage.setItem(CHOICE_KEY, choice); } catch {}
  }

  useEffect(() => {
    let existing: string | null = null;
    try { existing = sessionStorage.getItem(CHOICE_KEY); } catch {}

    if (typeof window !== 'undefined') {
      window.startAudioTour   = playFallbackTrack;
      window.stopAudioTour    = () => { clearTimers(); setVisible(false); stopAudio(); };
      window.pauseAudioTour   = pauseAudio;
      window.resumeAudioTour  = resumeAudio;
      window.toggleAudioTour  = toggleAudio;
      window.getAudioTourState = () => {
        const a = audioRef.current;
        if (!a) return { hasAudio: false };
        return {
          hasAudio: true,
          src: a.src,
          paused: a.paused,
          ended: a.ended,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMiniPlayer = playerState !== 'idle';
  const progressPct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <>
      {visible ? (
        <div
          className="tour-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-title"
          aria-describedby="tour-desc"
        >
          <div className="tour-card" role="document">
            <button
              type="button"
              className="tour-close"
              onClick={() => dismiss('no-audio')}
              aria-label="Skip — browse without TE"
            >
              <i className="ph-bold ph-x" aria-hidden="true"></i>
            </button>
            <div className="tour-icon" aria-hidden="true">
              <i className="ph-fill ph-microphone"></i>
            </div>
            <div className="tour-eyebrow">Voice tour</div>
            <h2 id="tour-title" className="tour-title">Meet <em>TE</em> — your voice guide</h2>
            <p id="tour-desc" className="tour-desc">
              In a moment TE will introduce herself and start listening for your commands.
              You can say <strong>&ldquo;Hey&nbsp;TE&rdquo;</strong> to navigate the site by voice
              — or skip this and explore on your own.
            </p>
            <div className="tour-countdown" aria-live="polite">
              Starts automatically in <strong>{countdown}s</strong>
            </div>
            <div className="tour-actions">
              <button type="button" className="tour-btn tour-btn-primary" onClick={startTour}>
                <i className="ph-fill ph-microphone" aria-hidden="true"></i> Start tour now
              </button>
              <button type="button" className="tour-btn tour-btn-ghost" onClick={() => dismiss('no-audio')}>
                Browse without TE
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showMiniPlayer ? (
        <div className="audio-tour-player" role="region" aria-label="Audio tour player">
          <button
            type="button"
            className="atp-btn atp-toggle"
            onClick={toggleAudio}
            aria-label={playerState === 'playing' ? 'Pause audio tour' : 'Resume audio tour'}
            aria-pressed={playerState === 'playing'}
          >
            <i className={`ph-fill ${playerState === 'playing' ? 'ph-pause' : 'ph-play'}`}></i>
          </button>
          <div className="atp-info" aria-hidden="true">
            <div className="atp-label">Audio tour</div>
            <div className="atp-progress-wrap">
              <div className="atp-progress-bar" style={{ width: progressPct + '%' }}></div>
            </div>
            <div className="atp-time">
              <span>{fmtTime(position)}</span><span>/</span><span>{fmtTime(duration)}</span>
            </div>
          </div>
          <button
            type="button"
            className="atp-btn atp-close"
            onClick={stopAudio}
            aria-label="Stop audio tour"
          >
            <i className="ph ph-x"></i>
          </button>
        </div>
      ) : null}
    </>
  );
}
