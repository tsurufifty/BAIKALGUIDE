import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';
import { getRoutes, getUpcomingEvents, getArticles } from '@/lib/api';

const STATIC_PATHS = [
  '',
  '/routes',
  '/map',
  '/events',
  '/music',
  '/about',
  '/faq',
  '/contacts',
  '/getting-there',
  '/transport',
  '/safety',
  '/partners',
  '/feedback',
  '/eco',
  '/privacy',
  '/personal-data',
  '/interests/adrenaline',
  '/interests/soul',
  '/interests/culture',
  '/interests/content',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages — identical paths across locales, with hreflang alternates.
  for (const path of STATIC_PATHS) {
    const languages = Object.fromEntries(
      routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
    );
    entries.push({
      url: `${SITE_URL}/${routing.defaultLocale}${path}`,
      lastModified: new Date(),
      alternates: { languages },
    });
  }

  // Dynamic content — slugs are localized, listed per locale.
  for (const locale of routing.locales) {
    const [routes, events, articles] = await Promise.all([
      getRoutes(locale),
      getUpcomingEvents(locale),
      getArticles(locale),
    ]);
    for (const r of routes) entries.push({ url: `${SITE_URL}/${locale}/routes/${r.slug}` });
    for (const e of events) entries.push({ url: `${SITE_URL}/${locale}/events/${e.slug}` });
    for (const a of articles) entries.push({ url: `${SITE_URL}/${locale}/music/${a.slug}` });
  }

  return entries;
}
