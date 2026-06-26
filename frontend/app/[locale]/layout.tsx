import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Montserrat, Manrope } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CookieBanner } from '@/components/cookie-banner';
import { AuthProvider } from '@/context/auth-context';
import { JsonLd } from '@/components/json-ld';
import { websiteJsonLd, organizationJsonLd, SITE_URL } from '@/lib/seo';
import '../globals.css';

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('siteName'), template: `%s — ${t('siteName')}` },
    description: t('defaultDescription'),
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, statusBarStyle: 'default', title: t('siteName') },
    alternates: { languages: { ru: '/ru', en: '/en' } },
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      locale,
      title: t('siteName'),
      description: t('defaultDescription'),
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Meta' });

  return (
    <html lang={locale} className={`${montserrat.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <AuthProvider>
            <JsonLd data={websiteJsonLd(t('siteName'), t('defaultDescription'))} />
            <JsonLd data={organizationJsonLd(t('siteName'))} />
            <Navbar />
            <main className="flex-1 pt-16 md:pt-20">{children}</main>
            <Footer />
            <CookieBanner />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
