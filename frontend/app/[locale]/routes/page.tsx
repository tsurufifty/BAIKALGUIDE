import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { altLanguages } from '@/lib/seo';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/page-header';
import { RoutesExplorer } from '@/components/routes-explorer';
import { getRoutes } from '@/lib/api';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RoutesPage' });
  return { title: t('title'), description: t('subtitle'), alternates: altLanguages('/routes') };
}

export default async function RoutesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('RoutesPage');
  const routes = await getRoutes(locale as Locale);

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Container className="pb-20">
        <RoutesExplorer routes={routes} />
      </Container>
    </>
  );
}

export const revalidate = 300;
