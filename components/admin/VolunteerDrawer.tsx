'use client';

import { useEffect, useState } from 'react';
import SubmissionDrawer from './SubmissionDrawer';
import { PaperPlaneTilt, SealCheck } from '@/components/icons';
import type { VolunteerRow } from './VolunteersClient';
import {
  VOLUNTEER_STATUSES,
  type VolunteerStatus,
} from '@/lib/constants';

/*
 * Side-drawer for a single volunteer submission. Pulls every detail
 * the table truncates (message, skills) plus an admin-note textarea
 * that writes back through the existing PATCH endpoint. The
 * "Send follow-up" button is a mailto: shortcut that pre-fills the
 * subject — Resend integration for one-click sends is left for a
 * future iteration so we don't add an endpoint that depends on
 * email-template look-up tables.
 */
export interface VolunteerDrawerProps {
  row: VolunteerRow | null;
  onClose: () => void;
  /** Called when status / adminNote round-trips to the server cleanly. */
  onPatch: (id: number, patch: Partial<VolunteerRow>) => void;
}

export default function VolunteerDrawer({ row, onClose, onPatch }: VolunteerDrawerProps) {
  const [adminNote, setAdminNote] = useState(row?.adminNote ?? '');
  const [status, setStatus] = useState<VolunteerStatus>(
    (row?.status as VolunteerStatus) ?? 'new',
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Reset internal state whenever a different row opens.
  useEffect(() => {
    setAdminNote(row?.adminNote ?? '');
    setStatus((row?.status as VolunteerStatus) ?? 'new');
    setErrorMsg(null);
    setSavedAt(null);
  }, [row]);

  if (!row) return null;

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/cms/submissions/volunteer/${row!.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const next: Partial<VolunteerRow> = {
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
    `Re: Your volunteer application — Third Eye Worldwide`,
  );
  const followupBody = encodeURIComponent(
    `Hi ${row.name},\n\nThanks for your volunteer application. ` +
      `We've reviewed your interest in ${row.role || 'helping'} and `,
  );

  return (
    <SubmissionDrawer
      open={!!row}
      onClose={onClose}
      title={row.name}
      subtitle={row.email}
      id={`volunteer-${row.id}`}
    >
      <dl className="adm-drawer-fields">
        <dt>Status</dt>
        <dd>
          <select
            className="adm-status-select"
            value={status}
            onChange={(e) => {
              const next = e.target.value as VolunteerStatus;
              setStatus(next);
              patch({ status: next });
            }}
            disabled={saving}
            aria-label="Status"
          >
            {VOLUNTEER_STATUSES.map((s) => (
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

        <dt>Role of interest</dt>
        <dd>{row.role || '—'}</dd>

        <dt>Skills</dt>
        <dd className="adm-drawer-prose">{row.skills || '—'}</dd>

        <dt>Message</dt>
        <dd className="adm-drawer-prose">
          {row.message ? row.message : <span className="adm-empty">No message provided.</span>}
        </dd>

        <dt>Created</dt>
        <dd>{new Date(row.createdAt).toLocaleString()}</dd>

        <dt>Updated</dt>
        <dd>{new Date(row.updatedAt).toLocaleString()}</dd>
      </dl>

      <hr className="adm-drawer-divider" />

      <label htmlFor={`vol-admin-note-${row.id}`} className="adm-drawer-label">
        Admin note <span className="adm-hint">(internal — never sent to the volunteer)</span>
      </label>
      <textarea
        id={`vol-admin-note-${row.id}`}
        className="adm-drawer-textarea"
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        placeholder="What's the next step? Who's reached out?"
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
