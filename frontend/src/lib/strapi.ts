import type { Locale } from '@/i18n/routing';

const PUBLIC_STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
// On the server (SSR / route handlers) we may need a different, internal URL
// that the browser cannot resolve — e.g. the Docker service name
// `http://backend:1337`. In the browser we always use the public URL.
const STRAPI_URL =
  typeof window === 'undefined'
    ? process.env.STRAPI_INTERNAL_URL ?? PUBLIC_STRAPI_URL
    : PUBLIC_STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

/** Shape of Strapi 5 REST responses. */
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiQuery {
  locale?: Locale;
  /** LHS bracket filters, e.g. { 'filters[slug][$eq]': 'baikal' } */
  filters?: Record<string, string>;
  populate?: string | string[];
  sort?: string | string[];
  page?: number;
  pageSize?: number;
  status?: 'published' | 'draft';
}

function buildSearchParams(query: StrapiQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.locale) params.set('locale', query.locale);
  if (query.status) params.set('status', query.status);
  if (query.page) params.set('pagination[page]', String(query.page));
  if (query.pageSize) params.set('pagination[pageSize]', String(query.pageSize));

  if (query.populate) {
    const populate = Array.isArray(query.populate)
      ? query.populate
      : [query.populate];
    populate.forEach((field, i) => params.set(`populate[${i}]`, field));
  }

  if (query.sort) {
    const sort = Array.isArray(query.sort) ? query.sort : [query.sort];
    sort.forEach((field, i) => params.set(`sort[${i}]`, field));
  }

  if (query.filters) {
    for (const [key, value] of Object.entries(query.filters)) {
      params.set(key, value);
    }
  }

  return params;
}

export async function strapiFetch<T>(
  endpoint: string,
  query: StrapiQuery = {},
  init: RequestInit = {},
): Promise<StrapiResponse<T>> {
  const params = buildSearchParams(query);
  const qs = params.toString();
  const url = `${STRAPI_URL}/api/${endpoint}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      ...init.headers,
    },
    // ISR-style caching; tune per collection in later stages.
    next: { revalidate: 60, ...(init as { next?: object }).next },
  });

  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText} (${endpoint})`);
  }

  return (await res.json()) as StrapiResponse<T>;
}
