import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { check, requestIp } from '@/lib/rate-limit';

interface VolunteerBody {
  name?: unknown;
  email?: unknown;
  role?: unknown;
  skills?: unknown;
  message?: unknown;
}

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  const rl = check(`submit:volunteer:${ip}`, { capacity: 20, refillIntervalMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions — please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  let body: VolunteerBody;
  try { body = (await req.json()) as VolunteerBody; } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!name || !email) {
    return NextResponse.json({ error: 'name and email required' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'email format looks invalid' }, { status: 400 });
  }

  const row = await prisma.volunteerSubmission.create({
    data: {
      name: name.slice(0, 200),
      email: email.toLowerCase().slice(0, 200),
      role: body.role ? String(body.role).slice(0, 200) : null,
      skills: body.skills ? String(body.skills).slice(0, 500) : null,
      message: body.message ? String(body.message).slice(0, 2000) : null,
    },
  });
  return NextResponse.json({ ok: true, id: row.id });
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await prisma.volunteerSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(rows);
}
