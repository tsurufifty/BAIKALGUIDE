import type { RouteEntry, EventEntry, ArticleEntry, SeoComponent } from './types';
import { getMediaUrl } from './api';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://baikal-guide.ru';

type Json = Record<string, unknown>;

export function websiteJsonLd(name: string, description: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url: SITE_URL,
    inLanguage: ['ru', 'en'],
  };
}

export function organizationJsonLd(name: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: SITE_URL,
  };
}

export function routeJsonLd(route: RouteEntry, url: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: route.title,
    description: route.seo?.metaDescription ?? undefined,
    url,
    image: getMediaUrl(route.cover) ?? undefined,
    touristType: 'youth',
  };
}

export function eventJsonLd(event: EventEntry, url: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.date,
    endDate: event.endDate ?? undefined,
    url,
    image: getMediaUrl(event.cover ?? event.image) ?? undefined,
    location: event.venue ? { '@type': 'Place', name: event.venue } : undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  };
}

export function articleJsonLd(article: ArticleEntry, url: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.publishedDate ?? article.publishedAt ?? undefined,
    url,
    image: getMediaUrl(article.cover) ?? undefined,
    author: article.artists?.map((a) => ({ '@type': 'Person', name: a.name })),
  };
}

export function faqJsonLd(seo?: SeoComponent | null): Json | null {
  if (!seo?.faq?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function faqJsonLdFromItems(items: { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function altLanguages(path: string) {
  return {
    languages: {
      ru: `${SITE_URL}/ru${path}`,
      en: `${SITE_URL}/en${path}`,
    } as Record<string, string>,
  };
}
