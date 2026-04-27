import { prisma } from '@/lib/cms/db';
import logger from '@/lib/logger';
import VolunteersClient, { type VolunteerRow } from '@/components/admin/VolunteersClient';

export const dynamic = 'force-dynamic';

/*
 * Server-side load of every volunteer submission. We pull all of them
 * (capped at 1000) and let the client filter/search in memory, which
 * is fine for the foreseeable scale. Per CMS-8 we log a warning when
 * the result set approaches the cap so we know to introduce real
 * pagination before it bites.
 */
const FETCH_CAP = 1000;
const FETCH_WARN_THRESHOLD = 800;

export default async function VolunteersAdminPage() {
  const rows = await prisma.volunteerSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: FETCH_CAP,
  });

  if (rows.length >= FETCH_WARN_THRESHOLD) {
    logger.warn(
      { event: 'admin_volunteers_near_cap', rows: rows.length, cap: FETCH_CAP },
      'volunteer admin list near in-memory cap — consider cursor pagination',
    );
  }

  // Serialise dates so the client component receives plain strings.
  // Prisma Date objects don't survive the server→client boundary
  // without manual handling.
  const serialized: VolunteerRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    skills: r.skills,
    message: r.message,
    status: r.status,
    confirmed: r.confirmed,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <VolunteersClient initialRows={serialized} />;
}
