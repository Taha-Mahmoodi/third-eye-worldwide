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
  // The legacy static SPA at public/admin/ has been superseded by the
  // Next.js dashboard at app/admin/(dashboard)/. The previous rewrite
  // sending /admin → /admin/index.html is removed so the new dashboard
  // route handles requests. The static directory itself stays in place
  // until CMS_ROADMAP CMS-9 (after PR #4 ports the export endpoint).
};

export default nextConfig;
