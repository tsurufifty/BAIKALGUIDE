import type { Locale } from '@/i18n/routing';
import { strapiFetch } from './strapi';
import type {
  RouteEntry,
  EventEntry,
  ArticleEntry,
  ArtistEntry,
  LocationEntry,
  StrapiMedia,
} from './types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const MEDIA_BASE = STRAPI_URL.replace(/\/api\/?$/, '');

/** Resolve a (possibly relative) Strapi media URL to an absolute one. */
export function getMediaUrl(media?: StrapiMedia | null): string | null {
  if (!media?.url) return null;
  return media.url.startsWith('http') ? media.url : `${MEDIA_BASE}${media.url}`;
}

async function safeList<T>(promise: Promise<{ data: T[] }>, label: string): Promise<T[]> {
  try {
    const res = await promise;
    return res.data ?? [];
  } catch (err) {
    // Graceful degradation: pages still render with empty sections.
    // Logged at warn level so the Next dev overlay does not flag it as an error.
    console.warn(
      `[api] ${label}: Strapi unreachable (${(err as Error).message}). ` +
        'Returning []. Is the backend running and NEXT_PUBLIC_STRAPI_URL correct?',
    );
    return [];
  }
}

async function safeOne<T>(promise: Promise<{ data: T[] }>, label: string): Promise<T | null> {
  const list = await safeList(promise, label);
  return list[0] ?? null;
}

const bySlug = (slug: string): Record<string, string> => ({ 'filters[slug][$eq]': slug });

/* ---------- Lists ---------- */

export function getRoutes(locale: Locale, limit?: number): Promise<RouteEntry[]> {
  return safeList(
    strapiFetch<RouteEntry[]>('routes', {
      locale,
      populate: ['cover', 'ratings'],
      sort: 'createdAt:desc',
      ...(limit ? { pageSize: limit } : {}),
    }),
    'getRoutes',
  );
}

/** Routes filtered by a single activity type (used by the interest hubs). */
export function getRoutesByActivity(
  locale: Locale,
  activityType: string,
  limit?: number,
): Promise<RouteEntry[]> {
  return safeList(
    strapiFetch<RouteEntry[]>('routes', {
      locale,
      populate: ['cover', 'ratings'],
      filters: { 'filters[activityType][$eq]': activityType },
      sort: 'createdAt:desc',
      ...(limit ? { pageSize: limit } : {}),
    }),
    'getRoutesByActivity',
  );
}

/** Average rating (1–5) and count from a route's populated ratings. */
export function routeRating(route: RouteEntry): { average: number; count: number } {
  const values = (route.ratings ?? []).map((r) => r.value).filter((v) => typeof v === 'number');
  if (values.length === 0) return { average: 0, count: 0 };
  const sum = values.reduce((a, b) => a + b, 0);
  return { average: Math.round((sum / values.length) * 10) / 10, count: values.length };
}

export function getUpcomingEvents(locale: Locale, limit?: number): Promise<EventEntry[]> {
  return safeList(
    strapiFetch<EventEntry[]>('events', {
      locale,
      populate: ['cover', 'image'],
      sort: 'date:asc',
      ...(limit ? { pageSize: limit } : {}),
    }),
    'getUpcomingEvents',
  );
}

export function getArticles(locale: Locale, limit?: number): Promise<ArticleEntry[]> {
  return safeList(
    strapiFetch<ArticleEntry[]>('articles', {
      locale,
      populate: ['cover'],
      sort: 'publishedDate:desc',
      ...(limit ? { pageSize: limit } : {}),
    }),
    'getArticles',
  );
}

export function getArtists(locale: Locale, limit?: number): Promise<ArtistEntry[]> {
  return safeList(
    strapiFetch<ArtistEntry[]>('artists', {
      locale,
      populate: ['avatar'],
      ...(limit ? { pageSize: limit } : {}),
    }),
    'getArtists',
  );
}

export function getLocations(locale: Locale): Promise<LocationEntry[]> {
  return safeList(
    strapiFetch<LocationEntry[]>('locations', {
      locale,
      populate: ['cover', 'coordinates'],
    }),
    'getLocations',
  );
}

/* ---------- Single by slug ---------- */

export function getRouteBySlug(locale: Locale, slug: string): Promise<RouteEntry | null> {
  return safeOne(
    strapiFetch<RouteEntry[]>('routes', {
      locale,
      filters: bySlug(slug),
      populate: ['cover', 'gallery', 'coordinates', 'locations', 'ratings', 'seo'],
    }),
    'getRouteBySlug',
  );
}

export function getEventBySlug(locale: Locale, slug: string): Promise<EventEntry | null> {
  return safeOne(
    strapiFetch<EventEntry[]>('events', {
      locale,
      filters: bySlug(slug),
      populate: ['cover', 'image', 'coordinates', 'location', 'seo'],
    }),
    'getEventBySlug',
  );
}

export function getArticleBySlug(locale: Locale, slug: string): Promise<ArticleEntry | null> {
  return safeOne(
    strapiFetch<ArticleEntry[]>('articles', {
      locale,
      filters: bySlug(slug),
      populate: ['cover', 'artists', 'seo'],
    }),
    'getArticleBySlug',
  );
}
