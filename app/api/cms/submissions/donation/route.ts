import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { checkAsync, requestIp } from '@/lib/rate-limit';
import {
  ACCEPTED_CURRENCIES,
  type AcceptedCurrency,
  MIN_DONATION_AMOUNT,
  MAX_DONATION_AMOUNT,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';
import logger from '@/lib/logger';
import { isValidEmail } from '@/lib/validators';
import { isAllowedOrigin, tripsHoneypot } from '@/lib/csrf';
import { sendEmail } from '@/lib/email/send';
import { donationConfirmationEmail } from '@/lib/email/templates/confirm-donation';
import { siteUrl } from '@/lib/seo';

interface DonationBody {
  name?: unknown;
  email?: unknown;
  amount?: unknown;
  mode?: unknown;
  currency?: unknown;
  note?: unknown;
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    logger.warn({ event: 'csrf_blocked', ip: requestIp(req), origin: req.headers.get('origin') });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = requestIp(req);
  const rl = await checkAsync(`submit:donation:${ip}`, {
    capacity: RATE_LIMIT_MAX_REQUESTS,
    refillIntervalMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!rl.allowed) {
    logger.warn({ event: 'rate_limited', ip, endpoint: 'donation_submit' });
    return NextResponse.json(
      { error: 'Too many submissions — please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  let body: DonationBody;
  try { body = (await req.json()) as DonationBody; } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (tripsHoneypot(body)) {
    logger.info({ event: 'honeypot_tripped', ip, endpoint: 'donation_submit' });
    return NextResponse.json({ ok: true, id: 0 });
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const amountDollars = Number(body?.amount);
  const mode = typeof body?.mode === 'string' ? body.mode : '';

  if (!name || !email || !Number.isFinite(amountDollars) || !mode) {
    return NextResponse.json({ error: 'name, email, amount, mode required' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'email format looks invalid' }, { status: 400 });
  }
  if (!['monthly', 'once'].includes(mode)) {
    return NextResponse.json({ error: 'mode must be monthly or once' }, { status: 400 });
  }
  if (amountDollars < MIN_DONATION_AMOUNT || amountDollars > MAX_DONATION_AMOUNT) {
    return NextResponse.json(
      { error: `amount must be between ${MIN_DONATION_AMOUNT} and ${MAX_DONATION_AMOUNT}` },
      { status: 400 }
    );
  }

  // Store as integer cents to avoid IEEE-754 drift (e.g. $49.99 → 4999).
  // The DB column is now Int; conversions back to dollars happen at the
  // edges (email template, admin UI).
  const amountCents = Math.round(amountDollars * 100);

  // Currency: ISO 4217 allow-list. Anything off-list (or missing /
  // mistyped) becomes USD so Intl.NumberFormat in the email template
  // never sees a bogus code.
  const rawCurrency = typeof body.currency === 'string' ? body.currency.toUpperCase().trim() : 'USD';
  const currency: AcceptedCurrency = (ACCEPTED_CURRENCIES as readonly string[]).includes(rawCurrency)
    ? (rawCurrency as AcceptedCurrency)
    : 'USD';

  try {
    const row = await prisma.donationSubmission.create({
      data: {
        name: name.slice(0, 200),
        email: email.toLowerCase().slice(0, 200),
        amount: amountCents,
        mode,
        currency,
        note: body.note ? String(body.note).slice(0, 1000) : null,
      },
    });
    logger.info({
      event: 'donation_submitted',
      id: row.id,
      ip,
      amountCents,
      amountDollars,
      mode,
      currency: row.currency,
    });

    // MED-8: send the confirmation email. Fail-open — admin sees the
    // row as `confirmed: false` rather than rejecting the submitter.
    // Convert cents back to dollars for the human-facing template.
    const email_ = donationConfirmationEmail({
      id: row.id,
      name: row.name,
      amount: row.amount / 100,
      mode: row.mode,
      currency: row.currency,
      createdAt: row.createdAt,
      siteUrl: siteUrl(''),
    });
    sendEmail({ to: row.email, subject: email_.subject, text: email_.text, html: email_.html })
      .catch((err) => logger.error({ err, event: 'email_send_threw', id: row.id }));

    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    logger.error({ err, event: 'donation_submit_failed', ip }, 'donation create failed');
    return NextResponse.json({ error: 'Server error — please try again later.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
    );
  }
  // MED-8: by default only return rows the user confirmed via email.
  // Admin can pass `?all=true` to see unconfirmed (e.g., to debug a
  // delivery issue or view spam).
  const url = new URL(req.url);
  const includeAll = url.searchParams.get('all') === 'true';
  const where = includeAll ? {} : { confirmed: true };
  const rows = await prisma.donationSubmission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json(rows);
}
