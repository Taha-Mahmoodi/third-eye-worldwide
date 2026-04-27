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
      // Add the image hosting CDN hostname here once one is wired in
      // (Cloudinary / Uploadcare / S3 + CloudFront, etc).
      // { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // No rewrites. The earlier `/admin → /admin/index.html` rewrite
  // (and the public/admin/ static SPA it pointed at) have been
  // removed in favour of the Next.js dashboard at
  // app/admin/(dashboard)/. CMS_ROADMAP CMS-9 closed.
};

export default nextConfig;
