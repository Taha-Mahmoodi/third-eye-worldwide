'use client';

import { useCallback, useState } from 'react';
import { CaretRight, MagnifyingGlass } from '@/components/icons';

/*
 * Reverse-chronological audit log (CMS_ROADMAP PR #7). Each row is
 * collapsible — clicking the row expands a code block with the JSON
 * diff. Filters by actor + action; date filters omitted from the v0
 * since the doc says "later" and the cursor pagination already
 * naturally pages older entries.
 *
 * The list pages 50 at a time. Hitting "Load more" appends; switching
 * a filter resets the list and re-fetches from the top.
 */

export interface AuditLogRow {
  id: string;
  actor: string;
  action: string;
  target: string | null;
  diff: string | null;
  createdAt: string;
}

interface AuditLogClientProps {
  initialRows: AuditLogRow[];
  initialNextCursor: string | null;
  actors: string[];
  actions: string[];
}

function formatDiffForDisplay(raw: string | null): string {
  if (!raw) return '';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export default function AuditLogClient({
  initialRows,
  initialNextCursor,
  actors,
  actions,
}: AuditLogClientProps) {
  const [rows, setRows] = useState<AuditLogRow[]>(initialRows);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [actorFilter, setActorFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const buildUrl = useCallback(
    (next?: string | null) => {
      const params = new URLSearchParams();
      if (actorFilter) params.set('actor', actorFilter);
      if (actionFilter) params.set('action', actionFilter);
      if (next) params.set('cursor', next);
      const qs = params.toString();
      return qs ? `/api/cms/audit-log?${qs}` : '/api/cms/audit-log';
    },
    [actorFilter, actionFilter],
  );

  async function applyFilters() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(buildUrl());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { rows: AuditLogRow[]; nextCursor: string | null };
      setRows(body.rows);
      setCursor(body.nextCursor);
      setExpanded(new Set());
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(buildUrl(cursor));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { rows: AuditLogRow[]; nextCursor: string | null };
      setRows((rs) => [...rs, ...body.rows]);
      setCursor(body.nextCursor);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <header className="adm-page-header">
        <h1>Audit log</h1>
        <p className="adm-page-sub">
          Append-only record of CMS writes. Click a row to inspect its diff.
        </p>
      </header>

      <div className="adm-toolbar">
        <label className="adm-search">
          <MagnifyingGlass size="1em" aria-hidden="true" />
          Actor
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            aria-label="Filter by actor"
          >
            <option value="">All actors</option>
            {actors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="adm-search">
          <MagnifyingGlass size="1em" aria-hidden="true" />
          Action
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filter by action"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="adm-btn-quiet"
          onClick={applyFilters}
          disabled={loading}
        >
          Apply
        </button>
      </div>

      {errorMsg ? (
        <div className="adm-error-banner" role="alert">{errorMsg}</div>
      ) : null}

      <div className="adm-audit-list">
        {rows.length === 0 ? (
          <p className="adm-empty">No audit entries match the current filters.</p>
        ) : (
          rows.map((r) => {
            const open = expanded.has(r.id);
            return (
              <article key={r.id} className={`adm-audit-row${open ? ' open' : ''}`}>
                <button
                  type="button"
                  className="adm-audit-summary"
                  onClick={() => toggleExpand(r.id)}
                  aria-expanded={open}
                  aria-controls={`audit-diff-${r.id}`}
                >
                  <CaretRight
                    size="0.9em"
                    aria-hidden="true"
                    weight="bold"
                  />
                  <code className="adm-audit-action">{r.action}</code>
                  <span className="adm-audit-actor">{r.actor}</span>
                  {r.target ? <span className="adm-audit-target">→ {r.target}</span> : null}
                  <time className="adm-audit-time">
                    {new Date(r.createdAt).toLocaleString()}
                  </time>
                </button>
                {open ? (
                  <pre id={`audit-diff-${r.id}`} className="adm-audit-diff">
                    {r.diff ? formatDiffForDisplay(r.diff) : '(no diff payload)'}
                  </pre>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      {cursor ? (
        <div className="adm-audit-load-more">
          <button
            type="button"
            className="adm-btn-quiet"
            onClick={loadMore}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </>
  );
}
