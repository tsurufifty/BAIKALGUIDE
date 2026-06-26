import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ru', 'en'],
  defaultLocale: 'ru',
  // Always prefix the URL with the locale: /ru/routes, /en/routes
  localePrefix: 'always',
  // Persist the user's choice (next-intl writes a NEXT_LOCALE cookie)
  localeCookie: true,
});

export type Locale = (typeof routing.locales)[number];
