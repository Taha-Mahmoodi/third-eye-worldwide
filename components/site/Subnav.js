'use client';

import { useEffect, useState } from 'react';

/*
 * Generic tab controller used by routes with a subnav (About, Media,
 * Documents, etc). Pass the page key + an array of
 * `{ id, label, content }` tabs. Content can be any React node
 * including server components.
 *
 * Active state initializes from the URL hash (e.g. /about#team) or
 * from localStorage['teww-sub-<page>'] to match the legacy behavior
 * wired up by ClientBootstrap. Clicking a tab updates both.
 */
export default function Subnav({ page, tabs, defaultTab, ariaLabel }) {
  const fallbackTab = defaultTab || tabs?.[0]?.id || '';
  const [active, setActive] = useState(fallbackTab);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1);
    if (hash && tabs.some((t) => t.id === hash)) {
      setActive(hash);
      return;
    }
    try {
      const saved = localStorage.getItem('teww-sub-' + page);
      if (saved && tabs.some((t) => t.id === saved)) setActive(saved);
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function activate(id) {
    setActive(id);
    try { localStorage.setItem('teww-sub-' + page, id); } catch {}
    try {
      const url = new URL(window.location.href);
      url.hash = id;
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }

  return (
    <>
      <nav className="subnav" aria-label={ariaLabel || `${page} sections`}>
        <div className="subnav-inner">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              data-sub={t.id}
              className={active === t.id ? 'active' : ''}
              onClick={() => activate(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {tabs.map((t) => (
        <div
          key={t.id}
          data-sub={t.id}
          className={`subpage${active === t.id ? ' active' : ''}`}
        >
          {t.content}
        </div>
      ))}
    </>
  );
}
