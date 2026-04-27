'use client';

import { useState } from 'react';
import { isValidEmail } from '@/lib/validators';
import { PaperPlaneTilt } from '@/components/icons';

const HOURS_OPTIONS = ['1–2 hours', '3–5 hours', '6–10 hours', '10+ hours'];
const MESSAGE_MAX = 2000;

/*
 * Volunteer application form. Submits to /api/cms/submissions/volunteer.
 * `roles` is the CMS role list — checkbox labels come from role.title.
 */
import type { CmsItemMeta } from '@/lib/types';

export interface RoleOpt extends CmsItemMeta {
  title?: string;
  desc?: string;
  icon?: string;
  tag1?: string;
  tag2?: string;
}
export interface VolunteerFormProps {
  roles: RoleOpt[];
}

export default function VolunteerForm({ roles }: VolunteerFormProps) {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [hours, setHours] = useState(HOURS_OPTIONS[0]);
  const [message, setMessage] = useState('');
  const [chosen, setChosen] = useState<Set<string>>(() => new Set<string>());
  // MED-1 honeypot — see DonateWidget for the explanation.
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<{ text: string; error: boolean }>({
    text: "We accept applications from anywhere. We read every one personally — it may take us a few days to respond, especially if many come in at once.",
    error: false,
  });
  const [submitting, setSubmitting] = useState(false);

  function toggleRole(title: string) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  async function submit() {
    if (!first.trim() || !last.trim()) {
      setStatus({ text: 'Please enter your name.', error: true });
      return;
    }
    if (!isValidEmail(email)) {
      setStatus({ text: 'Please enter a valid email.', error: true });
      return;
    }
    setSubmitting(true);
    setStatus({ text: 'Submitting…', error: false });
    try {
      const r = await fetch('/api/cms/submissions/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${first} ${last}`.trim(),
          email,
          role: Array.from(chosen).join(', ') || null,
          skills: [country, hours].filter(Boolean).join(' · ') || null,
          message: message || null,
          website,
        }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setStatus({
        text: `Application received! We've sent a confirmation link to ${email}. Click it to confirm, and we'll be in touch within 48 hours.`,
        error: false,
      });
      // Reset every field on success.
      setFirst(''); setLast(''); setEmail('');
      setCountry(''); setMessage('');
      setChosen(new Set<string>());
      setHours(HOURS_OPTIONS[0]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus({ text: `Could not submit: ${msg}`, error: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="vol-form">
      <h3>Apply to volunteer</h3>
      <div className="pay-row">
        <div className="pay-field">
          <label htmlFor="vol-first">First name</label>
          <input id="vol-first" type="text" placeholder="Jane" value={first} onChange={(e) => setFirst(e.target.value)} />
        </div>
        <div className="pay-field">
          <label htmlFor="vol-last">Last name</label>
          <input id="vol-last" type="text" placeholder="Smith" value={last} onChange={(e) => setLast(e.target.value)} />
        </div>
      </div>
      <div className="pay-field">
        <label htmlFor="vol-email">Email</label>
        <input id="vol-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {/* MED-1 honeypot. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{
          position: 'absolute',
          left: '-9999px',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <div className="pay-field">
        <label htmlFor="vol-country">Country / time zone</label>
        <input id="vol-country" type="text" placeholder="e.g. Lagos, WAT (UTC+1)" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <div className="pay-field">
        <label>Preferred roles (pick all that apply)</label>
        <div className="checkbox-grid" style={{ marginTop: 4 }}>
          {roles.map((r: RoleOpt) => (
            <label key={r.title} className="cb-pill">
              <input
                type="checkbox"
                value={r.title || ''}
                checked={chosen.has(r.title || '')}
                onChange={() => toggleRole(r.title || '')}
              />{' '}
              {r.title || ''}
            </label>
          ))}
        </div>
      </div>
      <div className="pay-field">
        <label htmlFor="vol-hours">Hours per week you can commit</label>
        <select id="vol-hours" value={hours} onChange={(e) => setHours(e.target.value)}>
          {HOURS_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
        </select>
      </div>
      <div className="pay-field">
        <label htmlFor="vol-message">Tell us about yourself (optional)</label>
        <textarea
          id="vol-message"
          rows={3}
          className="vol-textarea"
          maxLength={MESSAGE_MAX}
          placeholder="A few sentences about your interests and why TEWW…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-describedby="vol-message-counter"
        />
        <p
          id="vol-message-counter"
          className={`char-counter${message.length >= MESSAGE_MAX * 0.9 ? ' char-counter--warn' : ''}`}
          aria-live="polite"
        >
          {message.length} / {MESSAGE_MAX}
        </p>
      </div>
      <button
        type="button"
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={submit}
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting
          ? <><span className="btn-spinner" aria-hidden="true" /> Submitting…</>
          : <><PaperPlaneTilt size="1em" aria-hidden="true" /> Submit Application</>}
      </button>
      <p
        aria-live="polite"
        className={`vol-status${status.error ? ' donate-status--error' : ''}`}
      >
        {status.text}
      </p>
    </div>
  );
}
