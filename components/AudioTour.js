'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const CHOICE_KEY = 'teww-tour-choice';
const AUTO_DELAY_SECONDS = 8;

// Map pathname → pre-recorded audio track in /public/audio.
// Generated with Windows SAPI; tracks committed under public/audio/.
// Falls back to the home tour.
const TOUR_TRACKS = {
  '/':             '/audio/tour-home.wav',
  '/about':        '/audio/tour-about.wav',
  '/projects':     '/audio/tour-projects.wav',
  '/donate':       '/audio/tour-donate.wav',
  '/media':        '/audio/tour-media.wav',
  '/documents':    '/audio/tour-documents.wav',
  '/volunteers':   '/audio/tour-volunteers.wav',
};

function trackFor(pathname) {
  return TOUR_TRACKS[pathname] || TOUR_TRACKS['/'];
}

function fmtTime(secs) {
  if (!Number.isFinite(secs)) return '0:00';
  const s = Math.max(0, Math.floor(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function AudioTour() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_DELAY_SECONDS);
  // Player state: 'idle' | 'playing' | 'paused'
  const [playerState, setPlayerState] = useState('idle');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const autoTimerRef = useRef(null);
  const tickTimerRef = useRef(null);
  const audioRef = useRef(null);
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
      a.addEventListener('play',          () => { stoppingRef.current = false; setPlayerState('playing'); });
      a.addEventListener('playing',       () => { stoppingRef.current = false; setPlayerState('playing'); });
      a.addEventListener('pause',         () => {
        if (stoppingRef.current) { stoppingRef.current = false; setPlayerState('idle'); return; }
        setPlayerState(a.ended ? 'idle' : 'paused');
      });
      a.addEventListener('ended',         () => { setPlayerState('idle'); setPosition(0); });
      a.addEventListener('timeupdate',    () => setPosition(a.currentTime));
      a.addEventListener('loadedmetadata',() => setDuration(Number.isFinite(a.duration) ? a.duration : 0));
      a.addEventListener('durationchange',() => setDuration(Number.isFinite(a.duration) ? a.duration : 0));
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
    if (!a || !a.src) {
      // Nothing playing yet — start the tour for the current path.
      playTrack(trackFor(window.location.pathname));
      return;
    }
    if (a.paused || a.ended) resumeAudio();
    else pauseAudio();
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
      window.pauseAudioTour  = pauseAudio;
      window.resumeAudioTour = resumeAudio;
      window.toggleAudioTour = toggleAudio;
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
    // Run once on mount; track resolved at play time via window.location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMiniPlayer = playerState !== 'idle';
  const progressPct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <>
      {visible ? (
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
      ) : null}

      {showMiniPlayer ? (
        <div
          className="audio-tour-player"
          role="region"
          aria-label="Audio tour player"
        >
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
              <div
                className="atp-progress-bar"
                style={{ width: progressPct + '%' }}
              ></div>
            </div>
            <div className="atp-time">
              <span>{fmtTime(position)}</span>
              <span>/</span>
              <span>{fmtTime(duration)}</span>
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
