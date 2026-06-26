import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/page-header';
import { JsonLd } from '@/components/json-ld';
import { faqJsonLdFromItems } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };
type QA = { q: string; a: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Faq' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Faq');
  const items = t.raw('items') as QA[];

  return (
    <>
      <JsonLd data={faqJsonLdFromItems(items)} />
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Container className="max-w-3xl space-y-4 pb-24">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-card bg-white p-6 shadow-sm ring-1 ring-foreground/5"
          >
            <summary className="cursor-pointer list-none font-display font-semibold text-foreground marker:hidden">
              {item.q}
            </summary>
            <p className="mt-3 leading-relaxed text-foreground/75">{item.a}</p>
          </details>
        ))}
      </Container>
    </>
  );
}
