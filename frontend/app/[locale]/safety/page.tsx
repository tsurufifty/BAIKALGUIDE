import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { InfoSections, type InfoSection } from '@/components/info-sections';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Safety' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function SafetyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Safety');
  const sections = t.raw('sections') as InfoSection[];

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <InfoSections sections={sections} />
    </>
  );
}
