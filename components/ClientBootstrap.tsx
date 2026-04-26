'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  applyTheme,
  applyTextSize,
  nextTheme,
  readPersistedTheme,
  readPersistedTextSize,
  isTheme,
  isTextSize,
  type Theme,
  type TextSize,
} from '@/lib/client/theme';
import { closeNav as closeNavDom, toggleNav as toggleNavDom } from '@/lib/client/nav';

declare global {
  interface Window {
    setTheme: (t: string) => void;
    cycleTheme: () => void;
    setSize: (s: string) => void;
    goto: (page: string, sub?: string) => void;
    toggleNav: () => void;
    closeNav: () => void;
  }
}

const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  about: '/about',
  projects: '/projects',
  donate: '/donate',
  media: '/media',
  documents: '/documents',
  volunteers: '/volunteers',
  'blog-detail': '/blog-detail',
  'story-detail': '/story-detail',
};

/*
 * Legacy `window.*` controllers used by inline `onclick` handlers on
 * the HTML-string routes (blog-detail, story-detail, custom pages).
 * The React side of the app uses ThemeProvider + NavProvider — see
 * lib/context/. Both paths route through the same underlying helpers
 * in lib/client/, so React state and DOM state can't drift.
 *
 * Once the legacy HTML routes migrate to JSX, this file can shrink to
 * just the client-init dynamic import (or be retired entirely).
 */
export default function ClientBootstrap() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    window.setTheme = (t: string) => {
      applyTheme(isTheme(t) ? t : 'light');
    };

    window.cycleTheme = () => {
      const root = document.documentElement;
      const cur = (root.getAttribute('data-theme') || 'light') as Theme;
      applyTheme(nextTheme(isTheme(cur) ? cur : 'light'));
    };

    window.setSize = (s: string) => {
      applyTextSize(isTextSize(s) ? s : 'a');
    };

    window.goto = (page: string, sub?: string) => {
      const path = PAGE_TO_PATH[page] || `/${page}`;
      const href = sub ? `${path}#${sub}` : path;
      try { localStorage.setItem('teww-page', page); } catch {}
      if (sub) try { localStorage.setItem('teww-sub-' + page, sub); } catch {}
      router.push(href);
      closeNavDom();
    };

    window.toggleNav = toggleNavDom;
    window.closeNav = closeNavDom;

    // Restore persisted state once on first mount. ThemeProvider also
    // does this for the React tree; we run the same apply here so the
    // legacy HTML routes (which don't see the Provider) get the user's
    // saved theme/size on hard navigations.
    const persistedTheme: Theme = readPersistedTheme();
    const persistedSize: TextSize = readPersistedTextSize();
    applyTheme(persistedTheme);
    applyTextSize(persistedSize);

    // One-time client setup (photo lightbox, scrollspy, reader progress)
    import('@/lib/client-init').catch(() => {});
  }, [router]);

  // On route change, scroll to top and close mobile nav. NavProvider
  // already closes the React-rendered burger; this also handles legacy
  // HTML routes where Provider state never mounts.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    closeNavDom();
    const t = setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
