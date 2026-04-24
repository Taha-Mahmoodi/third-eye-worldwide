import Link from 'next/link';
import Countdown from '@/components/Countdown';
import { pageMetadata } from '@/lib/seo';

// Target launch time — 2 days from the initial deploy (2026-04-23).
// Edit this ISO string to shift the launch date without touching anything else.
const LAUNCH_ISO = '2026-04-25T12:00:00Z';

// noindex: a placeholder page shouldn't rank on search engines.
// The marketing team can flip this when the launch actually ships.
export const metadata = pageMetadata({
  title: 'Coming soon — Third Eye Worldwide',
  description: 'Something new from Third Eye Worldwide is launching in just 2 days.',
  path: '/coming-soon',
  noindex: true,
});

export default function ComingSoonPage() {
  const launchDate = new Date(LAUNCH_ISO);
  const launchHuman = launchDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="coming-soon">
      <div className="cs-bg" aria-hidden="true">
        <span className="cs-ring cs-ring-1"></span>
        <span className="cs-ring cs-ring-2"></span>
        <span className="cs-ring cs-ring-3"></span>
      </div>

      <div className="cs-inner">
        <div className="cs-eye" aria-hidden="true">
          <svg viewBox="0 0 220 257.57" fill="currentColor">
            <path d="M212.24,8.45c-5.74-5.63-13.38-8.45-22.94-8.45H0v57.17c13.39-5.17,28.43-8.08,44.32-8.08,32.4,0,61.24,12.06,79.89,30.85,3.56,3.59,3.56,9.32,0,12.9-18.65,18.79-47.49,30.86-79.89,30.86-5.32,0-10.54-.33-15.64-.96-10.14-1.24-19.77-3.69-28.68-7.13v108.45c0,9.77,2.86,17.47,8.6,23.11,5.74,5.63,13.38,8.45,22.94,8.45h189.29v-57.17c-13.4,5.17-28.43,8.08-44.32,8.08-32.4,0-61.25-12.06-79.89-30.85-3.56-3.59-3.56-9.32,0-12.9,18.64-18.79,47.49-30.86,79.89-30.86,5.32,0,10.54.33,15.64.96,10.13,1.24,19.76,3.69,28.68,7.13V31.55c0-9.77-2.86-17.48-8.6-23.11Z"/>
          </svg>
        </div>

        <div className="section-eyebrow cs-eyebrow">Coming soon</div>
        <h1 className="cs-title">
          Something <em>new</em> is coming.
        </h1>
        <p className="cs-sub">
          We&apos;re putting the finishing touches on our next release. In just 2 days,
          we&apos;ll open a new chapter of tools, stories, and community work —
          all free, all open-source.
        </p>

        <Countdown targetIso={LAUNCH_ISO} />

        <div className="cs-launch-date">
          <i className="ph ph-calendar-check" aria-hidden="true"></i>
          Launching {launchHuman}
        </div>

        <div className="cs-actions">
          <Link href="/volunteers" className="btn-primary">
            <i className="ph-fill ph-hand-heart"></i>
            Get involved
          </Link>
          <Link href="/" className="btn-secondary">
            <i className="ph ph-house"></i>
            Back to site
          </Link>
        </div>

        <div className="cs-footnote">
          While you wait — read our{' '}
          <Link href="/documents">latest stories</Link>,{' '}
          browse{' '}
          <Link href="/projects">our projects</Link>, or{' '}
          <a href="mailto:hello@thirdeyeworldwide.org">drop us a note</a>.
        </div>
      </div>
    </div>
  );
}
