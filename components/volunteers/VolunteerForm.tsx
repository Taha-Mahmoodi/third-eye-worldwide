'use client';

import { useState } from 'react';

const HOURS_OPTIONS = ['1–2 hours', '3–5 hours', '6–10 hours', '10+ hours'];

/*
 * Volunteer application form. Submits to /api/cms/submissions/volunteer.
 * `roles` is the CMS role list — checkbox labels come from role.title.
 */
interface RoleOpt { title?: string }
interface VolunteerFormProps { roles: RoleOpt[] }

export default function VolunteerForm({ roles }: VolunteerFormProps) {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [hours, setHours] = useState(HOURS_OPTIONS[0]);
  const [message, setMessage] = useState('');
  const [chosen, setChosen] = useState<Set<string>>(() => new Set<string>());
  const [status, setStatus] = useState<{ text: string; error: boolean }>({
    text: 'We accept applications from anywhere. Reviewed in the order received.',
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
    if (!/\S+@\S+\.\S+/.test(email)) {
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
        }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setStatus({ text: 'Thank you — we read every application within 48 hours.', error: false });
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
          placeholder="A few sentences about your interests and why TEWW…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={submit}
        disabled={submitting}
      >
        <i className="ph ph-paper-plane-tilt" aria-hidden="true"></i> Submit Application
      </button>
      <p
        aria-live="polite"
        className="vol-status"
        style={{ color: status.error ? 'var(--accent)' : 'var(--fg-muted)' }}
      >
        {status.text}
      </p>
    </div>
  );
}
