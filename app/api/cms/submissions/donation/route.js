import { NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body?.name || !body?.email || typeof body?.amount !== 'number' || !body?.mode) {
    return NextResponse.json({ error: 'name, email, amount, mode required' }, { status: 400 });
  }
  if (!['monthly', 'once'].includes(body.mode)) {
    return NextResponse.json({ error: 'mode must be monthly or once' }, { status: 400 });
  }
  const row = await prisma.donationSubmission.create({
    data: {
      name: String(body.name).slice(0, 200),
      email: String(body.email).slice(0, 200),
      amount: Math.max(0, Number(body.amount)),
      mode: body.mode,
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
