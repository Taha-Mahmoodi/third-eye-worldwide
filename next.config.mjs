/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export. `next build` produces an ./out directory that can be
  // served by any static host (GitHub Pages, Netlify, Cloudflare Pages, S3
  // + CloudFront, a plain Nginx box). See STATIC-DEPLOY.md.
  output: 'export',

  // Static hosts don't run Next's image optimizer, so serve raw URLs.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // Append a trailing slash so every route maps to a directory with an
  // index.html (e.g. /projects/te/index.html) — maximises compatibility
  // with dumb static hosts that don't rewrite extensionless URLs.
  trailingSlash: true,

  reactStrictMode: true,
};

export default nextConfig;
