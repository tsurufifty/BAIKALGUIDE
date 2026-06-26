import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { altLanguages } from '@/lib/seo';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/page-header';
import { MapExplorer } from '@/components/map/map-explorer';
import { getLocations } from '@/lib/api';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MapPage' });
  return { title: t('title'), description: t('subtitle'), alternates: altLanguages('/map') };
}

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('MapPage');
  const locations = await getLocations(locale as Locale);

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Container className="pb-24">
        <MapExplorer locations={locations} />
      </Container>
    </>
  );
}

export const revalidate = 300;
