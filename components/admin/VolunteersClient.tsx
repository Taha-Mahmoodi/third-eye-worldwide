'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  FileText,
  Funnel,
  MagnifyingGlass,
  SealCheck,
  Trash,
  Warning,
} from '@/components/icons';
import {
  VOLUNTEER_STATUSES,
  type VolunteerStatus,
} from '@/lib/constants';
import VolunteerDrawer from './VolunteerDrawer';

/*
 * Volunteer admin table — search, status filter, optimistic status
 * update, and a two-step confirmation for delete (CMS-4: replaces
 * blocking window.confirm with an inline UI). Created/Updated columns
 * surface DATABASE_FIXES DB-6's @updatedAt (CMS-6).
 *
 * CMS_ROADMAP PR #4: row click opens VolunteerDrawer with full detail
 * + admin-note textarea; "Export CSV" hits the export endpoint.
 */

export interface VolunteerRow {
  id: number;
  name: string;
  email: string;
  role: string | null;
  skills: string | null;
  message: string | null;
  status: string;
  confirmed: boolean;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VolunteersClientProps {
  initialRows: VolunteerRow[];
}

type StatusFilter = 'all' | VolunteerStatus;

export default function VolunteersClient({ initialRows }: VolunteersClientProps) {
  const [rows, setRows] = useState<VolunteerRow[]>(initialRows);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<number | null>(null);

  // Apply a partial patch from the drawer back into the live table so
  // a status edit / admin-note save shows up immediately on close.
  function applyPatch(id: number, patch: Partial<VolunteerRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  const drawerRow = drawerId !== null ? rows.find((r) => r.id === drawerId) ?? null : null;

  // Pre-compute filtered view. The dataset is bounded at 1000 rows so
  // a per-keystroke linear filter is fine and avoids a debounce.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.email} ${r.role ?? ''} ${r.skills ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, statusFilter]);

  async function updateStatus(id: number, next: VolunteerStatus) {
    setBusyId(id);
    setErrorMsg(null);
    // Optimistic update — revert on failure.
    const previous = rows;
    setRows((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, status: next, updatedAt: new Date().toISOString() } : r,
      ),
    );
    try {
      const res = await fetch(`/api/cms/submissions/volunteer/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      setRows(previous);
      setErrorMsg(`Status update failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete(id: number) {
    setPendingDeleteId(null);
    setBusyId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/cms/submissions/volunteer/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRows((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      setErrorMsg(`Delete failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyId(null);
    }
  }

  const visibleStatusCount = (s: VolunteerStatus) =>
    rows.filter((r) => r.status === s).length;

  return (
    <>
      <header className="adm-page-header adm-page-header-row">
        <div>
          <h1>Volunteers</h1>
          <p className="adm-page-sub">
            {rows.length.toLocaleString()} total · showing {visible.length.toLocaleString()}
          </p>
        </div>
        <a
          className="adm-btn-quiet"
          href="/api/cms/submissions/export?type=volunteers"
          download
        >
          <FileText size="1em" aria-hidden="true" /> Export CSV
        </a>
      </header>

      <div className="adm-toolbar">
        <label className="adm-search">
          <MagnifyingGlass size="1em" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search name, email, role, skills…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search volunteers"
          />
        </label>

        <div className="adm-filter-group" role="group" aria-label="Status filter">
          <Funnel size="1em" aria-hidden="true" />
          <button
            type="button"
            className={`adm-filter-pill${statusFilter === 'all' ? ' active' : ''}`}
            aria-pressed={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            All <span className="adm-filter-count">({rows.length})</span>
          </button>
          {VOLUNTEER_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`adm-filter-pill${statusFilter === s ? ' active' : ''}`}
              aria-pressed={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            >
              {s} <span className="adm-filter-count">({visibleStatusCount(s)})</span>
            </button>
          ))}
        </div>
      </div>

      {errorMsg ? (
        <div className="adm-error-banner" role="alert">
          <Warning size="1em" weight="bold" aria-hidden="true" /> {errorMsg}
        </div>
      ) : null}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Confirmed</th>
              <th scope="col">Created</th>
              <th scope="col">Updated</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="adm-table-empty">
                  No volunteers match the current filters.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id} aria-busy={busyId === r.id}>
                  <td>
                    {/* Name cell opens the drawer with full detail. */}
                    <button
                      type="button"
                      className="adm-row-trigger"
                      onClick={() => setDrawerId(r.id)}
                      aria-label={`Open details for ${r.name}`}
                    >
                      {r.name}
                      {r.adminNote ? (
                        <span className="adm-note-dot" aria-label="Has admin note" />
                      ) : null}
                      <ArrowRight size="0.85em" aria-hidden="true" />
                    </button>
                  </td>
                  <td>
                    <a href={`mailto:${r.email}`} className="adm-link">
                      {r.email}
                    </a>
                  </td>
                  <td>{r.role || '—'}</td>
                  <td>
                    <select
                      className="adm-status-select"
                      value={r.status}
                      onChange={(e) =>
                        updateStatus(r.id, e.target.value as VolunteerStatus)
                      }
                      disabled={busyId === r.id}
                      aria-label={`Status for ${r.name}`}
                    >
                      {VOLUNTEER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {r.confirmed ? (
                      <span className="adm-badge adm-badge-ok">
                        <SealCheck size="1em" weight="fill" aria-hidden="true" /> yes
                      </span>
                    ) : (
                      <span className="adm-badge adm-badge-muted">no</span>
                    )}
                  </td>
                  <td className="adm-cell-date">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="adm-cell-date">
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </td>
                  {/* CMS-4: inline two-step delete instead of window.confirm. */}
                  {pendingDeleteId === r.id ? (
                    <td className="adm-cell-confirm">
                      <span className="adm-confirm-label">
                        Delete {r.name}?
                      </span>
                      <button
                        type="button"
                        className="adm-btn-danger"
                        onClick={() => confirmDelete(r.id)}
                      >
                        Yes, delete
                      </button>
                      <button
                        type="button"
                        className="adm-btn-quiet"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </td>
                  ) : (
                    <td>
                      <button
                        type="button"
                        className="adm-btn-icon"
                        onClick={() => setPendingDeleteId(r.id)}
                        aria-label={`Delete ${r.name}`}
                        disabled={busyId === r.id}
                      >
                        <Trash size="1em" aria-hidden="true" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <VolunteerDrawer
        row={drawerRow}
        onClose={() => setDrawerId(null)}
        onPatch={applyPatch}
      />
    </>
  );
}
