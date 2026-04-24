'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PAGE_TO_PATH = {
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

const THEMES = ['light', 'dark', 'high-contrast'];
const THEME_ICONS = { light: 'ph-sun', dark: 'ph-moon', 'high-contrast': 'ph-circle-half' };

/*
 * Tiny global controller: binds a handful of `window.*` helpers that the
 * legacy HTML-string routes (blog-detail, story-detail, custom pages) still
 * call via inline `onclick`. Also restores saved theme/text-size on load.
 *
 * Retired helpers (removed post Option B refactor):
 *   - setDonateMode / pickAmount   → DonateWidget (useState)
 *   - filterPills                  → FilterableBlogGrid / PhotoGrid / VideoGrid
 *   - activateSub                  → Subnav (useState + URL hash)
 *
 * When blog-detail / story-detail / custom migrate to JSX, this file can
 * be shrunk further — ultimately to just theme + text-size handling.
 */
export default function ClientBootstrap() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    function applyLogoColors() {
      const theme = root.getAttribute('data-theme') || 'light';
      const brandLogo = document.getElementById('brand-logo');
      const footerLogo = document.getElementById('footer-logo');
      if (brandLogo) {
        brandLogo.src = (theme === 'dark' || theme === 'high-contrast')
          ? '/assets/logo-light.svg'
          : '/assets/logo.svg';
      }
      if (footerLogo) {
        footerLogo.src = '/assets/logo-light.svg';
      }
    }

    window.setTheme = function (t) {
      if (!THEMES.includes(t)) t = 'light';
      root.setAttribute('data-theme', t);
      const btn = document.getElementById('theme-btn');
      if (btn) btn.innerHTML = `<i class="ph ${THEME_ICONS[t]}"></i>`;
      applyLogoColors();
      try { localStorage.setItem('teww-theme', t); } catch {}
    };

    window.cycleTheme = function () {
      const cur = root.getAttribute('data-theme') || 'light';
      const idx = THEMES.indexOf(cur);
      window.setTheme(THEMES[(idx + 1) % THEMES.length]);
    };

    window.setSize = function (s) {
      root.setAttribute('data-text-size', s);
      document.querySelectorAll('.ts-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.size === s);
      });
      try { localStorage.setItem('teww-size', s); } catch {}
    };

    window.goto = function (page, sub) {
      const path = PAGE_TO_PATH[page] || `/${page}`;
      const href = sub ? `${path}#${sub}` : path;
      try { localStorage.setItem('teww-page', page); } catch {}
      if (sub) try { localStorage.setItem('teww-sub-' + page, sub); } catch {}
      router.push(href);
      window.closeNav && window.closeNav();
    };

    window.toggleNav = function () {
      const links = document.getElementById('primary-nav');
      const burger = document.getElementById('nav-burger');
      if (!links || !burger) return;
      const open = !links.classList.contains('open');
      links.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.innerHTML = open ? '<i class="ph ph-x"></i>' : '<i class="ph ph-list"></i>';
      burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      document.body.classList.toggle('nav-open', open);
    };

    window.closeNav = function () {
      const links = document.getElementById('primary-nav');
      const burger = document.getElementById('nav-burger');
      if (!links || !links.classList.contains('open')) return;
      links.classList.remove('open');
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.innerHTML = '<i class="ph ph-list"></i>';
        burger.setAttribute('aria-label', 'Open navigation menu');
      }
      document.body.classList.remove('nav-open');
    };

    // Restore persisted state
    try {
      window.setTheme(localStorage.getItem('teww-theme') || 'light');
      window.setSize(localStorage.getItem('teww-size') || 'a');
    } catch {
      window.setTheme('light');
      window.setSize('a');
    }

    // One-time client setup (photo lightbox, scrollspy, reader progress)
    import('@/lib/client-init').catch(() => {});
  }, [router]);

  // On route change, close the mobile nav and scroll to top.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.closeNav && window.closeNav();
    const t = setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
