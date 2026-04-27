'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Funnel,
  ImageSquare,
  MagnifyingGlass,
  Microphone,
  Play,
  Plus,
  Trash,
  Warning,
} from '@/components/icons';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

/*
 * Media library browser (CMS_ROADMAP PR #1). Drag-and-drop dropzone
 * across the whole grid, filter chips per kind, free-text search by
 * filename, and inline two-step delete on each asset card.
 *
 * The MediaPicker modal that PR #2 (TipTap) wires into the rich-text
 * editor is intentionally not built here — this is the first half of
 * the doc's "uploads" milestone. The browser itself is enough for
 * editors to manage assets in advance of a future PR adding the
 * picker.
 */

export interface MediaRow {
  id: string;
  kind: string;
  filename: string;
  mime: string;
  bytes: number;
  alt: string | null;
  caption: string | null;
  url: string;
  urlThumb: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

interface MediaBrowserProps {
  initialRows: MediaRow[];
  initialNextCursor: string | null;
}

type KindFilter = 'all' | 'image' | 'video' | 'audio' | 'document';

const KIND_LABEL: Record<KindFilter, string> = {
  all: 'All',
  image: 'Images',
  video: 'Videos',
  audio: 'Audio',
  document: 'Documents',
};

const KIND_ICONS: Record<string, PhosphorIcon> = {
  image: ImageSquare,
  video: Play,
  audio: Microphone,
  document: FileText,
};

function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function MediaBrowser({ initialRows, initialNextCursor }: MediaBrowserProps) {
  const [rows, setRows] = useState<MediaRow[]>(initialRows);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [query, setQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; pct: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (kindFilter !== 'all' && r.kind !== kindFilter) return false;
      if (!q) return true;
      const hay = `${r.filename} ${r.alt ?? ''} ${r.caption ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, kindFilter]);

  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = { image: 0, video: 0, audio: 0, document: 0 };
    for (const r of rows) counts[r.kind] = (counts[r.kind] ?? 0) + 1;
    return counts;
  }, [rows]);

  /** XHR upload so we get progress events; fetch() doesn't expose them. */
  const upload = useCallback(async (file: File) => {
    setErrorMsg(null);
    setUploadProgress({ name: file.name, pct: 0 });
    const form = new FormData();
    form.append('file', file);

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/cms/media');
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress({ name: file.name, pct: Math.round((e.loaded / e.total) * 100) });
        }
      });
      xhr.addEventListener('load', () => {
        setUploadProgress(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const created = JSON.parse(xhr.responseText) as MediaRow;
            setRows((rs) => [
              {
                ...created,
                createdAt: created.createdAt || new Date().toISOString(),
              },
              ...rs,
            ]);
            resolve();
          } catch (err) {
            reject(err);
          }
        } else {
          let msg = `Upload failed (HTTP ${xhr.status})`;
          try {
            const body = JSON.parse(xhr.responseText) as { error?: string };
            if (body.error) msg = body.error;
          } catch {/* swallow */}
          setErrorMsg(msg);
          reject(new Error(msg));
        }
      });
      xhr.addEventListener('error', () => {
        setUploadProgress(null);
        setErrorMsg('Network error during upload.');
        reject(new Error('network'));
      });
      xhr.send(form);
    });
  }, []);

  async function uploadAll(files: FileList | File[]) {
    const list = Array.from(files);
    for (const f of list) {
      try {
        await upload(f);
      } catch {
        // surfaced via setErrorMsg inside upload(); keep going.
      }
    }
  }

  function onPickClick() {
    fileInputRef.current?.click();
  }

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    void uploadAll(files);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void uploadAll(e.dataTransfer.files);
    }
  }

  async function confirmDelete(id: string) {
    setPendingDeleteId(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/cms/media/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setRows((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      setErrorMsg(`Delete failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function loadMore() {
    if (!nextCursor) return;
    try {
      const res = await fetch(`/api/cms/media?cursor=${encodeURIComponent(nextCursor)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { rows: MediaRow[]; nextCursor: string | null };
      setRows((rs) => [...rs, ...body.rows]);
      setNextCursor(body.nextCursor);
    } catch (e) {
      setErrorMsg(`Load failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <>
      <header className="adm-page-header adm-page-header-row">
        <div>
          <h1>Media</h1>
          <p className="adm-page-sub">
            {rows.length.toLocaleString()} loaded · drag and drop to upload, or use the button.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={onPickClick}>
          <Plus size="1em" aria-hidden="true" /> Upload file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={onFilesSelected}
        />
      </header>

      <div className="adm-toolbar">
        <label className="adm-search">
          <MagnifyingGlass size="1em" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search filename, alt, caption…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search media"
          />
        </label>
        <div className="adm-filter-group" role="group" aria-label="Kind filter">
          <Funnel size="1em" aria-hidden="true" />
          {(['all', 'image', 'video', 'audio', 'document'] as KindFilter[]).map((k) => (
            <button
              key={k}
              type="button"
              className={`adm-filter-pill${kindFilter === k ? ' active' : ''}`}
              aria-pressed={kindFilter === k}
              onClick={() => setKindFilter(k)}
            >
              {KIND_LABEL[k]}{' '}
              <span className="adm-filter-count">
                ({k === 'all' ? rows.length : kindCounts[k] ?? 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {errorMsg ? (
        <div className="adm-error-banner" role="alert">
          <Warning size="1em" weight="bold" aria-hidden="true" /> {errorMsg}
        </div>
      ) : null}

      {uploadProgress ? (
        <div className="adm-upload-progress" role="status">
          Uploading <strong>{uploadProgress.name}</strong> — {uploadProgress.pct}%
          <div
            className="adm-upload-bar"
            style={{ width: `${uploadProgress.pct}%` }}
            aria-hidden="true"
          />
        </div>
      ) : null}

      <section
        className={`adm-media-grid${dragOver ? ' drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        aria-label="Media assets"
      >
        {visible.length === 0 ? (
          <p className="adm-empty">
            {rows.length === 0
              ? 'No media yet. Drop a file anywhere on this page to upload.'
              : 'No assets match the current filters.'}
          </p>
        ) : (
          visible.map((r) => {
            const Icon = KIND_ICONS[r.kind] ?? FileText;
            return (
              <article key={r.id} className="adm-media-card">
                <a className="adm-media-thumb" href={r.url} target="_blank" rel="noreferrer">
                  {r.kind === 'image' ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={r.urlThumb || r.url}
                      alt={r.alt || r.filename}
                      loading="lazy"
                    />
                  ) : (
                    <div className="adm-media-icon" aria-hidden="true">
                      <Icon size={32} />
                    </div>
                  )}
                </a>
                <div className="adm-media-meta">
                  <div className="adm-media-name" title={r.filename}>{r.filename}</div>
                  <div className="adm-media-sub">
                    {r.kind} · {humanBytes(r.bytes)}
                  </div>
                </div>
                {pendingDeleteId === r.id ? (
                  <div className="adm-media-confirm">
                    <span className="adm-confirm-label">Delete?</span>
                    <button
                      type="button"
                      className="adm-btn-danger"
                      onClick={() => confirmDelete(r.id)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="adm-btn-quiet"
                      onClick={() => setPendingDeleteId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="adm-btn-icon adm-media-delete"
                    onClick={() => setPendingDeleteId(r.id)}
                    aria-label={`Delete ${r.filename}`}
                  >
                    <Trash size="1em" aria-hidden="true" />
                  </button>
                )}
              </article>
            );
          })
        )}
      </section>

      {nextCursor ? (
        <div className="adm-audit-load-more">
          <button type="button" className="adm-btn-quiet" onClick={loadMore}>
            Load more
          </button>
        </div>
      ) : null}
    </>
  );
}
