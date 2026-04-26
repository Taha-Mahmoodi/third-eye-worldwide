import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getContent, saveContent } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import type { SiteContent } from '@/lib/types';
import { CMS_MAX_PAYLOAD_BYTES } from '@/lib/constants';

interface CmsItem { slug?: string; visible?: boolean }

export const dynamic = 'force-dynamic';

// Revalidation target list — kept in sync with the concrete routes plus
// a catch-all for any `[slug]` dynamic pages managed from the CMS.
const ALL_ROUTES = [
  '/', '/about', '/projects', '/donate', '/media',
  '/documents', '/volunteers', '/blog-detail', '/story-detail',
];

export async function GET() {
  const data = await getContent();
  if (!data) return NextResponse.json({ error: 'No content' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const declaredSize = Number(req.headers.get('content-length') || 0);
  if (Number.isFinite(declaredSize) && declaredSize > CMS_MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { error: `Payload too large — max ${Math.round(CMS_MAX_PAYLOAD_BYTES / 1024)} KB.` },
      { status: 413 }
    );
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Expected object' }, { status: 400 });
  const data = body as SiteContent & {
    site?: unknown;
    home?: unknown;
    projects?: { items?: CmsItem[] };
    programs?: { items?: CmsItem[] };
  };

  // Sanity floor: a valid content document must at minimum describe the site
  // and include the home page — refuse to silently wipe the DB with an empty
  // or malformed payload.
  if (!data.site || !data.home) {
    return NextResponse.json(
      { error: 'Refusing to save: payload is missing required top-level sections (site, home).' },
      { status: 422 }
    );
  }

  const author = admin.user?.email || admin.user?.name || req.headers.get('x-cms-author') || null;
  const note = req.headers.get('x-cms-note') || null;
  await saveContent(data, { author, note });

  // Revalidate fixed routes + any user-defined /[slug] pages +
  // each project detail at /projects/<slug> + the sitemap
  // (so SEO crawlers see CMS updates immediately).
  const slugRoutes = Array.isArray(data.pages)
    ? (data.pages as CmsItem[]).filter((p) => p?.slug && p?.visible !== false).map((p) => '/' + p.slug)
    : [];
  const projectItems = data.projects?.items || data.programs?.items || [];
  const projectRoutes = Array.isArray(projectItems)
    ? projectItems.filter((p: CmsItem) => p?.slug && p?.visible !== false).map((p: CmsItem) => '/projects/' + p.slug)
    : [];
  const seoRoutes = ['/sitemap.xml', '/robots.txt'];
  for (const path of [...ALL_ROUTES, ...slugRoutes, ...projectRoutes, ...seoRoutes]) {
    try { revalidatePath(path); } catch {}
  }

  return NextResponse.json({ ok: true, revalidated: ALL_ROUTES.length + slugRoutes.length });
}
