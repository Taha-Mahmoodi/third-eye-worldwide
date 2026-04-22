'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_MATCH = {
  home: (p) => p === '/',
  about: (p) => p.startsWith('/about'),
  programs: (p) => p.startsWith('/programs'),
  media: (p) => p.startsWith('/media'),
  documents: (p) => p.startsWith('/documents') || p.startsWith('/blog-detail') || p.startsWith('/story-detail'),
  volunteers: (p) => p.startsWith('/volunteers'),
};

function isActive(key, pathname) {
  const fn = NAV_MATCH[key];
  return fn ? fn(pathname) : false;
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="topnav" aria-label="Main navigation">
      <div className="nav-inner">
        <Link href="/" className="nav-logo" aria-label="Third Eye Worldwide — home">
          <img id="brand-logo" src="/assets/logo.svg" alt="Third Eye Worldwide" />
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
              <Link href="/about#mission"><span>Mission</span><span className="dd-sub">Why we exist</span></Link>
              <Link href="/about#team"><span>Team</span><span className="dd-sub">The people behind TEWW</span></Link>
            </div>
          </li>
          <li>
            <Link href="/programs" data-nav="programs" className={isActive('programs', pathname) ? 'active' : ''}>
              Programs
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
              <Link href="/media#photos"><span>Photos</span><span className="dd-sub">From the field</span></Link>
              <Link href="/media#podcasts"><span>Podcasts</span><span className="dd-sub">Listen & subscribe</span></Link>
              <Link href="/media#videos"><span>Videos</span><span className="dd-sub">Watch & learn</span></Link>
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
              <Link href="/documents#blogs"><span>Blogs</span><span className="dd-sub">Insights & research</span></Link>
              <Link href="/documents#stories"><span>Stories</span><span className="dd-sub">Voices from our community</span></Link>
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
