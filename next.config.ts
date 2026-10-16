import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Fotografije se do prenosa (npm run slike) nalagajo s stare strani in jih Next stisne v AVIF/WebP.
    remotePatterns: [{ protocol: 'https', hostname: 'www.hifa.si', pathname: '/**' }],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 2048],
    imageSizes: [96, 160, 256, 384],
  },
  // Stari URL-ji ostanejo živi (SEO). Prvi dve sta bili na stari strani pokvarjeni povezavi.
  async redirects() {
    return [
      { source: '/konstrukcije', destination: '/storitve', permanent: true },
      { source: '/galerije/pravno-obvestilo', destination: '/pravno-obvestilo', permanent: true },
      { source: '/galerije/sofinanciranje', destination: '/sofinanciranje', permanent: true },
      { source: '/galerije/ostalo-galerija', destination: '/galerije/ostalo', permanent: true },
    ];
  },
  async headers() {
    return [
      { source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
