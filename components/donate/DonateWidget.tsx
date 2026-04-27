'use client';

import { useState } from 'react';
import { isValidEmail } from '@/lib/validators';
import {
  CurrencyDollar,
  Gift,
  Heart,
  Info,
  Repeat,
  SealCheck,
} from '@/components/icons';

/*
 * Donation widget. Owns every interactive piece of the /donate page:
 *   - monthly / one-time mode toggle
 *   - free-text amount input (donor decides what to give)
 *   - donor fields
 *   - submit to /api/cms/submissions/donation
 *   - live status line
 *
 * Per the v2 content update, the previous tier grid (preset amounts
 * with "impact lines") is replaced with a single amount input. The
 * impact lines were aspirational — the org just incorporated and
 * doesn't yet have audited program-spend numbers to back them up.
 */

type DonationMode = 'monthly' | 'once';

function parseAmount(str: string | undefined): number {
  if (!str) return 0;
  const num = Number(String(str).replace(/[^0-9.]/g, ''));
  return Number.isNaN(num) ? 0 : num;
}

export default function DonateWidget() {
  const [mode, setMode] = useState<DonationMode>('monthly');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [onceAmount, setOnceAmount] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  // MED-1 honeypot — humans never see this field (visually hidden,
  // taken out of the tab order, off the a11y tree). Bots that fill
  // every input blindly will fill this one too, and the API drops
  // any submission where it's non-empty.
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  async function submit(submitMode: DonationMode) {
    const raw = submitMode === 'monthly' ? monthlyAmount : onceAmount;
    const amount = parseAmount(raw);

    if (!first.trim() || !last.trim()) {
      setStatus({ text: 'Please enter your name.', error: true });
      return;
    }
    if (!isValidEmail(email)) {
      setStatus({ text: 'Please enter a valid email.', error: true });
      return;
    }
    if (!amount || amount <= 0) {
      setStatus({ text: 'Please enter an amount.', error: true });
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
          website,
        }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      // The form registers an INTENT to give. No card is charged on this
      // page — payment processing happens in a later step run by the
      // Third Eye team. Be explicit so donors don't think they're done.
      setStatus({
        text: `Thank you! We've sent a confirmation link to ${email}. Please click it to complete your submission — no payment is taken on this page.`,
        error: false,
      });
      // Reset every field so the form looks clean after success and a
      // donor doesn't accidentally re-submit the same payload twice.
      setFirst(''); setLast(''); setEmail(''); setNote('');
      setMonthlyAmount(''); setOnceAmount('');
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
          <Repeat size="1em" aria-hidden="true" />{' '}
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
          <CurrencyDollar size="1em" aria-hidden="true" />{' '}
          <span className="t-label">One-time</span>
        </button>
      </div>

      {mode === 'monthly' ? (
        <div data-donate-mode="monthly">
          <div className="custom-amount custom-amount-solo">
            <label htmlFor="donate-amount-monthly" className="custom-amount-label">
              Choose your amount
            </label>
            <div className="custom-amount-input">
              <span className="cur">$</span>
              <input
                id="donate-amount-monthly"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                maxLength={7}
                placeholder="Any amount"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                aria-describedby="donate-amount-help-monthly"
              />
              <span className="custom-amount-suffix">/ month</span>
            </div>
            <p id="donate-amount-help-monthly" className="custom-amount-help">
              Whatever fits your budget. Every amount is welcome.
            </p>
          </div>
          <p className="donate-note">
            <SealCheck weight="fill" size="1em" style={{ color: 'var(--brand)' }} aria-hidden="true" />
            {' '}Monthly donors join the <strong>Circle of Access</strong> — quarterly impact
            reports, early product access, and two community events per year.
          </p>
          <button
            type="button"
            className="btn-accent donate-submit-btn"
            onClick={() => submit('monthly')}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting
              ? <><span className="btn-spinner" aria-hidden="true" /> Submitting…</>
              : <><Heart weight="fill" size="1em" aria-hidden="true" /> Donate Monthly</>}
          </button>
        </div>
      ) : (
        <div data-donate-mode="once">
          <div className="custom-amount custom-amount-solo">
            <label htmlFor="donate-amount-once" className="custom-amount-label">
              Choose your amount
            </label>
            <div className="custom-amount-input">
              <span className="cur">$</span>
              <input
                id="donate-amount-once"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                maxLength={7}
                placeholder="Any amount"
                value={onceAmount}
                onChange={(e) => setOnceAmount(e.target.value)}
                aria-describedby="donate-amount-help-once"
              />
              <span className="custom-amount-suffix">once</span>
            </div>
            <p id="donate-amount-help-once" className="custom-amount-help">
              Whatever fits your budget. Every amount is welcome.
            </p>
          </div>
          <p className="donate-note">
            <Gift weight="fill" size="1em" style={{ color: 'var(--accent)' }} aria-hidden="true" />
            {' '}One-time gifts of $500+ can be directed to a specific program. Your gift is
            tax-deductible in the US, UK, Canada, and India.
          </p>
          <button
            type="button"
            className="btn-primary donate-submit-btn"
            onClick={() => submit('once')}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting
              ? <><span className="btn-spinner" aria-hidden="true" /> Submitting…</>
              : <><CurrencyDollar size="1em" aria-hidden="true" /> Give Once</>}
          </button>
        </div>
      )}

      <div style={{ marginTop: 36 }}>
        <h3 className="donate-details-heading">Your details</h3>
        <div className="donate-payment-notice" role="note">
          <Info weight="fill" size="1em" aria-hidden="true" />
          {' '}<strong>This form registers your donation interest.</strong>
          {' '}No payment is taken on this page — a member of our team
          will reach out to complete your gift through a secure checkout.
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
        {/* MED-1 honeypot. Hidden from humans (off-screen, out of tab
            order, hidden from a11y tree). Bots fill every input. */}
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
        <div
          id="donate-status"
          aria-live="polite"
          className={`donate-status${status.error ? ' donate-status--error' : ''}`}
        >
          {status.text}
        </div>
      </div>
    </div>
  );
}
