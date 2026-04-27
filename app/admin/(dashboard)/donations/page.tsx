import { prisma } from '@/lib/cms/db';
import logger from '@/lib/logger';
import DonationsClient, { type DonationRow } from '@/components/admin/DonationsClient';

export const dynamic = 'force-dynamic';

const FETCH_CAP = 1000;
const FETCH_WARN_THRESHOLD = 800;

export default async function DonationsAdminPage() {
  const rows = await prisma.donationSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: FETCH_CAP,
  });

  if (rows.length >= FETCH_WARN_THRESHOLD) {
    logger.warn(
      { event: 'admin_donations_near_cap', rows: rows.length, cap: FETCH_CAP },
      'donation admin list near in-memory cap — consider cursor pagination',
    );
  }

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
    confirmed: r.confirmed,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <DonationsClient initialRows={serialized} />;
}
