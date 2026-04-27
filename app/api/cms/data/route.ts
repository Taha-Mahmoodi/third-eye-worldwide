import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getContent, saveContent } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import type { SiteContent } from '@/lib/types';
import { CMS_MAX_PAYLOAD_BYTES } from '@/lib/constants';
import logger from '@/lib/logger';

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
  // Short browser/CDN cache so the public site can pull this endpoint
  // cheaply. `private` keeps CDNs from caching admin-personalised
  // responses; `max-age=60` is short enough that a publish-then-view
  // cycle doesn't feel stale to editors. The SWR window lets stale
  // responses serve instantly while a fresh fetch warms the cache.
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
    },
  });
}

export async function PUT(req: NextRequest) {
  const admin = await isAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
    );
  }

  // Count actual bytes from the body stream — Content-Length can be
  // spoofed (a hostile client can advertise 1 KB and stream 100 MB).
  // We bail out as soon as the running total exceeds the cap so we
  // never buffer the full hostile payload in memory.
  let rawBody: string;
  try {
    const reader = req.body?.getReader();
    if (!reader) return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > CMS_MAX_PAYLOAD_BYTES) {
        await reader.cancel();
        return NextResponse.json(
          { error: `Payload too large — max ${Math.round(CMS_MAX_PAYLOAD_BYTES / 1024)} KB.` },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const merged = new Uint8Array(totalBytes);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.byteLength;
    }
    rawBody = new TextDecoder().decode(merged);
  } catch {
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 });
  }

  let body: unknown;
  try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
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
  logger.info({ event: 'cms_published', author, via: admin.via });

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
  let revalidatedCount = 0;
  for (const path of [...ALL_ROUTES, ...slugRoutes, ...projectRoutes, ...seoRoutes]) {
    try {
      revalidatePath(path);
      revalidatedCount++;
    } catch (err) {
      // Don't fail the publish on a single bad route — but log so we
      // notice when a path consistently can't be revalidated. Per LOW-3.
      logger.warn({ event: 'revalidate_failed', path, err }, 'revalidatePath failed');
    }
  }

  // Return the actual number of paths that succeeded. Previous code
  // reported `ALL_ROUTES.length + slugRoutes.length` which was both
  // wrong (omitted projectRoutes + seoRoutes) and a lie if any path
  // threw inside the loop.
  return NextResponse.json({ ok: true, revalidated: revalidatedCount });
}
