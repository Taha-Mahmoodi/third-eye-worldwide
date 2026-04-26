import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 86400; // 24h — this page rarely changes

export const metadata = pageMetadata({
  title: 'Privacy Policy — Third Eye Worldwide',
  description:
    'How Third Eye Worldwide collects, stores, and protects the personal information you share when you donate or sign up to volunteer.',
  path: '/privacy',
});

const RETENTION_YEARS = 2;
const CONTACT_EMAIL = 'privacy@thirdeyeworldwide.org';
const LAST_UPDATED = 'April 2026';

export default function PrivacyPolicyPage() {
  return (
    <section className="section">
      <div className="section-inner" style={{ maxWidth: 760 }}>
        <header className="section-heading left" style={{ textAlign: 'left', marginBottom: 32 }}>
          <div className="section-eyebrow">Legal</div>
          <h1 className="section-title">Privacy Policy</h1>
          <p className="section-subtitle" style={{ margin: 0 }}>
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="prose">
          <h2>What we collect</h2>
          <p>
            Third Eye Worldwide collects only the information you choose to give us when you
            interact with our forms:
          </p>
          <ul>
            <li>
              <strong>Volunteer applications:</strong> your name, email, the role you&rsquo;re
              interested in, the skills you list, and any message you write us.
            </li>
            <li>
              <strong>Donation interest:</strong> your name, email, the donation amount and
              cadence (monthly or one-time), the currency, and any note you add.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> collect payment-card data on this site. The donate form
            registers your interest only; a member of our team contacts you separately to
            complete the donation.
          </p>

          <h2>Why we collect it</h2>
          <p>
            We use this information for one purpose only — to follow up with you about the
            volunteer opportunity or donation you expressed interest in. We do not use it for
            advertising, profiling, or analytics.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We retain volunteer and donation records for up to <strong>{RETENTION_YEARS} years</strong>{' '}
            after our last contact with you. Records older than this are purged on a recurring
            basis. You may also request earlier deletion at any time (see below).
          </p>

          <h2>Who has access</h2>
          <p>
            Your data lives in a database that only our admin staff can read. We do not sell,
            rent, or share your information with third parties. We do not pass it to advertisers
            or data brokers.
          </p>

          <h2>Cookies and tracking</h2>
          <p>
            The site uses a small, first-party cookie to remember your sign-in session if you
            log into the admin dashboard, and uses <code>localStorage</code> to remember your
            theme and text-size preferences. There are no third-party tracking cookies, no
            analytics pixels, and no ad networks.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask us at any time to:
          </p>
          <ul>
            <li>Confirm what information we hold about you</li>
            <li>Correct anything that&rsquo;s wrong</li>
            <li>Delete your record entirely (the &ldquo;right to erasure&rdquo;)</li>
            <li>Withdraw consent for any future contact</li>
          </ul>
          <p>
            To exercise any of these rights, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address you used to
            sign up. We&rsquo;ll respond within 30 days. There&rsquo;s no charge.
          </p>

          <h2>Security</h2>
          <p>
            Sessions are signed with a server-side secret. Passwords (for our admin staff) are
            stored as scrypt hashes with per-user salts and compared in constant time. Forms are
            rate-limited to slow down abuse. The database is hosted on infrastructure that
            applies its own encryption-at-rest.
          </p>

          <h2>Children</h2>
          <p>
            This site is not intended for children under 13. If you believe we&rsquo;ve
            collected information from someone in that age group, please email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&rsquo;ll delete it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we change how we handle data, we&rsquo;ll update this page and bump the
            &ldquo;last updated&rdquo; date at the top. Material changes will also be announced
            on the home page.
          </p>

          <h2>Contact</h2>
          <p>
            Third Eye Worldwide is a registered 501(c)(3). For privacy questions, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. For everything else, see
            our <Link href="/about">about page</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
