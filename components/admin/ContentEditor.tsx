'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowClockwise, FileText, Warning } from '@/components/icons';

/*
 * Per-section JSON editor for the CMS document. Each top-level key in
 * the document is a "section" — site, home, about, projects, …. The
 * editor lets the user pick a section, edit its JSON in a textarea,
 * and publish via PUT /api/cms/data.
 *
 * Phase 0 fixes baked in here:
 *
 * CMS-5  beforeunload guard — if the textarea diverges from the last
 *        saved value, the browser warns before navigation discards the
 *        edits. savedValueRef tracks "what's actually in the DB"; we
 *        only ever update it after a successful publish or section
 *        switch, so any drift between editValue and the ref is a true
 *        unsaved change.
 *
 * CMS-10 empty-section warning — switching to a section the document
 *        doesn't yet contain shows a banner so the editor knows that
 *        publishing right now would write {} into the slot, silently
 *        clearing whatever the section keys to.
 */

type ContentDoc = Record<string, unknown>;

interface ContentEditorProps {
  initialContent: ContentDoc;
}

function stringify(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

export default function ContentEditor({ initialContent }: ContentEditorProps) {
  const [content, setContent] = useState<ContentDoc>(initialContent);
  const sections = useMemo(() => Object.keys(content).sort(), [content]);
  const [activeSection, setActiveSection] = useState<string>(sections[0] ?? 'site');
  const [editValue, setEditValue] = useState<string>(stringify(content[activeSection]));
  const [status, setStatus] = useState<{ text: string; error: boolean }>({
    text: '',
    error: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // CMS-5: tracks the last value that's actually in the DB for the
  // active section. Updated on section switch and after a successful
  // publish — never on every keystroke.
  const savedValueRef = useRef<string>(stringify(content[activeSection]));

  // When the user switches sections, reset the textarea + ref baseline.
  useEffect(() => {
    const next = stringify(content[activeSection]);
    setEditValue(next);
    savedValueRef.current = next;
    setStatus({ text: '', error: false });
    setParseError(null);
  }, [activeSection, content]);

  // CMS-5: guard browser navigation while the draft differs from the
  // last saved value. Browsers ignore a custom message in modern Chrome
  // / Firefox / Safari but still show their stock confirm dialog as
  // long as preventDefault() runs.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (editValue !== savedValueRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [editValue]);

  // CMS-10: show a warning when the active section isn't present in
  // the loaded document.
  const isSectionMissing = content[activeSection] === undefined;
  const hasUnsavedChanges = editValue !== savedValueRef.current;

  function handleReset() {
    const next = stringify(content[activeSection]);
    setEditValue(next);
    savedValueRef.current = next;
    setParseError(null);
    setStatus({ text: '', error: false });
  }

  async function handlePublish() {
    setParseError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(editValue);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e));
      return;
    }

    setSubmitting(true);
    setStatus({ text: 'Publishing…', error: false });

    const merged: ContentDoc = { ...content, [activeSection]: parsed };

    try {
      const res = await fetch('/api/cms/data', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(merged),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      // Update the canonical state, then bring the saved-value ref in
      // line so the beforeunload guard stops barking.
      setContent(merged);
      savedValueRef.current = editValue;
      setStatus({ text: 'Published ✓', error: false });
    } catch (e) {
      setStatus({
        text: `Publish failed: ${e instanceof Error ? e.message : String(e)}`,
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="adm-page-header">
        <h1>Content</h1>
        <p className="adm-page-sub">
          Edit the live content document. Each section is a top-level key in the JSON
          document stored in the database.
        </p>
      </header>

      <div className="adm-content-shell">
        <aside className="adm-section-list" aria-label="Content sections">
          {sections.length === 0 ? (
            <p className="adm-empty">No sections in the document yet.</p>
          ) : (
            <ul>
              {sections.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className={`adm-section-item${activeSection === s ? ' active' : ''}`}
                    onClick={() => setActiveSection(s)}
                  >
                    <FileText size="1em" aria-hidden="true" />
                    <code>{s}</code>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="adm-editor">
          <div className="adm-editor-bar">
            <div>
              Editing: <code className="adm-editor-section">{activeSection}</code>
              {hasUnsavedChanges ? (
                <span className="adm-pill-warn"> Unsaved changes</span>
              ) : null}
              {/* CMS-10: warn when section is absent from the document. */}
              {isSectionMissing ? (
                <span className="adm-pill-warn" role="status">
                  <Warning size="0.95em" weight="bold" aria-hidden="true" />{' '}
                  No saved data for this section — publishing writes an empty object.
                </span>
              ) : null}
            </div>
            <div className="adm-editor-actions">
              <button
                type="button"
                className="adm-btn-quiet"
                onClick={handleReset}
                disabled={submitting || !hasUnsavedChanges}
              >
                <ArrowClockwise size="1em" aria-hidden="true" /> Reset
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handlePublish}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? 'Publishing…' : 'Publish'}
              </button>
            </div>
          </div>

          <textarea
            className="adm-editor-textarea"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            spellCheck={false}
            aria-label={`JSON for ${activeSection}`}
          />

          {parseError ? (
            <p className="adm-status adm-status-error" role="alert">
              <Warning size="1em" weight="bold" aria-hidden="true" /> JSON parse error: {parseError}
            </p>
          ) : null}
          {status.text ? (
            <p
              className={`adm-status${status.error ? ' adm-status-error' : ' adm-status-ok'}`}
              role="status"
            >
              {status.text}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
