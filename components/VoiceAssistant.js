'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/*
 * TE — Third Eye voice assistant.
 *
 * On every page load TE arms herself and waits for the user's first
 * gesture (a click, tap, or keypress — anything that satisfies the
 * browser's "must follow user activation" rule for mic + speech). On
 * that gesture she requests microphone permission, plays a short
 * spoken intro, and starts listening continuously for the wake word
 * "Hey TE" (plus a few common variants).
 *
 * The launch-time toast (rendered by AudioTour.js) calls the global
 * window.startTeTour() to hand control to TE explicitly.
 *
 * Sensitivity: SpeechRecognition runs continuous + interim, restarts
 * with a 100 ms debounce after onend, and the wake-word regex matches
 * "hey TE", "hi TE", "okay TE", "hey tee", "hey t e", "hey t.e."
 * (plus a final-result-only fallback that fires on a bare "TE"
 * uttered alone).
 *
 * Browser support: window.SpeechRecognition / webkitSpeechRecognition
 * (Chrome, Edge, Safari). Without it, the panel shows a support note
 * instead of the listening UI.
 *
 * Testability: window.__teSimulate(text) runs a phrase through the
 * intent router without needing a real microphone.
 */

const PAGE_ROUTES = {
  home:       { path: '/',            aliases: ['home', 'the home page', 'main page', 'start page', 'front page'] },
  about:      { path: '/about',       aliases: ['about', 'about page', 'about us'] },
  projects:   { path: '/projects',    aliases: ['projects', 'project page', 'projects page', 'programs', 'program', 'our projects'] },
  donate:     { path: '/donate',      aliases: ['donate', 'donate page', 'donation', 'donations', 'give', 'contribute'] },
  media:      { path: '/media',       aliases: ['media', 'media page', 'photos', 'podcasts', 'videos'] },
  documents:  { path: '/documents',   aliases: ['documents', 'document page', 'blogs', 'blog', 'stories', 'story'] },
  volunteers: { path: '/volunteers',  aliases: ['volunteers', 'volunteer', 'volunteer page', 'get involved'] },
  comingSoon: { path: '/coming-soon', aliases: ['coming soon', 'launch', 'countdown'] },
};

const HELP_TEXT = (
  'You can ask me to go to pages like home, about, projects, donate, media, documents, or volunteers. ' +
  'Or say: scroll down, scroll up, top of page, bottom of page, read this page, dark mode, or stop listening.'
);

const INTRO_TEXT = (
  "Hi, I'm TE — Third Eye Worldwide's voice guide. " +
  'I can take you anywhere on this site by voice. ' +
  'Just say "Hey TE" followed by where you want to go. ' +
  'For example, "Hey TE, projects." Or "Hey TE, dark mode." ' +
  'Say "Hey TE, help" to hear everything I can do. ' +
  "I'm listening now."
);

// Wake-word regex. Tolerates the common dictation outputs Chrome/Edge
// produce for "hey TE": "hey te", "hey tee", "hey t e", "hey t.e.",
// and the synonyms "hi TE" / "okay TE". Also accepts "yo TE".
const WAKE_RE = /\b(hey|hi|okay|ok|yo)\s+(te|tee|t\s*e|t\.\s*e\.?)\b/i;

// Fallback wake: a final transcript that's *just* the syllable "te"
// or "tee" by itself. Tighter than the prefix regex so we don't
// false-fire on words like "tea", "tell", "team".
const BARE_WAKE_RE = /^(te|tee)[\s.,!?]*$/i;

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return null;
  try {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
    return u;
  } catch {
    return null;
  }
}

/**
 * Parse a raw command string and return an { intent, payload, confirm }
 * descriptor. Keyword-based; not a general NLU.
 */
export function parseCommand(raw) {
  const text = String(raw || '').trim().toLowerCase();
  if (!text) return { intent: 'noop' };

  if (/\b(stop listening|disable te|turn off|sleep|goodbye|bye)\b/.test(text)) {
    return { intent: 'disable', confirm: 'Goodbye. Tap the TE button to wake me again.' };
  }
  if (/\b(help|what can (i|you) (say|do)|commands?)\b/.test(text)) {
    return { intent: 'help', confirm: HELP_TEXT };
  }

  if (/\bpause (the )?(audio|tour)\b/.test(text))  return { intent: 'audio-pause',  confirm: 'Pausing the audio tour.' };
  if (/\b(resume|play|continue) (the )?(audio|tour)\b/.test(text))
    return { intent: 'audio-resume', confirm: 'Resuming the audio tour.' };
  if (/\bstop (the )?(audio|tour)\b/.test(text))   return { intent: 'audio-stop',   confirm: 'Stopping the audio tour.' };
  if (/\b(start|play) (the )?(audio tour|tour)\b/.test(text))
    return { intent: 'audio-start', confirm: 'Starting the audio tour.' };

  if (/\b(scroll (down|to the bottom)|go down|page down)\b/.test(text))
    return { intent: 'scroll', payload: 'down', confirm: 'Scrolling down.' };
  if (/\b(scroll (up|to the top)|go up|page up)\b/.test(text))
    return { intent: 'scroll', payload: 'up', confirm: 'Scrolling up.' };
  if (/\b(top of (the )?page|back to top|top)\b/.test(text))
    return { intent: 'scroll', payload: 'top', confirm: 'Going to the top.' };
  if (/\b(bottom of (the )?page|end of (the )?page|bottom)\b/.test(text))
    return { intent: 'scroll', payload: 'bottom', confirm: 'Going to the bottom.' };

  if (/\b(read|describe) (this|the) (page|thing)\b/.test(text) || /\bread it\b/.test(text))
    return { intent: 'read-page', confirm: 'Reading the page.' };

  if (/\b(dark|night) (mode|theme)\b/.test(text))          return { intent: 'theme', payload: 'dark',          confirm: 'Switching to dark mode.' };
  if (/\b(light|day) (mode|theme)\b/.test(text))           return { intent: 'theme', payload: 'light',         confirm: 'Switching to light mode.' };
  if (/\bhigh[\s-]?contrast( mode| theme)?\b/.test(text))  return { intent: 'theme', payload: 'high-contrast', confirm: 'High contrast mode on.' };

  // Navigation — "go to X", "open X", "take me to X", etc., or just the page name.
  const navMatch = text.match(/\b(go to|open|take me to|navigate to|show me)\s+(.+)$/);
  const candidate = navMatch ? navMatch[2].trim() : text.trim();
  for (const [key, { path, aliases }] of Object.entries(PAGE_ROUTES)) {
    for (const a of aliases) {
      if (candidate === a || candidate.endsWith(' ' + a) || candidate.startsWith(a + ' ') || candidate === a.replace(/\s+/g, '')) {
        return { intent: 'navigate', payload: path, confirm: `Going to ${key === 'comingSoon' ? 'coming soon' : key}.` };
      }
    }
  }

  return { intent: 'unknown', confirm: "Sorry, I didn't catch that. Say help to hear what I can do." };
}

export default function VoiceAssistant() {
  const router = useRouter();
  const [supported, setSupported] = useState(true);
  // 'idle' | 'listening' | 'awake' | 'disabled'
  const [status, setStatus] = useState('disabled');
  const [lastHeard, setLastHeard] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const recognitionRef = useRef(null);
  const awakeRef = useRef(false);
  const enabledRef = useRef(false);
  const restartTimerRef = useRef(null);
  const armedRef = useRef(false);

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  function executeIntent(descriptor) {
    const { intent, payload, confirm } = descriptor || {};
    if (confirm) speak(confirm);
    switch (intent) {
      case 'navigate':
        if (payload) router.push(payload);
        break;
      case 'scroll': {
        if (payload === 'down')   window.scrollBy({ top:  window.innerHeight * 0.8, behavior: 'smooth' });
        if (payload === 'up')     window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
        if (payload === 'top')    window.scrollTo({ top: 0, behavior: 'smooth' });
        if (payload === 'bottom') window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        break;
      }
      case 'read-page': {
        const h = document.querySelector('main h1, main h2');
        const p = document.querySelector('main p');
        const parts = [h?.innerText, p?.innerText].filter(Boolean);
        if (parts.length) speak(parts.join('. '));
        else speak("I couldn't find readable content on this page.");
        break;
      }
      case 'audio-start':  window.startAudioTour?.();  break;
      case 'audio-pause':  window.pauseAudioTour?.();  break;
      case 'audio-resume': window.resumeAudioTour?.(); break;
      case 'audio-stop':   window.stopAudioTour?.();   break;
      case 'theme':        window.setTheme?.(payload); break;
      case 'disable':      disable();                  break;
      case 'help': /* HELP_TEXT already spoken via confirm */ break;
      default: /* unknown / noop */ break;
    }
  }

  function handleCommand(text) {
    setLastHeard(text);
    executeIntent(parseCommand(text));
    awakeRef.current = false;
    if (statusRef.current !== 'disabled') setStatus('listening');
  }

  function startRecognition() {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      if (!enabledRef.current) return;
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const lower = transcript.trim().toLowerCase();
      if (!lower) return;

      const lastFinal = event.results[event.results.length - 1].isFinal;

      if (!awakeRef.current) {
        // Tier 1 — explicit prefix "hey/hi/okay/yo TE".
        if (WAKE_RE.test(lower)) {
          awakeRef.current = true;
          setStatus('awake');
          const rest = lower.replace(/.*?\b(hey|hi|okay|ok|yo)\s+(te|tee|t\s*e|t\.\s*e\.?)\b/i, '').trim();
          if (rest && lastFinal) {
            handleCommand(rest);
            return;
          }
          speak('Yes?');
          return;
        }
        // Tier 2 — bare "TE" / "tee" alone, only when the recogniser
        // says it's a final result, so we don't false-fire on partials.
        if (lastFinal && BARE_WAKE_RE.test(lower)) {
          awakeRef.current = true;
          setStatus('awake');
          speak('Yes?');
        }
      } else if (lastFinal) {
        handleCommand(lower);
      }
    };
    rec.onerror = () => { /* swallow — onend will restart */ };
    rec.onend = () => {
      if (!enabledRef.current) return;
      clearTimeout(restartTimerRef.current);
      // Aggressive restart so the recogniser doesn't sit idle between
      // utterances (was 300 ms — 100 ms feels noticeably snappier).
      restartTimerRef.current = setTimeout(() => {
        if (!enabledRef.current) return;
        try { rec.start(); } catch { startRecognition(); }
      }, 100);
    };
    recognitionRef.current = rec;
    try { rec.start(); setStatus('listening'); } catch {}
  }

  function enable({ intro = false } = {}) {
    enabledRef.current = true;
    armedRef.current = false;
    setStatus('listening');
    startRecognition();
    if (intro) speak(INTRO_TEXT);
    else       speak('TE here. Say hey T E to give me a command.');
  }

  function disable() {
    enabledRef.current = false;
    awakeRef.current = false;
    setStatus('disabled');
    clearTimeout(restartTimerRef.current);
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    try { window.speechSynthesis?.cancel(); } catch {}
  }

  // Arm TE: the *next* user gesture (click/tap/key) auto-enables her.
  // Browsers won't grant mic permission without an activation, so we
  // can't truly auto-enable — but this means the user only has to do
  // *one* thing (the next click anywhere) to start TE.
  function armOnNextGesture(opts = {}) {
    if (typeof window === 'undefined' || armedRef.current || enabledRef.current) return;
    armedRef.current = true;
    const onGesture = () => {
      window.removeEventListener('pointerdown', onGesture, true);
      window.removeEventListener('keydown', onGesture, true);
      if (!enabledRef.current) enable(opts);
    };
    window.addEventListener('pointerdown', onGesture, true);
    window.addEventListener('keydown', onGesture, true);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);

    window.__teSimulate = (text) => {
      setLastHeard(text);
      const descriptor = parseCommand(text);
      executeIntent(descriptor);
      return descriptor;
    };

    // Public hook that the launch toast (AudioTour) calls when its
    // countdown runs out. TE introduces herself and starts listening
    // — but only on the *next* user gesture, since browsers require
    // activation for mic + speech.
    window.startTeTour = () => {
      if (!SR) return;
      armOnNextGesture({ intro: true });
    };

    // Also arm on first mount in case the launch toast was already
    // dismissed in this session (returning visitor) — TE still wakes
    // up the next time the user clicks anywhere on the page.
    let alreadyChose = null;
    try { alreadyChose = sessionStorage.getItem('teww-tour-choice'); } catch {}
    if (SR && alreadyChose !== 'no-audio' && !enabledRef.current) {
      // Pre-arm without intro; toast will retrigger with intro:true.
      armOnNextGesture({ intro: false });
    }

    return () => {
      enabledRef.current = false;
      clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.stop(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel = {
    disabled:  'TE is off',
    listening: 'Listening for "Hey TE"',
    awake:     "Yes? I'm listening",
  }[status] || 'TE';

  const dotClass = {
    disabled:  'te-dot-off',
    listening: 'te-dot-listen',
    awake:     'te-dot-awake',
  }[status] || '';

  return (
    <>
      <button
        type="button"
        className={`te-fab te-status-${status}`}
        onClick={() => setPanelOpen((o) => !o)}
        aria-label={panelOpen ? 'Close TE voice assistant panel' : 'Open TE voice assistant panel'}
        aria-expanded={panelOpen}
        aria-controls="te-panel"
      >
        <span className={`te-dot ${dotClass}`} aria-hidden="true"></span>
        <span className="te-fab-label">TE</span>
      </button>

      {panelOpen ? (
        <div id="te-panel" className="te-panel" role="dialog" aria-label="TE voice assistant">
          <div className="te-panel-head">
            <div className="te-panel-title">
              <span className={`te-dot ${dotClass}`} aria-hidden="true"></span>
              {statusLabel}
            </div>
            <button
              type="button"
              className="te-panel-close"
              onClick={() => setPanelOpen(false)}
              aria-label="Close panel"
            >
              <i className="ph ph-x" aria-hidden="true"></i>
            </button>
          </div>

          {supported ? (
            <>
              <p className="te-panel-desc">
                I&apos;m TE — Third Eye&apos;s voice guide. {status === 'disabled'
                  ? 'Enable me, then just say '
                  : 'Say '}
                <strong>&ldquo;Hey&nbsp;TE&rdquo;</strong> and tell me where you want to go.
              </p>

              <div className="te-panel-actions">
                {status === 'disabled' ? (
                  <button type="button" className="btn-primary te-btn-enable" onClick={() => enable({ intro: true })}>
                    <i className="ph-fill ph-microphone"></i> Enable TE
                  </button>
                ) : (
                  <button type="button" className="btn-secondary te-btn-disable" onClick={disable}>
                    <i className="ph ph-microphone-slash"></i> Turn off
                  </button>
                )}
              </div>

              <details className="te-panel-cheats">
                <summary>What can I say?</summary>
                <ul>
                  <li><em>&ldquo;Hey TE, go to projects&rdquo;</em> — navigate to any page.</li>
                  <li><em>&ldquo;Hey TE, scroll down / top of page&rdquo;</em> — jump around.</li>
                  <li><em>&ldquo;Hey TE, read this page&rdquo;</em> — TE reads the heading + intro.</li>
                  <li><em>&ldquo;Hey TE, pause audio / resume audio&rdquo;</em> — control the audio tour.</li>
                  <li><em>&ldquo;Hey TE, dark mode&rdquo;</em> — switch theme.</li>
                  <li><em>&ldquo;Hey TE, help&rdquo;</em> — list everything.</li>
                  <li><em>&ldquo;Hey TE, goodbye&rdquo;</em> — turn me off.</li>
                </ul>
              </details>

              {lastHeard ? (
                <div className="te-last" aria-live="polite">
                  <span className="te-last-lbl">Last heard:</span> &ldquo;{lastHeard}&rdquo;
                </div>
              ) : null}
            </>
          ) : (
            <p className="te-panel-desc">
              Your browser doesn&apos;t support the Web Speech API. TE works best in
              Chrome, Edge, or Safari on desktop and Android.
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
