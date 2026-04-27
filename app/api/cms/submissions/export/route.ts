import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/*
 * CMS_ROADMAP PR #4 — admin CSV export.
 *
 * GET /api/cms/submissions/export?type=volunteers|donations[&from=ISO][&to=ISO]
 *
 * Returns a `text/csv` download. Admin-only — guarded both by
 * middleware (the `/admin` redirect) and by `isAdmin()` here so
 * direct API hits without a session bounce with 401.
 *
 * Date filters are inclusive at the day level. `from` defaults to
 * "epoch", `to` to "now". Bad ISO strings are ignored — they fall
 * back to the defaults rather than 400, so a malformed Calendar app
 * link doesn't break a triage workflow.
 *
 * Donation amounts are integer cents in the DB (DB-1). We export
 * `amount_usd` as the dollar string so the CSV opens cleanly in
 * Excel without surprising "$25.00 came out as 2500" feedback.
 */

const VALID_TYPES = ['volunteers', 'donations'] as const;
type ExportType = (typeof VALID_TYPES)[number];

function isExportType(s: string | null): s is ExportType {
  return s !== null && (VALID_TYPES as readonly string[]).includes(s);
}

function parseISO(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * RFC 4180 quoting: wrap any field that contains a comma, quote, or
 * newline in double quotes and double up any embedded quotes. Plain
 * fields go through unchanged so the file is readable in a text
 * editor.
 */
function csvField(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : String(v);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cols: unknown[]): string {
  return cols.map(csvField).join(',');
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
  const type = url.searchParams.get('type');
  if (!isExportType(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 },
    );
  }

  const from = parseISO(url.searchParams.get('from'));
  const to = parseISO(url.searchParams.get('to'));
  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${type}-${stamp}.csv`;

  if (type === 'volunteers') {
    const rows = await prisma.volunteerSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50_000, // hard cap so a forgotten filter doesn't OOM the worker
    });
    const header = csvRow([
      'id', 'name', 'email', 'role', 'skills', 'message',
      'status', 'confirmed', 'admin_note', 'created_at', 'updated_at',
    ]);
    const body = rows
      .map((r) =>
        csvRow([
          r.id,
          r.name,
          r.email,
          r.role ?? '',
          r.skills ?? '',
          r.message ?? '',
          r.status,
          r.confirmed ? 'true' : 'false',
          r.adminNote ?? '',
          r.createdAt.toISOString(),
          r.updatedAt.toISOString(),
        ]),
      )
      .join('\r\n');
    logger.info({
      event: 'admin_export',
      type,
      rows: rows.length,
      by: admin.user?.email || admin.user?.name || 'token',
    });
    return new NextResponse(`${header}\r\n${body}\r\n`, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  // donations
  const rows = await prisma.donationSubmission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50_000,
  });
  const header = csvRow([
    'id', 'name', 'email', 'amount_usd', 'currency', 'mode',
    'status', 'confirmed', 'note', 'admin_note', 'created_at', 'updated_at',
  ]);
  const body = rows
    .map((r) =>
      csvRow([
        r.id,
        r.name,
        r.email,
        // DB-1: stored as integer cents. Export as dollars (2dp).
        (r.amount / 100).toFixed(2),
        r.currency,
        r.mode,
        r.status,
        r.confirmed ? 'true' : 'false',
        r.note ?? '',
        r.adminNote ?? '',
        r.createdAt.toISOString(),
        r.updatedAt.toISOString(),
      ]),
    )
    .join('\r\n');
  logger.info({
    event: 'admin_export',
    type,
    rows: rows.length,
    by: admin.user?.email || admin.user?.name || 'token',
  });
  return new NextResponse(`${header}\r\n${body}\r\n`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });
}
