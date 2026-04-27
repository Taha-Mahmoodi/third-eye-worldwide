'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CurrencyDollar,
  FileText,
  Funnel,
  MagnifyingGlass,
  Repeat,
  SealCheck,
  Trash,
  Warning,
} from '@/components/icons';
import {
  DONATION_STATUSES,
  type DonationStatus,
} from '@/lib/constants';
import DonationDrawer from './DonationDrawer';

/*
 * Donations admin table. Same shape as VolunteersClient — search,
 * status filter, optimistic PATCH, two-step delete (CMS-4),
 * Created/Updated columns (CMS-6).
 *
 * `amount` arrives as integer cents (DB-1). DonationRow comments call
 * this out, and every render path divides by 100 before formatting
 * (CMS-1).
 *
 * CMS_ROADMAP PR #4: row → drawer with full detail + admin notes,
 * Export CSV button hits /api/cms/submissions/export?type=donations,
 * page header shows aggregate stats from the server query.
 */

export interface DonationRow {
  id: number;
  name: string;
  email: string;
  /** Integer cents (DB-1). Divide by 100 for human-facing display. */
  amount: number;
  mode: string;
  currency: string;
  status: string;
  note: string | null;
  adminNote: string | null;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Aggregate stats panel — built server-side, dollars (not cents). */
export interface DonationAggregates {
  totalRaised: number;
  totalCount: number;
  monthlyCount: number;
  onceCount: number;
  avgGift: number;
  thisMonthRaised: number;
  thisMonthCount: number;
  last7dRaised: number;
  last7dCount: number;
}

interface DonationsClientProps {
  initialRows: DonationRow[];
  aggregates: DonationAggregates;
}

type StatusFilter = 'all' | DonationStatus;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatAmount(cents: number, currency: string): string {
  // CMS-1: cents → dollars at the display boundary.
  const dollars = cents / 100;
  if (currency === 'USD') return usd.format(dollars);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(dollars);
  } catch {
    return `${dollars.toFixed(2)} ${currency}`;
  }
}

export default function DonationsClient({ initialRows, aggregates }: DonationsClientProps) {
  const [rows, setRows] = useState<DonationRow[]>(initialRows);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<number | null>(null);

  function applyPatch(id: number, patch: Partial<DonationRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  const drawerRow = drawerId !== null ? rows.find((r) => r.id === drawerId) ?? null : null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.email} ${r.note ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, statusFilter]);

  // Running total over the visible (filtered) rows. CMS-1: divide cents.
  const visibleTotal = useMemo(
    () => visible.reduce((sum, r) => sum + r.amount / 100, 0),
    [visible],
  );

  async function updateStatus(id: number, next: DonationStatus) {
    setBusyId(id);
    setErrorMsg(null);
    const previous = rows;
    setRows((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, status: next, updatedAt: new Date().toISOString() } : r,
      ),
    );
    try {
      const res = await fetch(`/api/cms/submissions/donation/${id}`, {
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
      const res = await fetch(`/api/cms/submissions/donation/${id}`, {
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

  const visibleStatusCount = (s: DonationStatus) =>
    rows.filter((r) => r.status === s).length;

  return (
    <>
      <header className="adm-page-header adm-page-header-row">
        <div>
          <h1>Donations</h1>
          <p className="adm-page-sub">
            {rows.length.toLocaleString()} total · showing {visible.length.toLocaleString()}
            {' · '}
            <strong>{usd.format(visibleTotal)}</strong> in view
          </p>
        </div>
        <a
          className="adm-btn-quiet"
          href="/api/cms/submissions/export?type=donations"
          download
        >
          <FileText size="1em" aria-hidden="true" /> Export CSV
        </a>
      </header>

      <section className="adm-aggregate-row" aria-label="Donation summary">
        <div className="adm-aggregate-card">
          <div className="adm-aggregate-label">This month</div>
          <div className="adm-aggregate-value">{usd.format(aggregates.thisMonthRaised)}</div>
          <div className="adm-aggregate-sub">{aggregates.thisMonthCount} gifts</div>
        </div>
        <div className="adm-aggregate-card">
          <div className="adm-aggregate-label">Last 7 days</div>
          <div className="adm-aggregate-value">{usd.format(aggregates.last7dRaised)}</div>
          <div className="adm-aggregate-sub">{aggregates.last7dCount} gifts</div>
        </div>
        <div className="adm-aggregate-card">
          <div className="adm-aggregate-label">Average gift</div>
          <div className="adm-aggregate-value">{usd.format(aggregates.avgGift)}</div>
          <div className="adm-aggregate-sub">across {aggregates.totalCount} confirmed</div>
        </div>
        <div className="adm-aggregate-card">
          <div className="adm-aggregate-label">Recurring split</div>
          <div className="adm-aggregate-value">
            {aggregates.monthlyCount}<span className="adm-aggregate-divider">/</span>{aggregates.onceCount}
          </div>
          <div className="adm-aggregate-sub">monthly / one-time</div>
        </div>
      </section>

      <div className="adm-toolbar">
        <label className="adm-search">
          <MagnifyingGlass size="1em" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search name, email, note…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search donations"
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
          {DONATION_STATUSES.map((s) => (
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
              <th scope="col" className="adm-th-numeric">Amount</th>
              <th scope="col">Mode</th>
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
                <td colSpan={9} className="adm-table-empty">
                  No donations match the current filters.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id} aria-busy={busyId === r.id}>
                  <td>
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
                  <td className="adm-cell-amount">
                    {formatAmount(r.amount, r.currency)}
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-mode">
                      {r.mode === 'monthly' ? (
                        <Repeat size="1em" aria-hidden="true" />
                      ) : (
                        <CurrencyDollar size="1em" aria-hidden="true" />
                      )}{' '}
                      {r.mode}
                    </span>
                  </td>
                  <td>
                    <select
                      className="adm-status-select"
                      value={r.status}
                      onChange={(e) =>
                        updateStatus(r.id, e.target.value as DonationStatus)
                      }
                      disabled={busyId === r.id}
                      aria-label={`Status for ${r.name}`}
                    >
                      {DONATION_STATUSES.map((s) => (
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

      <DonationDrawer
        row={drawerRow}
        onClose={() => setDrawerId(null)}
        onPatch={applyPatch}
      />
    </>
  );
}
