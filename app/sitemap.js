import { getContent, visibleSorted } from '@/lib/cms/db';
import { siteUrl } from '@/lib/seo';

/*
 * Dynamic sitemap.xml. Lists the concrete routes plus any visible
 * custom pages the CMS has defined. Uses Next's built-in sitemap
 * convention — no manual XML needed.
 *
 * Revalidates every 10 minutes so CMS publishes propagate without a
 * redeploy. The `/api/cms/data` PUT handler already calls
 * revalidatePath('/sitemap.xml') via its ALL_ROUTES list; this just
 * caps staleness.
 */
export const revalidate = 600;

const FIXED = [
  { path: '/',            priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about',       priority: 0.8, changeFrequency: 'monthly' },
  { path: '/projects',    priority: 0.9, changeFrequency: 'monthly' },
  { path: '/donate',      priority: 0.9, changeFrequency: 'monthly' },
  { path: '/media',       priority: 0.7, changeFrequency: 'weekly' },
  { path: '/documents',   priority: 0.7, changeFrequency: 'weekly' },
  { path: '/volunteers',  priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog-detail', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/story-detail',priority: 0.6, changeFrequency: 'weekly' },
];

export default async function sitemap() {
  const now = new Date();
  const entries = FIXED.map((r) => ({
    url: siteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    const content = await getContent();
    const pages = visibleSorted(content?.pages || []);
    for (const p of pages) {
      if (!p?.slug) continue;
      entries.push({
        url: siteUrl('/' + p.slug),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  } catch { /* DB unavailable → ship the fixed routes anyway */ }

  return entries;
}
