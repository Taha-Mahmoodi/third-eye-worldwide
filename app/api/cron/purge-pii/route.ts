/*
 * Monthly PII retention purge.
 *
 * The seed file flagged this gap explicitly: VolunteerSubmission and
 * DonationSubmission rows hold PII (name, email, amount). The privacy
 * policy at /privacy commits to a ~2-year retention window. Without
 * an automated job, that PII piles up forever and we'd be in violation
 * of our own policy.
 *
 * Wired to Vercel Cron via a vercel.json crons entry. Vercel sends a
 * GET with `Authorization: Bearer ${CRON_SECRET}`, which we check
 * against the env var. Anything else gets 401 — keeps the endpoint
 * from being a public DELETE-everything switch.
 *
 * Run cadence: 03:00 UTC on the 1st of every month. Idempotent —
 * deleting an already-deleted row is a 0-row no-op.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  // Vercel Cron passes the Authorization header. In Vercel's env it's
  // also possible to verify the cron call origin — but the bearer-
  // secret check is enough on its own and works on every host.
  const authHeader = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="Cron"' } },
    );
  }

  const cutoff = new Date(Date.now() - TWO_YEARS_MS);

  const [volunteers, donations] = await Promise.all([
    prisma.volunteerSubmission.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.donationSubmission.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]);

  logger.info({
    event: 'pii_purge_ran',
    cutoff: cutoff.toISOString(),
    volunteersDeleted: volunteers.count,
    donationsDeleted: donations.count,
  });

  return NextResponse.json({
    ok: true,
    cutoff,
    deleted: { volunteers: volunteers.count, donations: donations.count },
  });
}
