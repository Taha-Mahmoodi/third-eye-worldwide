'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoAnimated from '@/components/LogoAnimated';

const NAV_MATCH: Record<string, (p: string) => boolean> = {
  home: (p) => p === '/',
  about: (p) => p.startsWith('/about'),
  projects: (p) => p.startsWith('/projects'),
  media: (p) => p.startsWith('/media'),
  documents: (p) => p.startsWith('/documents') || p.startsWith('/blog-detail') || p.startsWith('/story-detail'),
  volunteers: (p) => p.startsWith('/volunteers'),
};

function isActive(key: string, pathname: string | null): boolean {
  const fn = NAV_MATCH[key];
  if (!fn || !pathname) return false;
  return fn(pathname);
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="topnav" aria-label="Main navigation">
      <div className="nav-inner">
        <Link href="/" className="nav-logo" aria-label="Third Eye Worldwide — home">
          <LogoAnimated className="brand-logo-svg" ariaLabel="Third Eye Worldwide" />
        </Link>

        <ul className="nav-links" id="primary-nav" role="menubar">
          <li>
            <Link href="/" data-nav="home" className={isActive('home', pathname) ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              data-nav="about"
              className={`nav-link-btn ${isActive('about', pathname) ? 'active' : ''}`}
            >
              About <i className="ph ph-caret-down" style={{ fontSize: '10px' }}></i>
            </Link>
            <div className="nav-dropdown">
              <Link href="/about#mission">Mission</Link>
              <Link href="/about#team">Team</Link>
            </div>
          </li>
          <li>
            <Link href="/projects" data-nav="projects" className={isActive('projects', pathname) ? 'active' : ''}>
              Projects
            </Link>
          </li>
          <li>
            <Link
              href="/media"
              data-nav="media"
              className={`nav-link-btn ${isActive('media', pathname) ? 'active' : ''}`}
            >
              Media <i className="ph ph-caret-down" style={{ fontSize: '10px' }}></i>
            </Link>
            <div className="nav-dropdown">
              <Link href="/media#photos">Photos</Link>
              <Link href="/media#podcasts">Podcasts</Link>
              <Link href="/media#videos">Videos</Link>
            </div>
          </li>
          <li>
            <Link
              href="/documents"
              data-nav="documents"
              className={`nav-link-btn ${isActive('documents', pathname) ? 'active' : ''}`}
            >
              Documents <i className="ph ph-caret-down" style={{ fontSize: '10px' }}></i>
            </Link>
            <div className="nav-dropdown">
              <Link href="/documents#blogs">Blogs</Link>
              <Link href="/documents#stories">Stories</Link>
            </div>
          </li>
          <li>
            <Link href="/volunteers" data-nav="volunteers" className={isActive('volunteers', pathname) ? 'active' : ''}>
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
