'use client';

import { useState, type FormEvent } from 'react';

/*
 * "Be a guest on our first season" form. Submits to the existing
 * /api/cms/submissions/volunteer endpoint with role="Podcast guest"
 * so entries land in the admin inbox without a new table.
 */
export default function PodcastGuestForm({ guestEmail = 'guest@teww.org' }: { guestEmail?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pitch, setPitch] = useState('');
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setStatus({ text: 'Please enter your name.', error: true });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus({ text: 'Please enter a valid email.', error: true });
      return;
    }
    if (pitch.trim().length < 20) {
      setStatus({ text: 'A sentence or two about your story helps — at least 20 characters.', error: true });
      return;
    }
    setSubmitting(true);
    setStatus({ text: 'Sending…', error: false });
    try {
      const r = await fetch('/api/cms/submissions/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: 'Podcast guest',
          skills: null,
          message: pitch.trim(),
        }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setStatus({ text: "Thank you — we'll be in touch before season one airs.", error: false });
      setName(''); setEmail(''); setPitch('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus({ text: `Couldn't send: ${msg}. Email us at ${guestEmail} instead.`, error: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="pod-guest-form" onSubmit={submit} aria-labelledby="pod-guest-heading">
      <div className="pay-field">
        <label htmlFor="pg-name">Your name</label>
        <input id="pg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
      </div>
      <div className="pay-field">
        <label htmlFor="pg-email">Email</label>
        <input id="pg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="pay-field">
        <label htmlFor="pg-pitch">Your story (1–2 sentences)</label>
        <textarea
          id="pg-pitch"
          rows={4}
          className="vol-textarea"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          placeholder="What would you want to talk about on the show?"
        />
      </div>
      <button
        type="submit"
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={submitting}
      >
        <i className="ph ph-paper-plane-tilt" aria-hidden="true"></i>{' '}
        {submitting ? 'Sending…' : 'Send my pitch'}
      </button>
      <p
        aria-live="polite"
        className="vol-status"
        style={{ color: status.error ? 'var(--accent)' : 'var(--fg-muted)' }}
      >
        {status.text || <>Or email <a href={`mailto:${guestEmail}`} className="pod-guest-email">{guestEmail}</a> directly.</>}
      </p>
    </form>
  );
}
