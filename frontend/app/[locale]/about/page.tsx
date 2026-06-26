import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/page-header';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return { title: t('title'), description: t('lead') };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('About');
  const paragraphs = t.raw('body') as string[];

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('lead')} />
      <Container className="max-w-3xl space-y-5 pb-24 text-lg leading-relaxed text-foreground/80">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </Container>
    </>
  );
}
