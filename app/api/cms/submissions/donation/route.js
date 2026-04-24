import { NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { check, requestIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Sanity bounds on donation amount. Values outside this window are almost
// always typos or abuse. Real-money processing (Stripe etc.) would enforce
// its own limits too.
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;

export async function POST(req) {
  const ip = requestIp(req);
  const rl = check(`submit:donation:${ip}`, { capacity: 20, refillIntervalMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions — please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const amount = Number(body?.amount);
  const mode = body?.mode;

  if (!name || !email || !Number.isFinite(amount) || !mode) {
    return NextResponse.json({ error: 'name, email, amount, mode required' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'email format looks invalid' }, { status: 400 });
  }
  if (!['monthly', 'once'].includes(mode)) {
    return NextResponse.json({ error: 'mode must be monthly or once' }, { status: 400 });
  }
  if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return NextResponse.json(
      { error: `amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}` },
      { status: 400 }
    );
  }

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
  return NextResponse.json({ ok: true, id: row.id });
}

export async function GET(req) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await prisma.donationSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(rows);
}
