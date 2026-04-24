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

export default function ClientBootstrap() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    const themes = ['light', 'dark', 'high-contrast'];
    const themeIcons = { light: 'ph-sun', dark: 'ph-moon', 'high-contrast': 'ph-circle-half' };

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
      if (!themes.includes(t)) t = 'light';
      root.setAttribute('data-theme', t);
      const btn = document.getElementById('theme-btn');
      if (btn) btn.innerHTML = `<i class="ph ${themeIcons[t]}"></i>`;
      applyLogoColors();
      try { localStorage.setItem('teww-theme', t); } catch {}
    };

    window.cycleTheme = function () {
      const cur = root.getAttribute('data-theme') || 'light';
      const idx = themes.indexOf(cur);
      const next = themes[(idx + 1) % themes.length];
      window.setTheme(next);
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

    window.activateSub = function (page, sub) {
      const pg = document.querySelector('.page.active') || document.getElementById('page-' + page);
      if (!pg) return;
      pg.querySelectorAll('.subnav button').forEach((b) => {
        b.classList.toggle('active', b.dataset.sub === sub);
      });
      pg.querySelectorAll('.subpage').forEach((p) => {
        p.classList.toggle('active', p.dataset.sub === sub);
      });
      try { localStorage.setItem('teww-sub-' + page, sub); } catch {}
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

    window.setDonateMode = function (mode) {
      document.querySelectorAll('.donate-toggle button').forEach((b) => {
        b.classList.toggle('active', b.dataset.mode === mode);
      });
      document.querySelectorAll('[data-donate-mode]').forEach((el) => {
        el.style.display = el.dataset.donateMode === mode ? '' : 'none';
      });
      try { localStorage.setItem('teww-donate-mode', mode); } catch {}
    };

    window.pickAmount = function (btn) {
      btn.parentElement.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      const inp = document.getElementById('custom-amount-input');
      if (inp) inp.value = '';
    };

    window.filterPills = function (container, val) {
      const pills = container.querySelectorAll('.filter-pill');
      pills.forEach((p) => p.classList.toggle('active', p.dataset.filter === val));
      const targets = document.querySelectorAll('[data-filter-target="' + container.dataset.filterGroup + '"]');
      targets.forEach((t) => {
        const cat = t.dataset.cat || '';
        t.style.display = val === 'all' || cat.split(' ').includes(val) ? '' : 'none';
      });
    };

    // Restore persisted state
    try {
      const savedTheme = localStorage.getItem('teww-theme') || 'light';
      window.setTheme(savedTheme);
      const savedSize = localStorage.getItem('teww-size') || 'a';
      window.setSize(savedSize);
    } catch {
      window.setTheme('light');
      window.setSize('a');
    }

    // One-time client setup (lightbox, scrollspy, reader progress)
    import('@/lib/client-init').catch(() => {});
  }, [router]);

  // On route change, close mobile nav and handle hash-based subpage activation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.closeNav && window.closeNav();

    // Determine page from pathname and apply saved or hash subpage
    const pageFromPath =
      Object.entries(PAGE_TO_PATH).find(([, p]) => p === pathname)?.[0] || 'home';
    const hash = (typeof window !== 'undefined' && window.location.hash.slice(1)) || '';
    const sub = hash || (() => {
      try { return localStorage.getItem('teww-sub-' + pageFromPath) || ''; } catch { return ''; }
    })();

    // Wait a tick for the page HTML to render (HtmlContent runs effect after mount)
    const t = setTimeout(() => {
      if (sub && window.activateSub) window.activateSub(pageFromPath, sub);
      else {
        // activate default first sub if the page has a subnav
        const pg = document.querySelector('.page.active');
        const first = pg?.querySelector('.subnav button');
        if (first && first.dataset.sub && window.activateSub) {
          window.activateSub(pageFromPath, first.dataset.sub);
        }
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
