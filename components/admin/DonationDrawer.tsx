'use client';

import { useEffect, useState } from 'react';
import SubmissionDrawer from './SubmissionDrawer';
import { CurrencyDollar, PaperPlaneTilt, Repeat, SealCheck } from '@/components/icons';
import type { DonationRow } from './DonationsClient';
import {
  DONATION_STATUSES,
  type DonationStatus,
} from '@/lib/constants';

/*
 * Donation drawer — same shape as VolunteerDrawer, with donation-
 * specific fields (amount, currency, mode, donor note) and the
 * cents-to-dollars conversion.
 */
export interface DonationDrawerProps {
  row: DonationRow | null;
  onClose: () => void;
  onPatch: (id: number, patch: Partial<DonationRow>) => void;
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatAmount(cents: number, currency: string): string {
  // DB-1 / CMS-1: amounts are integer cents; format dollars at the edge.
  const dollars = cents / 100;
  if (currency === 'USD') return usd.format(dollars);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(dollars);
  } catch {
    return `${dollars.toFixed(2)} ${currency}`;
  }
}

export default function DonationDrawer({ row, onClose, onPatch }: DonationDrawerProps) {
  const [adminNote, setAdminNote] = useState(row?.adminNote ?? '');
  const [status, setStatus] = useState<DonationStatus>(
    (row?.status as DonationStatus) ?? 'pending',
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setAdminNote(row?.adminNote ?? '');
    setStatus((row?.status as DonationStatus) ?? 'pending');
    setErrorMsg(null);
    setSavedAt(null);
  }, [row]);

  if (!row) return null;

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/cms/submissions/donation/${row!.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const next: Partial<DonationRow> = {
        ...body,
        updatedAt: new Date().toISOString(),
      };
      onPatch(row!.id, next);
      setSavedAt(new Date());
    } catch (e) {
      setErrorMsg(`Save failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  const noteUnsaved = adminNote !== (row.adminNote ?? '');
  const followupSubject = encodeURIComponent(
    `Re: Your donation to Third Eye Worldwide`,
  );
  const amountStr = formatAmount(row.amount, row.currency);
  const followupBody = encodeURIComponent(
    `Hi ${row.name},\n\nThank you for your ${amountStr} ${row.mode} gift. `,
  );

  return (
    <SubmissionDrawer
      open={!!row}
      onClose={onClose}
      title={row.name}
      subtitle={row.email}
      id={`donation-${row.id}`}
    >
      <dl className="adm-drawer-fields">
        <dt>Amount</dt>
        <dd className="adm-drawer-amount">{amountStr}</dd>

        <dt>Mode</dt>
        <dd>
          <span className="adm-badge adm-badge-mode">
            {row.mode === 'monthly' ? (
              <Repeat size="1em" aria-hidden="true" />
            ) : (
              <CurrencyDollar size="1em" aria-hidden="true" />
            )}{' '}
            {row.mode}
          </span>
        </dd>

        <dt>Currency</dt>
        <dd>{row.currency}</dd>

        <dt>Status</dt>
        <dd>
          <select
            className="adm-status-select"
            value={status}
            onChange={(e) => {
              const next = e.target.value as DonationStatus;
              setStatus(next);
              patch({ status: next });
            }}
            disabled={saving}
            aria-label="Status"
          >
            {DONATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </dd>

        <dt>Confirmed</dt>
        <dd>
          {row.confirmed ? (
            <span className="adm-badge adm-badge-ok">
              <SealCheck size="1em" weight="fill" aria-hidden="true" /> yes
            </span>
          ) : (
            <span className="adm-badge adm-badge-muted">no</span>
          )}
        </dd>

        <dt>Donor note</dt>
        <dd className="adm-drawer-prose">
          {row.note ? row.note : <span className="adm-empty">No note from donor.</span>}
        </dd>

        <dt>Created</dt>
        <dd>{new Date(row.createdAt).toLocaleString()}</dd>

        <dt>Updated</dt>
        <dd>{new Date(row.updatedAt).toLocaleString()}</dd>
      </dl>

      <hr className="adm-drawer-divider" />

      <label htmlFor={`don-admin-note-${row.id}`} className="adm-drawer-label">
        Admin note <span className="adm-hint">(internal — never sent to the donor)</span>
      </label>
      <textarea
        id={`don-admin-note-${row.id}`}
        className="adm-drawer-textarea"
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        placeholder="Receipt sent? Designated to a program?"
        rows={4}
      />
      <div className="adm-drawer-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => patch({ adminNote: adminNote || null })}
          disabled={saving || !noteUnsaved}
          aria-busy={saving}
        >
          {saving ? 'Saving…' : 'Save note'}
        </button>
        <a
          className="adm-btn-quiet"
          href={`mailto:${row.email}?subject=${followupSubject}&body=${followupBody}`}
        >
          <PaperPlaneTilt size="1em" aria-hidden="true" /> Send follow-up email
        </a>
      </div>

      {errorMsg ? (
        <p className="adm-status adm-status-error" role="alert">{errorMsg}</p>
      ) : null}
      {savedAt && !errorMsg ? (
        <p className="adm-status adm-status-ok" role="status">
          Saved at {savedAt.toLocaleTimeString()}
        </p>
      ) : null}
    </SubmissionDrawer>
  );
}
