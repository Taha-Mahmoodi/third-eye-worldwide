/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output: Next emits .next/standalone with a tiny node server
  // + the minimal node_modules subset. Essential for slim Docker images;
  // harmless for vercel/netlify which ignore it.
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Stock photography for hero/section imagery.
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Production site itself, e.g. for image-of-image references in
      // CMS content where the URL was authored as absolute.
      { protocol: 'https', hostname: 'www.thirdeyeworldwide.org' },
      { protocol: 'https', hostname: 'thirdeyeworldwide.org' },
      // Self-hosted MinIO on the VPS — replace the host below with
      // the real subdomain you point at the MinIO API. The bucket
      // path lives below this hostname (path-style URLs).
      { protocol: 'https', hostname: 'media.your-domain.com' },
    ],
  },
  // No rewrites. The earlier `/admin → /admin/index.html` rewrite
  // (and the public/admin/ static SPA it pointed at) have been
  // removed in favour of the Next.js dashboard at
  // app/admin/(dashboard)/. CMS_ROADMAP CMS-9 closed.
};

export default nextConfig;
