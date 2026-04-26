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
            <p>Technology that opens new worlds for people with visual impairment. Free, open-source, and built for everyone.</p>
            <div className="footer-social">
              <a href="#" aria-label="GitHub"><i className="ph ph-github-logo"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="ph ph-linkedin-logo"></i></a>
              <a href="#" aria-label="YouTube"><i className="ph ph-youtube-logo"></i></a>
              <a href="#" aria-label="Twitter"><i className="ph ph-x-logo"></i></a>
            </div>
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
              <li><a href="#">Partner with us</a></li>
              <li><a href="#">Open Source</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@thirdeyeworldwide.org">hello@thirdeyeworldwide.org</a></li>
              <li><a href="tel:+18008399001">+1 (800) TEWW-001</a></li>
              <li><a href="#">12 Access Road, New York NY</a></li>
              <li><a href="#">Press &amp; Media</a></li>
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
