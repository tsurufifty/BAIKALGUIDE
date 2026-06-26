import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Serwist generates the service worker from app/sw.ts.
// Disabled in development because Next.js 16 dev uses Turbopack,
// which Serwist's SW build does not support yet (see PROJECT_MEMORY.md).
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

const STRAPI_HOST = process.env.NEXT_PUBLIC_STRAPI_IMAGE_HOST ?? 'localhost';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/:all*(woff2|ttf|otf|png|jpg|jpeg|webp|avif|svg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // In dev the Next image optimizer (Node) may resolve `localhost` to IPv6
    // while Strapi listens on IPv4, breaking local images. Serve originals
    // directly in dev; production keeps optimization.
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: STRAPI_HOST,
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default withSerwist(withNextIntl(nextConfig));
