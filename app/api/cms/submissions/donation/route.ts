import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { checkAsync, requestIp } from '@/lib/rate-limit';
import {
  MIN_DONATION_AMOUNT,
  MAX_DONATION_AMOUNT,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';
import logger from '@/lib/logger';
import { isValidEmail } from '@/lib/validators';
import { isAllowedOrigin, tripsHoneypot } from '@/lib/csrf';

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
  const amount = Number(body?.amount);
  const mode = typeof body?.mode === 'string' ? body.mode : '';

  if (!name || !email || !Number.isFinite(amount) || !mode) {
    return NextResponse.json({ error: 'name, email, amount, mode required' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'email format looks invalid' }, { status: 400 });
  }
  if (!['monthly', 'once'].includes(mode)) {
    return NextResponse.json({ error: 'mode must be monthly or once' }, { status: 400 });
  }
  if (amount < MIN_DONATION_AMOUNT || amount > MAX_DONATION_AMOUNT) {
    return NextResponse.json(
      { error: `amount must be between ${MIN_DONATION_AMOUNT} and ${MAX_DONATION_AMOUNT}` },
      { status: 400 }
    );
  }

  try {
    const row = await prisma.donationSubmission.create({
      data: {
        name: name.slice(0, 200),
        email: email.toLowerCase().slice(0, 200),
        amount,
        mode,
        currency: body.currency ? String(body.currency).slice(0, 8) : 'USD',
        note: body.note ? String(body.note).slice(0, 1000) : null,
      },
    });
    logger.info({
      event: 'donation_submitted',
      id: row.id,
      ip,
      amount,
      mode,
      currency: row.currency,
    });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    logger.error({ err, event: 'donation_submit_failed', ip }, 'donation create failed');
    return NextResponse.json({ error: 'Server error — please try again later.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await prisma.donationSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(rows);
}
