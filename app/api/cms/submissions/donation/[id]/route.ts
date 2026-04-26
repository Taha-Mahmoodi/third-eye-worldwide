import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/cms/submissions/donation/:id
 *
 * Hard-deletes a donation-intent record. Required for GDPR
 * right-to-erasure — see CRIT-2 in CODEBASE_REVIEW.md. Admin-only.
 *
 * Responses:
 *   200 { ok: true }                — deleted
 *   401 { error: 'Unauthorized' }   — not signed in / not admin
 *   404 { error: 'Not found' }      — no row with that id
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await isAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
