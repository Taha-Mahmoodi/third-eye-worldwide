import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getContent, saveContent } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';

export const dynamic = 'force-dynamic';

// Revalidation target list — kept in sync with the concrete routes plus
// a catch-all for any `[slug]` dynamic pages managed from the CMS.
const ALL_ROUTES = [
  '/', '/about', '/programs', '/donate', '/media',
  '/documents', '/volunteers', '/blog-detail', '/story-detail',
];

export async function GET() {
  const data = await getContent();
  if (!data) return NextResponse.json({ error: 'No content' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req) {
  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Expected object' }, { status: 400 });

  const author = admin.user?.email || admin.user?.name || req.headers.get('x-cms-author') || null;
  const note = req.headers.get('x-cms-note') || null;
  await saveContent(body, { author, note });

  // Revalidate fixed routes + any user-defined /[slug] pages.
  const slugRoutes = Array.isArray(body.pages)
    ? body.pages.filter((p) => p?.slug && p?.visible !== false).map((p) => '/' + p.slug)
    : [];
  for (const path of [...ALL_ROUTES, ...slugRoutes]) {
    try { revalidatePath(path); } catch {}
  }

  return NextResponse.json({ ok: true, revalidated: ALL_ROUTES.length + slugRoutes.length });
}
