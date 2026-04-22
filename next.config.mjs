/** @type {import('next').NextConfig} */
const nextConfig = {
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
