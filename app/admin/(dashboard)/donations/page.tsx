import { prisma } from '@/lib/cms/db';
import logger from '@/lib/logger';
import DonationsClient, {
  type DonationAggregates,
  type DonationRow,
} from '@/components/admin/DonationsClient';

export const dynamic = 'force-dynamic';

const FETCH_CAP = 1000;
const FETCH_WARN_THRESHOLD = 800;

/*
 * CMS_ROADMAP PR #4 — donation aggregates header.
 *
 * Five small queries on top of the row fetch: this-month total,
 * 7-day total, monthly-vs-once split, average gift across all
 * confirmed donations, and the global confirmed total. Every total
 * comes back from Prisma in cents (DB-1) so we divide by 100 here
 * before handing to the client (which keeps display logic free of
 * cents math).
 */
function startOfMonthUtc(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function daysAgoUtc(days: number): Date {
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms);
}

export default async function DonationsAdminPage() {
  const monthStart = startOfMonthUtc();
  const sevenDaysAgo = daysAgoUtc(7);

  const [
    rows,
    monthAgg,
    last7dAgg,
    avgAgg,
    totalAgg,
    monthlyCount,
    onceCount,
  ] = await Promise.all([
    prisma.donationSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: FETCH_CAP,
    }),
    prisma.donationSubmission.aggregate({
      where: { confirmed: true, status: { not: 'failed' }, createdAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.donationSubmission.aggregate({
      where: { confirmed: true, status: { not: 'failed' }, createdAt: { gte: sevenDaysAgo } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.donationSubmission.aggregate({
      where: { confirmed: true, status: { not: 'failed' } },
      _avg: { amount: true },
    }),
    prisma.donationSubmission.aggregate({
      where: { confirmed: true, status: { not: 'failed' } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.donationSubmission.count({
      where: { confirmed: true, mode: 'monthly' },
    }),
    prisma.donationSubmission.count({
      where: { confirmed: true, mode: 'once' },
    }),
  ]);

  if (rows.length >= FETCH_WARN_THRESHOLD) {
    logger.warn(
      { event: 'admin_donations_near_cap', rows: rows.length, cap: FETCH_CAP },
      'donation admin list near in-memory cap — consider cursor pagination',
    );
  }

  const aggregates: DonationAggregates = {
    // CMS-1: cents → dollars at the edge.
    totalRaised: (totalAgg._sum.amount ?? 0) / 100,
    totalCount: totalAgg._count._all,
    monthlyCount,
    onceCount,
    avgGift: (avgAgg._avg.amount ?? 0) / 100,
    thisMonthRaised: (monthAgg._sum.amount ?? 0) / 100,
    thisMonthCount: monthAgg._count._all,
    last7dRaised: (last7dAgg._sum.amount ?? 0) / 100,
    last7dCount: last7dAgg._count._all,
  };

  // amount stays in cents through serialisation; the client divides
  // by 100 only at display time (CMS-1).
  const serialized: DonationRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    amount: r.amount, // integer cents
    mode: r.mode,
    currency: r.currency,
    status: r.status,
    note: r.note,
    adminNote: r.adminNote,
    confirmed: r.confirmed,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <DonationsClient initialRows={serialized} aggregates={aggregates} />;
}
