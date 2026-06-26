import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/page-header';
import { FeedbackForm } from '@/components/feedback-form';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Feedback' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function FeedbackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Feedback');

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Container className="max-w-2xl pb-24">
        <FeedbackForm />
      </Container>
    </>
  );
}
