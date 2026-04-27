'use client';

// Phosphor icon imports were removed with the placeholder social row.
// If real social URLs are added later, re-import from the central
// `@/components/icons` re-export so we stay client-safe in one place.

import Link from 'next/link';
import LogoAnimated from '@/components/LogoAnimated';

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <LogoAnimated className="footer-logo-svg" ariaLabel="Third Eye Worldwide" />
            </div>
            <p>Free, open-source technology for blind and low-vision people. Built from inside the experience.</p>
            {/* Social icons removed until real account URLs are available
                — better empty than broken. Re-add when accounts launch. */}
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about#mission">Mission</Link></li>
              <li><Link href="/about#team">Team</Link></li>
              <li><Link href="/projects">Projects</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Media</h4>
            <ul>
              <li><Link href="/media#photos">Photos</Link></li>
              <li><Link href="/media#podcasts">Podcasts</Link></li>
              <li><Link href="/media#videos">Videos</Link></li>
              <li><Link href="/documents#blogs">Blog</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Act</h4>
            <ul>
              <li><Link href="/donate">Donate</Link></li>
              <li><Link href="/volunteers">Volunteer</Link></li>
              <li><a href="mailto:hello@thirdeyeworldwide.org?subject=Partnership">Partner with us</a></li>
              <li><a href="mailto:hello@thirdeyeworldwide.org?subject=Open%20source%20contribution">Open Source</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@thirdeyeworldwide.org">hello@thirdeyeworldwide.org</a></li>
              <li><a href="mailto:press@thirdeyeworldwide.org">Press &amp; Media</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Third Eye Worldwide. Registered 501(c)(3) · EIN 83-1102447</p>
          <p>
            <Link href="/privacy">Privacy Policy</Link>
            {' · '}
            Built with accessibility first.
          </p>
        </div>
      </div>
    </footer>
  );
}
