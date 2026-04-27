'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoAnimated from '@/components/LogoAnimated';
import NavTabIcon, { type NavTabIconName } from '@/components/animate-ui/icons/nav-tab-icon';
import { useTheme } from '@/lib/context/theme-context';
import { useNav } from '@/lib/context/nav-context';
import { CaretDown, CircleHalf, Heart, List, Moon, Sun, X } from '@phosphor-icons/react';

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
  const { theme, textSize, setTextSize, cycleTheme } = useTheme();
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'high-contrast' ? CircleHalf : Sun;
  const { toggle: toggleMobileNav, open: navOpen } = useNav();
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

  // Keyboard-driven dropdown state. The parent <Link> still navigates
  // (Enter on the trigger goes to /about, /media, /documents) but
  // ArrowDown opens the dropdown without leaving the page, and the
  // arrow / Escape keys move focus through dropdown items the way a
  // proper menu should.
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  function handleTriggerKey(key: string, e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpenDropdown(key);
      // Wait one tick so React has flipped the dropdown to .open,
      // then move focus to the first menu item.
      setTimeout(() => {
        const firstItem = document.querySelector<HTMLElement>(
          `.nav-dropdown[data-key="${key}"] a`,
        );
        firstItem?.focus();
      }, 0);
    } else if (e.key === 'Escape') {
      setOpenDropdown(null);
    }
  }

  function handleItemKey(key: string, e: React.KeyboardEvent<HTMLAnchorElement>) {
    const item = e.currentTarget;
    const list = Array.from(
      item.closest('.nav-dropdown')?.querySelectorAll('a') ?? [],
    ) as HTMLElement[];
    const idx = list.indexOf(item);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      list[idx + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = list[idx - 1];
      if (prev) prev.focus();
      else {
        // Up from the first item → close + return focus to the trigger
        setOpenDropdown(null);
        const trigger = document.querySelector<HTMLElement>(
          `[data-nav="${key}"]`,
        );
        trigger?.focus();
      }
    } else if (e.key === 'Escape') {
      setOpenDropdown(null);
      const trigger = document.querySelector<HTMLElement>(
        `[data-nav="${key}"]`,
      );
      trigger?.focus();
    }
  }

  function handleNavBlur(e: React.FocusEvent<HTMLElement>) {
    // If focus is moving outside the whole nav, close any open dropdown.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setOpenDropdown(null);
    }
  }

  return (
    <nav className="topnav" aria-label="Main navigation" onBlur={handleNavBlur}>
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
              aria-haspopup="true"
              aria-expanded={openDropdown === 'about'}
              onKeyDown={(e) => handleTriggerKey('about', e)}
            >
              <NavTabIcon name={NAV_ICON.about} visible={showIcon('about')} />
              About <CaretDown size="0.65em" aria-hidden="true" />
            </Link>
            <div className={`nav-dropdown${openDropdown === 'about' ? ' open' : ''}`} data-key="about">
              <Link href="/about#mission" onKeyDown={(e) => handleItemKey('about', e)}>Mission</Link>
              <Link href="/about#team" onKeyDown={(e) => handleItemKey('about', e)}>Team</Link>
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
              aria-haspopup="true"
              aria-expanded={openDropdown === 'media'}
              onKeyDown={(e) => handleTriggerKey('media', e)}
            >
              <NavTabIcon name={NAV_ICON.media} visible={showIcon('media')} />
              Media <CaretDown size="0.65em" aria-hidden="true" />
            </Link>
            <div className={`nav-dropdown${openDropdown === 'media' ? ' open' : ''}`} data-key="media">
              <Link href="/media#photos" onKeyDown={(e) => handleItemKey('media', e)}>Photos</Link>
              <Link href="/media#podcasts" onKeyDown={(e) => handleItemKey('media', e)}>Podcasts</Link>
              <Link href="/media#videos" onKeyDown={(e) => handleItemKey('media', e)}>Videos</Link>
            </div>
          </li>
          <li {...tabHandlers('documents')}>
            <Link
              href="/documents"
              data-nav="documents"
              className={`nav-link-btn ${isActive('documents', pathname) ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={openDropdown === 'documents'}
              onKeyDown={(e) => handleTriggerKey('documents', e)}
            >
              <NavTabIcon name={NAV_ICON.documents} visible={showIcon('documents')} />
              Documents <CaretDown size="0.65em" aria-hidden="true" />
            </Link>
            <div className={`nav-dropdown${openDropdown === 'documents' ? ' open' : ''}`} data-key="documents">
              <Link href="/documents#blogs" onKeyDown={(e) => handleItemKey('documents', e)}>Blogs</Link>
              <Link href="/documents#stories" onKeyDown={(e) => handleItemKey('documents', e)}>Stories</Link>
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
              className={`ts-btn ${textSize === 'a' ? 'active' : ''}`}
              data-size="a"
              aria-label="Default text size"
              aria-pressed={textSize === 'a'}
              onClick={() => setTextSize('a')}
            >A</button>
            <button
              type="button"
              className={`ts-btn ${textSize === 'a-plus' ? 'active' : ''}`}
              data-size="a-plus"
              aria-label="Larger text size"
              aria-pressed={textSize === 'a-plus'}
              onClick={() => setTextSize('a-plus')}
            >A+</button>
            <button
              type="button"
              className={`ts-btn ${textSize === 'a-plus-plus' ? 'active' : ''}`}
              data-size="a-plus-plus"
              aria-label="Largest text size"
              aria-pressed={textSize === 'a-plus-plus'}
              onClick={() => setTextSize('a-plus-plus')}
            >A++</button>
          </div>
          <button
            type="button"
            className="icon-btn"
            id="theme-btn"
            title="Toggle theme"
            aria-label="Toggle theme"
            onClick={cycleTheme}
          >
            <ThemeIcon size="1em" aria-hidden="true" />
          </button>
          <Link href="/donate" className="nav-cta">
            <Heart weight="fill" size="1em" aria-hidden="true" />
            <span className="nav-cta-label">Donate</span>
          </Link>
          <button
            type="button"
            className="nav-burger"
            id="nav-burger"
            aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={navOpen}
            aria-controls="primary-nav"
            onClick={toggleMobileNav}
          >
            {navOpen
              ? <X size="1em" aria-hidden="true" />
              : <List size="1em" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
