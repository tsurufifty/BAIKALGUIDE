import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/page-header';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contacts' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Contacts');

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Container className="max-w-2xl pb-24">
        <div className="rounded-card bg-white p-8 shadow-sm ring-1 ring-foreground/5">
          <p className="leading-relaxed text-foreground/80">{t('body')}</p>
          <a
            href={`mailto:${t('email')}`}
            className="mt-6 inline-block font-medium text-accent underline underline-offset-4 hover:text-accent/80"
          >
            {t('email')}
          </a>
        </div>
      </Container>
    </>
  );
}
