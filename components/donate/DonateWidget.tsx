'use client';

import { useState } from 'react';
import { isValidEmail } from '@/lib/validators';

/*
 * Donation widget. Owns every interactive piece of the /donate page:
 * - monthly / one-time mode toggle
 * - amount grid + custom input (per mode)
 * - donor fields
 * - submit to /api/cms/submissions/donation
 * - live status line
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AmountItem { id?: string; amt?: string; imp?: string; [key: string]: any }
type DonationMode = 'monthly' | 'once';

function parseAmount(str: string | undefined): number {
  if (!str) return 0;
  const num = Number(String(str).replace(/[^0-9.]/g, ''));
  return Number.isNaN(num) ? 0 : num;
}

interface AmountGridProps {
  items: AmountItem[];
  selectedIdx: number;
  onPick: (i: number) => void;
}

function AmountGrid({ items, selectedIdx, onPick }: AmountGridProps) {
  return (
    <div className="amount-grid">
      {items.map((it: AmountItem, i: number) => (
        <button
          key={it.id || i}
          type="button"
          className={`amount-btn${selectedIdx === i ? ' selected' : ''}`}
          data-amount={it.amt || ''}
          onClick={() => onPick(i)}
        >
          <div className="amt">{it.amt || ''}</div>
          <div className="imp">{it.imp || ''}</div>
        </button>
      ))}
    </div>
  );
}

interface DonateWidgetProps {
  monthly: AmountItem[];
  once: AmountItem[];
}

export default function DonateWidget({ monthly, once }: DonateWidgetProps) {
  const [mode, setMode] = useState<DonationMode>('monthly');
  const [monthlyIdx, setMonthlyIdx] = useState(1);
  const [onceIdx, setOnceIdx] = useState(1);
  const [monthlyCustom, setMonthlyCustom] = useState('');
  const [onceCustom, setOnceCustom] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  function pickMonthly(i: number) { setMonthlyIdx(i); setMonthlyCustom(''); }
  function pickOnce(i: number)    { setOnceIdx(i);    setOnceCustom(''); }

  async function submit(submitMode: DonationMode) {
    const items = submitMode === 'monthly' ? monthly : once;
    const idx = submitMode === 'monthly' ? monthlyIdx : onceIdx;
    const custom = submitMode === 'monthly' ? monthlyCustom : onceCustom;
    const selected = items[idx];
    const amount = parseAmount(custom) || parseAmount(selected?.amt);

    if (!first.trim() || !last.trim()) {
      setStatus({ text: 'Please enter your name.', error: true });
      return;
    }
    if (!isValidEmail(email)) {
      setStatus({ text: 'Please enter a valid email.', error: true });
      return;
    }
    if (!amount) {
      setStatus({ text: 'Please pick or enter an amount.', error: true });
      return;
    }
    setSubmitting(true);
    setStatus({ text: 'Submitting…', error: false });
    try {
      const r = await fetch('/api/cms/submissions/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${first} ${last}`.trim(),
          email,
          amount,
          mode: submitMode,
          note,
        }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setStatus({ text: "Thank you — we'll be in touch shortly.", error: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus({ text: `Could not submit: ${msg}`, error: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="donate-toggle" role="tablist" aria-label="Donation frequency">
        <button
          type="button"
          role="tab"
          className={mode === 'monthly' ? 'active' : ''}
          aria-selected={mode === 'monthly'}
          data-mode="monthly"
          onClick={() => setMode('monthly')}
        >
          <i className="ph ph-repeat" aria-hidden="true"></i>{' '}
          <span className="t-label">Monthly</span>
        </button>
        <button
          type="button"
          role="tab"
          className={mode === 'once' ? 'active' : ''}
          aria-selected={mode === 'once'}
          data-mode="once"
          onClick={() => setMode('once')}
        >
          <i className="ph ph-currency-dollar" aria-hidden="true"></i>{' '}
          <span className="t-label">One-time</span>
        </button>
      </div>

      {mode === 'monthly' ? (
        <div data-donate-mode="monthly">
          <AmountGrid items={monthly} selectedIdx={monthlyIdx} onPick={pickMonthly} />
          <div className="custom-amount">
            <span className="cur">$</span>
            <input
              id="custom-amount-input"
              type="text"
              placeholder="Custom amount"
              value={monthlyCustom}
              onChange={(e) => setMonthlyCustom(e.target.value)}
            />
            <span className="custom-amount-suffix">/ month</span>
          </div>
          <p className="donate-note">
            <i className="ph-fill ph-seal-check" style={{ color: 'var(--brand)' }} aria-hidden="true"></i>
            {' '}Monthly donors join the <strong>Circle of Access</strong> — quarterly impact
            reports, early product access, and two community events per year.
          </p>
          <button
            type="button"
            className="btn-accent donate-submit-btn"
            onClick={() => submit('monthly')}
            disabled={submitting}
          >
            <i className="ph-fill ph-heart" aria-hidden="true"></i> Donate Monthly
          </button>
        </div>
      ) : (
        <div data-donate-mode="once">
          <AmountGrid items={once} selectedIdx={onceIdx} onPick={pickOnce} />
          <div className="custom-amount">
            <span className="cur">$</span>
            <input
              id="custom-amount-input-once"
              type="text"
              placeholder="Custom amount"
              value={onceCustom}
              onChange={(e) => setOnceCustom(e.target.value)}
            />
            <span className="custom-amount-suffix">once</span>
          </div>
          <p className="donate-note">
            <i className="ph-fill ph-gift" style={{ color: 'var(--accent)' }} aria-hidden="true"></i>
            {' '}One-time gifts of $500+ can be directed to a specific program. Your gift is
            tax-deductible in the US, UK, Canada, and India.
          </p>
          <button
            type="button"
            className="btn-primary donate-submit-btn"
            onClick={() => submit('once')}
            disabled={submitting}
          >
            <i className="ph ph-currency-dollar" aria-hidden="true"></i> Give Once
          </button>
        </div>
      )}

      <div style={{ marginTop: 36 }}>
        <h3 className="donate-details-heading">Your details</h3>
        <div className="secure-note">
          <i className="ph-fill ph-lock-simple" aria-hidden="true"></i>
          {' '}Submissions land in the TEWW admin inbox for follow-up. Connect Stripe to charge cards directly.
        </div>
        <div className="pay-row">
          <div className="pay-field">
            <label htmlFor="donor-first">First name</label>
            <input id="donor-first" type="text" placeholder="Jane" value={first} onChange={(e) => setFirst(e.target.value)} />
          </div>
          <div className="pay-field">
            <label htmlFor="donor-last">Last name</label>
            <input id="donor-last" type="text" placeholder="Smith" value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
        </div>
        <div className="pay-field">
          <label htmlFor="donor-email">Email for receipt</label>
          <input id="donor-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="pay-field">
          <label htmlFor="donor-note">Note (optional)</label>
          <input id="donor-note" type="text" placeholder="Direct my gift to a specific program" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div
          id="donate-status"
          aria-live="polite"
          className="donate-status"
          style={{ color: status.error ? 'var(--accent)' : 'var(--fg-muted)' }}
        >
          {status.text}
        </div>
      </div>
    </div>
  );
}
