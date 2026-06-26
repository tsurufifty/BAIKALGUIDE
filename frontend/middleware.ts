import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except API, Next internals, the service worker,
  // manifest, and files with an extension (static assets).
  matcher: ['/((?!api|_next|_vercel|sw.js|manifest.webmanifest|.*\\..*).*)'],
};
