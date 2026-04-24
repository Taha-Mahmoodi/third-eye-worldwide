/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output: Next emits .next/standalone with a tiny node server
  // + the minimal node_modules subset. Essential for slim Docker images;
  // harmless for vercel/netlify which ignore it.
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    return [
      // /admin → static CMS dashboard (served from public/admin/index.html)
      { source: '/admin', destination: '/admin/index.html' },
    ];
  },
};

export default nextConfig;
