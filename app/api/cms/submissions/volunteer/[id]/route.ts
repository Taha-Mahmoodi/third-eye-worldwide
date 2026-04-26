import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/cms/submissions/volunteer/:id
 *
 * Hard-deletes a volunteer submission. Required for GDPR right-to-erasure
 * — see CRIT-2 in CODEBASE_REVIEW.md. Admin-only.
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
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number.parseInt(params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    await prisma.volunteerSubmission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // P2025 = "record to delete does not exist"
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    throw e;
  }
}
