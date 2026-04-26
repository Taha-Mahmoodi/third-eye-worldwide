import { siteUrl } from '@/lib/seo';

/*
 * robots.txt convention (Next 14): exported default returns the robots
 * config object. Next renders the text file at /robots.txt.
 *
 * Public site: crawl everything except /admin and the raw API.
 * Sitemap link points the bots at /sitemap.xml (also dynamic).
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: siteUrl('/sitemap.xml'),
    host: siteUrl('/'),
  };
}
