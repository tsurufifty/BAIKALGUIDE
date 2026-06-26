import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Reveal } from '@/components/motion/reveal';
import { RouteCard } from '@/components/route-card';
import { Link } from '@/i18n/navigation';
import { getRoutesByActivity } from '@/lib/api';

// Interest (mood) → route activityType filter.
const INTEREST_ACTIVITY: Record<string, string> = {
  adrenaline: 'active',
  soul: 'relax',
  culture: 'culture',
  content: 'nature',
};

type Props = { params: Promise<{ locale: string; interest: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(INTEREST_ACTIVITY).map((interest) => ({ locale, interest })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, interest } = await params;
  if (!INTEREST_ACTIVITY[interest]) return {};
  const t = await getTranslations({ locale, namespace: 'Interests' });
  return { title: t(`${interest}.title`), description: t(`${interest}.intro`) };
}

export default async function InterestHubPage({ params }: Props) {
  const { locale, interest } = await params;
  const activity = INTEREST_ACTIVITY[interest];
  if (!activity) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Interests');
  const routes = await getRoutesByActivity(locale as Locale, activity);

  return (
    <>
      <PageHeader title={t(`${interest}.title`)} subtitle={t(`${interest}.intro`)} />

      <Container className="pb-24">
        <h2 className="mb-8 font-display text-2xl font-bold text-primary">{t('routesHeading')}</h2>

        {routes.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route, i) => (
              <Reveal key={route.documentId} delay={i * 0.06}>
                <RouteCard route={route} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-foreground/15 bg-white/40 px-6 py-16 text-center text-muted">
            {t('empty')}
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/routes">
            <Button variant="outline">{t('allRoutes')}</Button>
          </Link>
          <Link href="/map">
            <Button variant="ghost">{t('exploreMap')}</Button>
          </Link>
        </div>
      </Container>
    </>
  );
}

export const revalidate = 300;
