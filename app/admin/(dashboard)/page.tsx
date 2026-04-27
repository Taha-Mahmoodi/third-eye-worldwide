import Link from 'next/link';
import { prisma } from '@/lib/cms/db';
import { CurrencyDollar, HandHeart, SealCheck, Users } from '@/components/icons';

export const dynamic = 'force-dynamic';

/*
 * Overview — the dashboard landing page after sign-in. Five aggregate
 * queries (volunteer count, donation count, total raised, recent
 * donations, recent volunteers) feed four stat cards and two recent-
 * activity lists.
 *
 * `donationAmountAgg._sum.amount` is in INTEGER CENTS (DATABASE_FIXES
 * DB-1). Per CMS-1 we divide by 100 before any human-facing format.
 */
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const usdPrecise = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default async function DashboardOverviewPage() {
  // Run the five queries in parallel.
  const [
    volunteerCount,
    confirmedVolunteerCount,
    donationCount,
    donationAmountAgg,
    recentDonations,
    recentVolunteers,
  ] = await Promise.all([
    prisma.volunteerSubmission.count(),
    prisma.volunteerSubmission.count({ where: { confirmed: true } }),
    prisma.donationSubmission.count({ where: { confirmed: true } }),
    prisma.donationSubmission.aggregate({
      where: { confirmed: true, status: { not: 'failed' } },
      _sum: { amount: true },
    }),
    prisma.donationSubmission.findMany({
      where: { confirmed: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        amount: true,
        currency: true,
        mode: true,
        createdAt: true,
      },
    }),
    prisma.volunteerSubmission.findMany({
      where: { confirmed: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  // CMS-1: donation amounts are integer cents — divide by 100 to display.
  const totalRaised = (donationAmountAgg._sum.amount ?? 0) / 100;

  return (
    <>
      <header className="adm-page-header">
        <h1>Overview</h1>
        <p className="adm-page-sub">
          Site-wide activity at a glance. Confirmed entries only.
        </p>
      </header>

      <section className="adm-stats" aria-label="Summary">
        <article className="adm-stat-card">
          <div className="adm-stat-icon adm-stat-icon-brand">
            <Users size="1.4em" aria-hidden="true" />
          </div>
          <div className="adm-stat-meta">
            <div className="adm-stat-label">Volunteers</div>
            <div className="adm-stat-value">{confirmedVolunteerCount.toLocaleString()}</div>
            <div className="adm-stat-sub">
              {volunteerCount.toLocaleString()} total incl. unconfirmed
            </div>
          </div>
        </article>

        <article className="adm-stat-card">
          <div className="adm-stat-icon adm-stat-icon-accent">
            <HandHeart size="1.4em" aria-hidden="true" />
          </div>
          <div className="adm-stat-meta">
            <div className="adm-stat-label">Donations</div>
            <div className="adm-stat-value">{donationCount.toLocaleString()}</div>
            <div className="adm-stat-sub">confirmed intents</div>
          </div>
        </article>

        <article className="adm-stat-card">
          <div className="adm-stat-icon adm-stat-icon-brand">
            <CurrencyDollar size="1.4em" aria-hidden="true" />
          </div>
          <div className="adm-stat-meta">
            <div className="adm-stat-label">Total raised</div>
            <div className="adm-stat-value">{usd.format(totalRaised)}</div>
            <div className="adm-stat-sub">across confirmed donations</div>
          </div>
        </article>

        <article className="adm-stat-card">
          <div className="adm-stat-icon adm-stat-icon-accent">
            <SealCheck size="1.4em" aria-hidden="true" />
          </div>
          <div className="adm-stat-meta">
            <div className="adm-stat-label">Confirmation rate</div>
            <div className="adm-stat-value">
              {volunteerCount > 0
                ? `${Math.round((confirmedVolunteerCount / volunteerCount) * 100)}%`
                : '—'}
            </div>
            <div className="adm-stat-sub">volunteer email confirms</div>
          </div>
        </article>
      </section>

      <section className="adm-grid-2">
        <article className="adm-panel">
          <header className="adm-panel-header">
            <h2>Recent donations</h2>
            <Link href="/admin/donations" className="adm-link">View all →</Link>
          </header>
          {recentDonations.length === 0 ? (
            <p className="adm-empty">No confirmed donations yet.</p>
          ) : (
            <ul className="adm-list">
              {recentDonations.map((d) => (
                <li key={d.id}>
                  <span className="adm-list-name">{d.name}</span>
                  <span className="adm-list-amount">
                    {/* CMS-1: cents → dollars for display. */}
                    {usdPrecise.format(d.amount / 100)}
                  </span>
                  <span className="adm-list-meta">{d.mode}</span>
                  <time className="adm-list-time">
                    {d.createdAt.toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="adm-panel">
          <header className="adm-panel-header">
            <h2>Recent volunteers</h2>
            <Link href="/admin/volunteers" className="adm-link">View all →</Link>
          </header>
          {recentVolunteers.length === 0 ? (
            <p className="adm-empty">No confirmed volunteers yet.</p>
          ) : (
            <ul className="adm-list">
              {recentVolunteers.map((v) => (
                <li key={v.id}>
                  <span className="adm-list-name">{v.name}</span>
                  <span className="adm-list-meta">{v.status}</span>
                  <time className="adm-list-time">
                    {v.createdAt.toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </>
  );
}
