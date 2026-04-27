import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { checkAsync, requestIp } from '@/lib/rate-limit';
import { DONATION_STATUSES } from '@/lib/constants';
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

/**
 * PATCH /api/cms/submissions/donation/:id
 *
 * Updates the row's `status`. Admin-only.
 *
 * Body:  { status: 'pending' | 'succeeded' | 'failed' }
 *
 * Responses:
 *   200 { ok: true, status }
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

  let body: { status?: unknown };
  try {
    body = (await req.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { status } = body;
  if (typeof status !== 'string' || !(DONATION_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${DONATION_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    await prisma.donationSubmission.update({
      where: { id },
      data: { status },
    });
    logger.info({
      event: 'donation_status_updated',
      id,
      status,
      by: admin.user?.email || admin.user?.name || 'token',
    });
    return NextResponse.json({ ok: true, status });
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
    logger.info({
      event: 'donation_deleted',
      id,
      by: admin.user?.email || admin.user?.name || 'token',
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
