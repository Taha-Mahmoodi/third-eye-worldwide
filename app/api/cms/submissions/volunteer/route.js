import { NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body?.name || !body?.email) {
    return NextResponse.json({ error: 'name and email required' }, { status: 400 });
  }
  const row = await prisma.volunteerSubmission.create({
    data: {
      name: String(body.name).slice(0, 200),
      email: String(body.email).slice(0, 200),
      role: body.role ? String(body.role).slice(0, 200) : null,
      skills: body.skills ? String(body.skills).slice(0, 500) : null,
      message: body.message ? String(body.message).slice(0, 2000) : null,
    },
  });
  return NextResponse.json({ ok: true, id: row.id });
}

export async function GET(req) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await prisma.volunteerSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(rows);
}
