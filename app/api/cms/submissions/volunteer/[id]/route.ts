import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { checkAsync, requestIp } from '@/lib/rate-limit';
import { VOLUNTEER_STATUSES } from '@/lib/constants';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const UNAUTH = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
);

/*
 * Per-IP rate-limit for the admin mutation paths (CMS-7). Plenty of
 * headroom for a real admin clicking around (60 PATCHes / 20 DELETEs
 * per minute), tight enough to make a runaway script visible. The
 * limiter ID encodes the action so a noisy PATCH loop doesn't lock
 * the admin out of legitimate deletes.
 */
async function rateLimit(req: NextRequest, action: 'patch' | 'delete') {
  const ip = requestIp(req);
  const opts =
    action === 'patch'
      ? { capacity: 60, refillIntervalMs: 60_000 }
      : { capacity: 20, refillIntervalMs: 60_000 };
  const rl = await checkAsync(`cms_${action}_volunteer:${ip}`, opts);
  if (rl.allowed) return null;
  logger.warn({ event: 'rate_limited', ip, endpoint: `volunteer_${action}` });
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
  );
}

/**
 * PATCH /api/cms/submissions/volunteer/:id
 *
 * Updates the row's `status` (and nothing else for now). Admin-only.
 *
 * Body:  { status: 'new' | 'contacted' | 'onboarded' | 'rejected' }
 *
 * Responses:
 *   200 { ok: true, status }
 *   400 { error }              — bad id / invalid status
 *   401 { error: 'Unauthorized' }
 *   429 { error }              — rate-limited
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
  if (typeof status !== 'string' || !(VOLUNTEER_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VOLUNTEER_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    await prisma.volunteerSubmission.update({
      where: { id },
      data: { status },
    });
    logger.info({
      event: 'volunteer_status_updated',
      id,
      status,
      by: admin.user?.email || admin.user?.name || 'token',
    });
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.error({ err: e, event: 'volunteer_patch_failed', id }, 'volunteer patch failed');
    throw e;
  }
}

/**
 * DELETE /api/cms/submissions/volunteer/:id
 *
 * Hard-deletes a volunteer submission. Required for GDPR right-to-erasure
 * — see CRIT-2 in CODEBASE_REVIEW.md. Admin-only.
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
    await prisma.volunteerSubmission.delete({ where: { id } });
    logger.info({
      event: 'volunteer_deleted',
      id,
      by: admin.user?.email || admin.user?.name || 'token',
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.error({ err: e, event: 'volunteer_delete_failed', id }, 'volunteer delete failed');
    throw e;
  }
}
