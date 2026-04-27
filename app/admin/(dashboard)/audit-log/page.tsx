import { redirect } from 'next/navigation';
import { prisma } from '@/lib/cms/db';
import { auth } from '@/lib/auth';
import AuditLogClient, { type AuditLogRow } from '@/components/admin/AuditLogClient';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function AuditLogAdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    redirect('/admin');
  }

  const rows = await prisma.auditLogEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE,
  });
  const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1].id : null;

  // Distinct actor / action lists drive the filter dropdowns.
  // Two cheap queries — the audit table is bounded in growth and
  // these aggregate lookups are fast even at high row counts.
  const [actorRows, actionRows] = await Promise.all([
    prisma.auditLogEntry.findMany({
      distinct: ['actor'],
      select: { actor: true },
      orderBy: { actor: 'asc' },
    }),
    prisma.auditLogEntry.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    }),
  ]);

  const serialized: AuditLogRow[] = rows.map((r) => ({
    id: r.id,
    actor: r.actor,
    action: r.action,
    target: r.target,
    diff: r.diff,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <AuditLogClient
      initialRows={serialized}
      initialNextCursor={nextCursor}
      actors={actorRows.map((a) => a.actor)}
      actions={actionRows.map((a) => a.action)}
    />
  );
}
