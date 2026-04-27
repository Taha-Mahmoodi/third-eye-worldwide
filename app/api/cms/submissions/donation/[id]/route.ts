import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { checkAsync, requestIp } from '@/lib/rate-limit';
import { DONATION_STATUSES } from '@/lib/constants';
import { logAudit } from '@/lib/audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const UNAUTH = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
);

// CMS-7: per-IP rate-limit on the admin mutation paths. Same pattern
// as the volunteer route — see that file's comment.
async function rateLimit(req: NextRequest, action: 'patch' | 'delete') {
  const ip = requestIp(req);
  const opts =
    action === 'patch'
      ? { capacity: 60, refillIntervalMs: 60_000 }
      : { capacity: 20, refillIntervalMs: 60_000 };
  const rl = await checkAsync(`cms_${action}_donation:${ip}`, opts);
  if (rl.allowed) return null;
  logger.warn({ event: 'rate_limited', ip, endpoint: `donation_${action}` });
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
  );
}

const ADMIN_NOTE_MAX = 4000;

/**
 * PATCH /api/cms/submissions/donation/:id
 *
 * Partial update — accepts `status` and/or `adminNote`. Same shape as
 * the volunteer PATCH; see that file for full notes.
 *
 * Responses:
 *   200 { ok: true, status?, adminNote? }
 *   400 { error }
 *   401 { error: 'Unauthorized' }
 *   429 { error }
 *   404 { error: 'Not found' }
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  const limited = await rateLimit(req, 'patch');
  if (limited) return limited;

  const id = Number.parseInt(params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  let body: { status?: unknown; adminNote?: unknown };
  try {
    body = (await req.json()) as { status?: unknown; adminNote?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const data: { status?: string; adminNote?: string | null } = {};

  if (body.status !== undefined) {
    if (
      typeof body.status !== 'string' ||
      !(DONATION_STATUSES as readonly string[]).includes(body.status)
    ) {
      return NextResponse.json(
        { error: `status must be one of: ${DONATION_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }
    data.status = body.status;
  }

  if (body.adminNote !== undefined) {
    if (body.adminNote === null || body.adminNote === '') {
      data.adminNote = null;
    } else if (typeof body.adminNote !== 'string') {
      return NextResponse.json({ error: 'adminNote must be a string or null' }, { status: 400 });
    } else {
      data.adminNote = body.adminNote.slice(0, ADMIN_NOTE_MAX);
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'patch must include at least one of: status, adminNote' },
      { status: 400 },
    );
  }

  try {
    await prisma.donationSubmission.update({
      where: { id },
      data,
    });
    const actor = admin.user?.email || admin.user?.name || 'token';
    logger.info({
      event: 'donation_patched',
      id,
      keys: Object.keys(data),
      by: actor,
    });
    void logAudit({
      actor,
      action: 'submission.donation.patch',
      target: String(id),
      diff: data,
    });
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.error({ err: e, event: 'donation_patch_failed', id }, 'donation patch failed');
    throw e;
  }
}

/**
 * DELETE /api/cms/submissions/donation/:id
 *
 * Hard-deletes a donation-intent record. Required for GDPR
 * right-to-erasure — see CRIT-2 in CODEBASE_REVIEW.md. Admin-only.
 *
 * Responses:
 *   200 { ok: true }                — deleted
 *   401 { error: 'Unauthorized' }
 *   429 { error }                   — rate-limited (CMS-7)
 *   404 { error: 'Not found' }
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  const limited = await rateLimit(req, 'delete');
  if (limited) return limited;

  const id = Number.parseInt(params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    await prisma.donationSubmission.delete({ where: { id } });
    const actor = admin.user?.email || admin.user?.name || 'token';
    logger.info({ event: 'donation_deleted', id, by: actor });
    void logAudit({
      actor,
      action: 'submission.donation.delete',
      target: String(id),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.error({ err: e, event: 'donation_delete_failed', id }, 'donation delete failed');
    throw e;
  }
}
