import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { verifyConfirmationToken, type SubmissionType } from '@/lib/email/token';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cms/submissions/confirm?type=&id=&token=
 *
 * Validates the signed token, flips `confirmed=true` on the matching
 * row, redirects the user to /confirmed (or /confirmed?error=...).
 *
 * Idempotent: clicking the same link twice succeeds both times. The
 * second click finds `confirmed:true` already and just redirects.
 *
 * Per MED-8 in DEFERRED_PLAN.md.
 */

function isSubmissionType(t: unknown): t is SubmissionType {
  return t === 'volunteer' || t === 'donation';
}

function redirectTo(req: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, req.url));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const idStr = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!isSubmissionType(type) || !idStr || !token) {
    logger.warn({ event: 'confirm_malformed' });
    return redirectTo(req, '/confirmed?error=malformed');
  }

  const id = Number.parseInt(idStr, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return redirectTo(req, '/confirmed?error=malformed');
  }

  // Look up the row — this is also where we get the canonical
  // createdAt that the token must match.
  const row =
    type === 'volunteer'
      ? await prisma.volunteerSubmission.findUnique({ where: { id } })
      : await prisma.donationSubmission.findUnique({ where: { id } });

  if (!row) {
    logger.warn({ event: 'confirm_unknown_id', type, id });
    return redirectTo(req, '/confirmed?error=unknown');
  }

  const v = verifyConfirmationToken(type, id, row.createdAt, token);
  if (!v.ok) {
    logger.warn({ event: 'confirm_rejected', type, id, reason: v.reason });
    return redirectTo(req, `/confirmed?error=${v.reason}`);
  }

  // Idempotent: if already confirmed, just redirect with a different
  // banner state. Skip the DB write in that case.
  if (row.confirmed) {
    return redirectTo(req, '/confirmed?already=1');
  }

  if (type === 'volunteer') {
    await prisma.volunteerSubmission.update({ where: { id }, data: { confirmed: true } });
  } else {
    await prisma.donationSubmission.update({ where: { id }, data: { confirmed: true } });
  }
  logger.info({ event: 'confirm_succeeded', type, id });

  return redirectTo(req, '/confirmed');
}
