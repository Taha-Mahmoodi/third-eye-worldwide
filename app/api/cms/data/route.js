import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getContent, saveContent } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';

export const dynamic = 'force-dynamic';

// Revalidation target list — kept in sync with the concrete routes plus
// a catch-all for any `[slug]` dynamic pages managed from the CMS.
const ALL_ROUTES = [
  '/', '/about', '/projects', '/donate', '/media',
  '/documents', '/volunteers', '/blog-detail', '/story-detail',
];

// Hard ceiling on the CMS publish payload. The content doc is small in
// practice (~50 KB). 2 MB leaves ample headroom for images-in-JSON while
// preventing a rogue payload from stalling the server.
const MAX_PUT_BYTES = 2 * 1024 * 1024;

export async function GET() {
  const data = await getContent();
  if (!data) return NextResponse.json({ error: 'No content' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req) {
  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const declaredSize = Number(req.headers.get('content-length') || 0);
  if (Number.isFinite(declaredSize) && declaredSize > MAX_PUT_BYTES) {
    return NextResponse.json(
      { error: `Payload too large — max ${Math.round(MAX_PUT_BYTES / 1024)} KB.` },
      { status: 413 }
    );
  }

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Expected object' }, { status: 400 });

  // Sanity floor: a valid content document must at minimum describe the site
  // and include the home page — refuse to silently wipe the DB with an empty
  // or malformed payload.
  if (!body.site || !body.home) {
    return NextResponse.json(
      { error: 'Refusing to save: payload is missing required top-level sections (site, home).' },
      { status: 422 }
    );
  }

  const author = admin.user?.email || admin.user?.name || req.headers.get('x-cms-author') || null;
  const note = req.headers.get('x-cms-note') || null;
  await saveContent(body, { author, note });

  // Revalidate fixed routes + any user-defined /[slug] pages +
  // each project detail at /projects/<slug> + the sitemap
  // (so SEO crawlers see CMS updates immediately).
  const slugRoutes = Array.isArray(body.pages)
    ? body.pages.filter((p) => p?.slug && p?.visible !== false).map((p) => '/' + p.slug)
    : [];
  const projectItems = body?.projects?.items || body?.programs?.items || [];
  const projectRoutes = Array.isArray(projectItems)
    ? projectItems.filter((p) => p?.slug && p?.visible !== false).map((p) => '/projects/' + p.slug)
    : [];
  const seoRoutes = ['/sitemap.xml', '/robots.txt'];
  for (const path of [...ALL_ROUTES, ...slugRoutes, ...projectRoutes, ...seoRoutes]) {
    try { revalidatePath(path); } catch {}
  }

  return NextResponse.json({ ok: true, revalidated: ALL_ROUTES.length + slugRoutes.length });
}
