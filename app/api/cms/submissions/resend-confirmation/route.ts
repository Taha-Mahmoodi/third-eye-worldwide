import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { checkAsync, requestIp } from '@/lib/rate-limit';
import {
  RESEND_CONFIRMATION_MAX_REQUESTS,
  RESEND_CONFIRMATION_WINDOW_MS,
} from '@/lib/constants';
import logger from '@/lib/logger';
import { isValidEmail } from '@/lib/validators';
import { isAllowedOrigin } from '@/lib/csrf';
import { sendEmail } from '@/lib/email/send';
import { volunteerConfirmationEmail } from '@/lib/email/templates/confirm-volunteer';
import { donationConfirmationEmail } from '@/lib/email/templates/confirm-donation';
import { siteUrl } from '@/lib/seo';
import type { SubmissionType } from '@/lib/email/token';

export const dynamic = 'force-dynamic';

interface ResendBody {
  type?: unknown;
  id?: unknown;
  email?: unknown;
}

function isSubmissionType(t: unknown): t is SubmissionType {
  return t === 'volunteer' || t === 'donation';
}

/**
 * POST /api/cms/submissions/resend-confirmation
 *
 * Body: { type: 'volunteer' | 'donation', id: number, email: string }
 *
 * Re-sends the confirmation email for an unconfirmed row. Requires
 * the submitted email to match the row's email — otherwise an
 * attacker who guesses an id could spam unrelated mailboxes.
 *
 * Rate-limited to 1 per IP per hour. Returns 200 on success or for
 * any "looks fine but we won't tell you" case (unknown id, mismatched
 * email, already confirmed) so attackers can't probe for valid ids.
 *
 * Per MED-8 in DEFERRED_PLAN.md.
 */
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    logger.warn({ event: 'csrf_blocked', ip: requestIp(req), origin: req.headers.get('origin') });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = requestIp(req);
  const rl = await checkAsync(`resend-confirmation:${ip}`, {
    capacity: RESEND_CONFIRMATION_MAX_REQUESTS,
    refillIntervalMs: RESEND_CONFIRMATION_WINDOW_MS,
  });
  if (!rl.allowed) {
    logger.warn({ event: 'rate_limited', ip, endpoint: 'resend_confirmation' });
    return NextResponse.json(
      { error: 'Please wait a bit before requesting another email.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  let body: ResendBody;
  try {
    body = (await req.json()) as ResendBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = body.type;
  const id = Number(body.id);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!isSubmissionType(type) || !Number.isInteger(id) || id <= 0 || !isValidEmail(email)) {
    return NextResponse.json({ error: 'type, id, email required' }, { status: 400 });
  }

  // Generic 200 response — never reveals whether the id exists, so
  // attackers can't enumerate.
  const generic = NextResponse.json({ ok: true });

  if (type === 'volunteer') {
    const row = await prisma.volunteerSubmission.findUnique({ where: { id } });
    if (!row || row.email.toLowerCase() !== email || row.confirmed) {
      logger.info({ event: 'resend_noop', type, id, reason: !row ? 'no_row' : row.confirmed ? 'already' : 'email_mismatch' });
      return generic;
    }
    const e = volunteerConfirmationEmail({ id: row.id, name: row.name, createdAt: row.createdAt, siteUrl: siteUrl('') });
    sendEmail({ to: row.email, subject: e.subject, text: e.text, html: e.html })
      .catch((err) => logger.error({ err, event: 'email_send_threw', id: row.id }));
  } else {
    const row = await prisma.donationSubmission.findUnique({ where: { id } });
    if (!row || row.email.toLowerCase() !== email || row.confirmed) {
      logger.info({ event: 'resend_noop', type, id, reason: !row ? 'no_row' : row.confirmed ? 'already' : 'email_mismatch' });
      return generic;
    }
    const e = donationConfirmationEmail({
      id: row.id,
      name: row.name,
      amount: row.amount,
      mode: row.mode,
      currency: row.currency,
      createdAt: row.createdAt,
      siteUrl: siteUrl(''),
    });
    sendEmail({ to: row.email, subject: e.subject, text: e.text, html: e.html })
      .catch((err) => logger.error({ err, event: 'email_send_threw', id: row.id }));
  }

  logger.info({ event: 'resend_sent', type, id });
  return generic;
}
