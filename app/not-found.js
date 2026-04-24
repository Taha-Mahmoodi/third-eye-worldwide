import Link from 'next/link';

export const metadata = {
  title: 'Page not found — Third Eye Worldwide',
};

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-inner">
        <div className="error-code" aria-hidden="true">404</div>
        <div className="section-eyebrow">We couldn&apos;t find that page</div>
        <h1 className="error-title">
          This page is <em>out of sight.</em>
        </h1>
        <p className="error-sub">
          The link you followed might be broken, or the page may have moved.
          Let&apos;s get you back somewhere useful.
        </p>

        <div className="error-actions">
          <Link href="/" className="btn-primary">
            <i className="ph ph-house"></i>
            Back to home
          </Link>
          <Link href="/projects" className="btn-secondary">
            See our projects
            <i className="ph ph-arrow-right"></i>
          </Link>
        </div>

        <div className="error-links">
          <div className="error-links-title">Popular destinations</div>
          <ul>
            <li><Link href="/about">About Third Eye Worldwide</Link></li>
            <li><Link href="/media">Media — photos, podcasts, videos</Link></li>
            <li><Link href="/documents">Documents — blogs and stories</Link></li>
            <li><Link href="/volunteers">Volunteer with us</Link></li>
            <li><Link href="/donate">Donate</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
