'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/*
 * TE — Third Eye voice assistant.
 *
 * How it works:
 *   - User clicks "Enable TE" once to grant mic access (browser requirement).
 *   - Component then runs continuous SpeechRecognition listening for "hey TE".
 *   - On wake, TE speaks "Yes?" then listens for the next command.
 *   - The command is matched against an intent map; TE confirms verbally
 *     and performs the action (navigate, scroll, pause audio, etc).
 *   - After the command, TE goes back to wake-word mode.
 *
 * Browser support: webkitSpeechRecognition (Chrome/Edge/Safari). If the
 * API is missing, the button is disabled with a tooltip.
 *
 * Testability: exposes window.__teSimulate(command) so QA can exercise
 * the intent router without an actual microphone.
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
  'Or say: scroll down, scroll up, top of page, bottom of page, read this page, pause audio, resume audio, stop audio, or stop listening.'
);

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
  try {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch {}
}

/**
 * Parse a raw command string and return an { intent, payload, confirm }
 * descriptor. Keyword-based; not a general NLU.
 */
export function parseCommand(raw) {
  const text = String(raw || '').trim().toLowerCase();
  if (!text) return { intent: 'noop' };

  // Stop listening
  if (/\b(stop listening|disable te|turn off|sleep|goodbye|bye)\b/.test(text)) {
    return { intent: 'disable', confirm: 'Goodbye. Tap the TE button to wake me again.' };
  }

  // Help
  if (/\b(help|what can (i|you) (say|do)|commands?)\b/.test(text)) {
    return { intent: 'help', confirm: HELP_TEXT };
  }

  // Audio tour controls
  if (/\bpause (the )?(audio|tour)\b/.test(text))  return { intent: 'audio-pause',  confirm: 'Pausing the audio tour.' };
  if (/\b(resume|play|continue) (the )?(audio|tour)\b/.test(text))
    return { intent: 'audio-resume', confirm: 'Resuming the audio tour.' };
  if (/\bstop (the )?(audio|tour)\b/.test(text))   return { intent: 'audio-stop',   confirm: 'Stopping the audio tour.' };
  if (/\b(start|play) (the )?(audio tour|tour)\b/.test(text))
    return { intent: 'audio-start', confirm: 'Starting the audio tour.' };

  // Scrolling
  if (/\b(scroll (down|to the bottom)|go down|page down)\b/.test(text))
    return { intent: 'scroll', payload: 'down', confirm: 'Scrolling down.' };
  if (/\b(scroll (up|to the top)|go up|page up)\b/.test(text))
    return { intent: 'scroll', payload: 'up', confirm: 'Scrolling up.' };
  if (/\b(top of (the )?page|back to top|top)\b/.test(text))
    return { intent: 'scroll', payload: 'top', confirm: 'Going to the top.' };
  if (/\b(bottom of (the )?page|end of (the )?page|bottom)\b/.test(text))
    return { intent: 'scroll', payload: 'bottom', confirm: 'Going to the bottom.' };

  // Read the page
  if (/\b(read|describe) (this|the) (page|thing)\b/.test(text) || /\bread it\b/.test(text))
    return { intent: 'read-page', confirm: 'Reading the page.' };

  // Theme
  if (/\b(dark|night) (mode|theme)\b/.test(text))          return { intent: 'theme', payload: 'dark',          confirm: 'Switching to dark mode.' };
  if (/\b(light|day) (mode|theme)\b/.test(text))           return { intent: 'theme', payload: 'light',         confirm: 'Switching to light mode.' };
  if (/\bhigh[\s-]?contrast( mode| theme)?\b/.test(text))  return { intent: 'theme', payload: 'high-contrast', confirm: 'High contrast mode on.' };

  // Navigation — "go to X", "open X", "take me to X", "navigate to X", or just "X" at end.
  const navMatch = text.match(/\b(go to|open|take me to|navigate to|show me)\s+(.+)$/);
  const candidate = navMatch ? navMatch[2].trim() : text.trim();
  for (const [key, { path, aliases }] of Object.entries(PAGE_ROUTES)) {
    for (const a of aliases) {
      // Must match as whole phrase (suffix, or the entire command after a nav verb).
      if (candidate === a || candidate.endsWith(' ' + a) || candidate.startsWith(a + ' ') || candidate === a.replace(/\s+/g, '') ) {
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

  // Mirror status to a ref so recognition handlers see current state.
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
      case 'audio-start':
        window.startAudioTour?.();
        break;
      case 'audio-pause':
        window.pauseAudioTour?.();
        break;
      case 'audio-resume':
        window.resumeAudioTour?.();
        break;
      case 'audio-stop':
        window.stopAudioTour?.();
        break;
      case 'theme':
        window.setTheme?.(payload);
        break;
      case 'disable':
        disable();
        break;
      case 'help':
        // HELP_TEXT already read aloud via confirm.
        break;
      case 'unknown':
      default:
        // speak() already handled
        break;
    }
  }

  function handleCommand(text) {
    setLastHeard(text);
    const descriptor = parseCommand(text);
    executeIntent(descriptor);
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

      if (!awakeRef.current) {
        // Wake word detection — tolerate "hey te", "hey tee", "hey t e", "hey t.e."
        if (/\bhey\s+(te|tee|t\s*e|t\.\s*e\.?)\b/.test(lower)) {
          awakeRef.current = true;
          setStatus('awake');
          // Trim the wake phrase and see if a command followed in the same breath.
          const rest = lower.replace(/.*\bhey\s+(te|tee|t\s*e|t\.\s*e\.?)\b/, '').trim();
          if (rest && event.results[event.results.length - 1].isFinal) {
            handleCommand(rest);
            return;
          }
          speak('Yes?');
        }
      } else {
        // In awake mode — the next final transcript is the command.
        if (event.results[event.results.length - 1].isFinal) {
          handleCommand(lower);
        }
      }
    };
    rec.onerror = () => { /* swallow — will auto-restart via onend */ };
    rec.onend = () => {
      // Auto-restart while enabled; small debounce so "no-speech" doesn't
      // hot-loop the API.
      if (!enabledRef.current) return;
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        if (enabledRef.current) {
          try { rec.start(); } catch { startRecognition(); }
        }
      }, 300);
    };
    recognitionRef.current = rec;
    try { rec.start(); setStatus('listening'); } catch {}
  }

  function enable() {
    enabledRef.current = true;
    setStatus('listening');
    startRecognition();
    speak('TE here. Say hey T E to give me a command.');
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);

    // Expose a test / scripted helper. Usable from the console:
    //   window.__teSimulate('go to projects')
    // Works regardless of whether the mic is enabled.
    window.__teSimulate = (text) => {
      setLastHeard(text);
      const descriptor = parseCommand(text);
      executeIntent(descriptor);
      return descriptor;
    };

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
                  <button type="button" className="btn-primary te-btn-enable" onClick={enable}>
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
