import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';

export const dynamic = 'force-dynamic';

/*
 * GET /api/cms/audit-log
 *
 * Paginated, filterable feed of CMS write events. Admin-only — the
 * audit trail names users by email and includes diff payloads, so it
 * shouldn't leak to the editor role.
 *
 * Query params (all optional):
 *   actor   — exact email (or 'system')
 *   action  — exact action slug ('cms.publish', etc)
 *   from    — ISO date; rows >= this createdAt
 *   to      — ISO date; rows <= this createdAt
 *   cursor  — id of the last seen row; returns rows with createdAt
 *             strictly older than that row's createdAt (paged 50 at a time)
 *
 * Response: { rows, nextCursor }
 */

const PAGE_SIZE = 50;

function parseISO(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  const admin = await isAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
    );
  }

  const url = new URL(req.url);
  const actor = url.searchParams.get('actor');
  const action = url.searchParams.get('action');
  const from = parseISO(url.searchParams.get('from'));
  const to = parseISO(url.searchParams.get('to'));
  const cursor = url.searchParams.get('cursor');

  const where: {
    actor?: string;
    action?: string;
    createdAt?: { gte?: Date; lte?: Date; lt?: Date };
  } = {};
  if (actor) where.actor = actor;
  if (action) where.action = action;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  // Cursor: fetch the cursor row's createdAt and use it as an upper
  // bound. ContentRevision uses the same trick — sticking with id-only
  // cursors would require ordering by id which is an opaque cuid.
  if (cursor) {
    const cursorRow = await prisma.auditLogEntry.findUnique({
      where: { id: cursor },
      select: { createdAt: true },
    });
    if (cursorRow) {
      where.createdAt = where.createdAt ?? {};
      where.createdAt.lt = cursorRow.createdAt;
    }
  }

  const rows = await prisma.auditLogEntry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE,
  });
  const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1].id : null;

  return NextResponse.json({ rows, nextCursor });
}
