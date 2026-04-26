'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoAnimated from '@/components/LogoAnimated';
import NavTabIcon, { type NavTabIconName } from '@/components/animate-ui/icons/nav-tab-icon';

const NAV_MATCH: Record<string, (p: string) => boolean> = {
  home: (p) => p === '/',
  about: (p) => p.startsWith('/about'),
  projects: (p) => p.startsWith('/projects'),
  media: (p) => p.startsWith('/media'),
  documents: (p) => p.startsWith('/documents') || p.startsWith('/blog-detail') || p.startsWith('/story-detail'),
  volunteers: (p) => p.startsWith('/volunteers'),
};

// Nav tab key → which Phosphor-shaped icon we reveal on hover/focus.
const NAV_ICON: Record<string, NavTabIconName> = {
  home: 'home',
  about: 'about',
  projects: 'projects',
  media: 'media',
  documents: 'documents',
  volunteers: 'volunteer',
};

function isActive(key: string, pathname: string | null): boolean {
  const fn = NAV_MATCH[key];
  if (!fn || !pathname) return false;
  return fn(pathname);
}

export default function Nav() {
  const pathname = usePathname();
  // Which top-level tab is currently being hovered or keyboard-focused.
  // Drives the per-tab icon animation in NavTabIcon. We keep the active
  // tab's icon visible too so the user can still see the icon for the
  // page they're on after the cursor leaves.
  const [hoverTab, setHoverTab] = React.useState<string | null>(null);
  const tabHandlers = (key: string) => ({
    onPointerEnter: () => setHoverTab(key),
    onPointerLeave: () =>
      setHoverTab((prev) => (prev === key ? null : prev)),
    onFocus: () => setHoverTab(key),
    onBlur: () => setHoverTab((prev) => (prev === key ? null : prev)),
  });
  const showIcon = (key: string) =>
    hoverTab === key || isActive(key, pathname);

  return (
    <nav className="topnav" aria-label="Main navigation">
      <div className="nav-inner">
        <Link href="/" className="nav-logo" aria-label="Third Eye Worldwide — home">
          <LogoAnimated className="brand-logo-svg" ariaLabel="Third Eye Worldwide" />
        </Link>

        <ul className="nav-links" id="primary-nav" role="menubar">
          <li {...tabHandlers('home')}>
            <Link href="/" data-nav="home" className={isActive('home', pathname) ? 'active' : ''}>
              <NavTabIcon name={NAV_ICON.home} visible={showIcon('home')} />
              Home
            </Link>
          </li>
          <li {...tabHandlers('about')}>
            <Link
              href="/about"
              data-nav="about"
              className={`nav-link-btn ${isActive('about', pathname) ? 'active' : ''}`}
            >
              <NavTabIcon name={NAV_ICON.about} visible={showIcon('about')} />
              About <i className="ph ph-caret-down" style={{ fontSize: '10px' }}></i>
            </Link>
            <div className="nav-dropdown">
              <Link href="/about#mission">Mission</Link>
              <Link href="/about#team">Team</Link>
            </div>
          </li>
          <li {...tabHandlers('projects')}>
            <Link href="/projects" data-nav="projects" className={isActive('projects', pathname) ? 'active' : ''}>
              <NavTabIcon name={NAV_ICON.projects} visible={showIcon('projects')} />
              Projects
            </Link>
          </li>
          <li {...tabHandlers('media')}>
            <Link
              href="/media"
              data-nav="media"
              className={`nav-link-btn ${isActive('media', pathname) ? 'active' : ''}`}
            >
              <NavTabIcon name={NAV_ICON.media} visible={showIcon('media')} />
              Media <i className="ph ph-caret-down" style={{ fontSize: '10px' }}></i>
            </Link>
            <div className="nav-dropdown">
              <Link href="/media#photos">Photos</Link>
              <Link href="/media#podcasts">Podcasts</Link>
              <Link href="/media#videos">Videos</Link>
            </div>
          </li>
          <li {...tabHandlers('documents')}>
            <Link
              href="/documents"
              data-nav="documents"
              className={`nav-link-btn ${isActive('documents', pathname) ? 'active' : ''}`}
            >
              <NavTabIcon name={NAV_ICON.documents} visible={showIcon('documents')} />
              Documents <i className="ph ph-caret-down" style={{ fontSize: '10px' }}></i>
            </Link>
            <div className="nav-dropdown">
              <Link href="/documents#blogs">Blogs</Link>
              <Link href="/documents#stories">Stories</Link>
            </div>
          </li>
          <li {...tabHandlers('volunteers')}>
            <Link href="/volunteers" data-nav="volunteers" className={isActive('volunteers', pathname) ? 'active' : ''}>
              <NavTabIcon name={NAV_ICON.volunteers} visible={showIcon('volunteers')} />
              Volunteer
            </Link>
          </li>
        </ul>

        <div className="nav-controls">
          <div className="text-size-btns" title="Text size" role="group" aria-label="Text size">
            <button
              type="button"
              className="ts-btn active"
              data-size="a"
              aria-label="Default text size"
              onClick={() => window.setSize && window.setSize('a')}
            >A</button>
            <button
              type="button"
              className="ts-btn"
              data-size="a-plus"
              aria-label="Larger text size"
              onClick={() => window.setSize && window.setSize('a-plus')}
            >A+</button>
            <button
              type="button"
              className="ts-btn"
              data-size="a-plus-plus"
              aria-label="Largest text size"
              onClick={() => window.setSize && window.setSize('a-plus-plus')}
            >A++</button>
          </div>
          <button
            type="button"
            className="icon-btn"
            id="theme-btn"
            title="Toggle theme"
            aria-label="Toggle theme"
            onClick={() => window.cycleTheme && window.cycleTheme()}
          >
            <i className="ph ph-sun"></i>
          </button>
          <Link href="/donate" className="nav-cta">
            <i className="ph-fill ph-heart"></i>
            <span className="nav-cta-label">Donate</span>
          </Link>
          <button
            type="button"
            className="nav-burger"
            id="nav-burger"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="primary-nav"
            onClick={() => window.toggleNav && window.toggleNav()}
          >
            <i className="ph ph-list"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
