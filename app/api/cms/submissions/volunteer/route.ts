import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { check, requestIp } from '@/lib/rate-limit';
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@/lib/constants';
import logger from '@/lib/logger';
import { isValidEmail } from '@/lib/validators';
import { isAllowedOrigin, tripsHoneypot } from '@/lib/csrf';

interface VolunteerBody {
  name?: unknown;
  email?: unknown;
  role?: unknown;
  skills?: unknown;
  message?: unknown;
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // CSRF: reject cross-origin POSTs outright (browsers always send Origin
  // on form submissions; missing-Origin is allowed for server-side curl
  // scripts). Per MED-1.
  if (!isAllowedOrigin(req)) {
    logger.warn({ event: 'csrf_blocked', ip: requestIp(req), origin: req.headers.get('origin') });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = requestIp(req);
  const rl = check(`submit:volunteer:${ip}`, {
    capacity: RATE_LIMIT_MAX_REQUESTS,
    refillIntervalMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!rl.allowed) {
    logger.warn({ event: 'rate_limited', ip, endpoint: 'volunteer_submit' });
    return NextResponse.json(
      { error: 'Too many submissions — please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  let body: VolunteerBody;
  try { body = (await req.json()) as VolunteerBody; } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // Honeypot: a hidden form field a real user can't see. If a bot
  // filled it in, silently drop the request and pretend success so
  // the bot moves on without retrying.
  if (tripsHoneypot(body)) {
    logger.info({ event: 'honeypot_tripped', ip, endpoint: 'volunteer_submit' });
    return NextResponse.json({ ok: true, id: 0 });
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!name || !email) {
    return NextResponse.json({ error: 'name and email required' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'email format looks invalid' }, { status: 400 });
  }

  try {
    const row = await prisma.volunteerSubmission.create({
      data: {
        name: name.slice(0, 200),
        email: email.toLowerCase().slice(0, 200),
        role: body.role ? String(body.role).slice(0, 200) : null,
        skills: body.skills ? String(body.skills).slice(0, 500) : null,
        message: body.message ? String(body.message).slice(0, 2000) : null,
      },
    });
    logger.info({ event: 'volunteer_submitted', id: row.id, ip, email: row.email });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    logger.error({ err, event: 'volunteer_submit_failed', ip }, 'volunteer create failed');
    return NextResponse.json({ error: 'Server error — please try again later.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await prisma.volunteerSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(rows);
}
