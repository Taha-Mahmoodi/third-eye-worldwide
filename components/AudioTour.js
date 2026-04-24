'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const CHOICE_KEY = 'teww-tour-choice';
const AUTO_DELAY_SECONDS = 8;

const TOUR_SCRIPTS = {
  '/': 'Welcome to Third Eye Worldwide. We build free, open-source assistive technology for people with visual impairment — screen readers, magnifiers, navigation aids, and community programs in forty-seven countries. Use the tab key or your screen reader to explore, or press escape at any time to stop this audio tour.',
  '/about': 'About Third Eye Worldwide. Our mission is to open new worlds through technology — building tools designed by and for visually impaired people. Learn about our story, our team, and the values that guide our work.',
  '/programs': 'Our programs. From the TEWW Screen Reader to the Audiolibrary Project and the Device Lending Library, each program is free to use and shaped by the community it serves.',
  '/donate': 'Donate to Third Eye Worldwide. Every contribution funds free tools, free training, and free devices for those who need them most. Ten dollars a month supports one user for a full year.',
  '/media': 'Media. Browse our podcasts, press coverage, and video library. All media is captioned, transcribed, and audio-described.',
  '/documents': 'Documents. Read the stories, blog posts, and reports that chronicle our work and the people we serve.',
  '/volunteers': 'Volunteer with Third Eye Worldwide. Translators, open-source contributors, audio narrators, and community organisers are always welcome.',
};

function scriptFor(pathname) {
  return TOUR_SCRIPTS[pathname] || TOUR_SCRIPTS['/'];
}

export default function AudioTour() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_DELAY_SECONDS);
  const autoTimerRef = useRef(null);
  const tickTimerRef = useRef(null);
  const utteranceRef = useRef(null);

  function clearTimers() {
    if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
    if (tickTimerRef.current) { clearInterval(tickTimerRef.current); tickTimerRef.current = null; }
  }

  function stopSpeech() {
    if (typeof window === 'undefined') return;
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    utteranceRef.current = null;
  }

  function speak(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
    try {
      window.speechSynthesis.cancel();
      const u = new window.SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1;
      u.volume = 1;
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
      return true;
    } catch {
      return false;
    }
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
    speak(scriptFor(pathname));
  }

  useEffect(() => {
    let existing = null;
    try { existing = sessionStorage.getItem(CHOICE_KEY); } catch {}

    if (typeof window !== 'undefined') {
      window.startAudioTour = () => {
        clearTimers();
        setVisible(false);
        speak(scriptFor(window.location.pathname));
      };
      window.stopAudioTour = () => {
        clearTimers();
        setVisible(false);
        stopSpeech();
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
      stopSpeech();
    };
    // Run once on mount; pathname-specific script resolved at play time.
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
