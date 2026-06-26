import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { altLanguages } from '@/lib/seo';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/page-header';
import { EventsCalendar } from '@/components/events-calendar';
import { getUpcomingEvents } from '@/lib/api';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'EventsPage' });
  return { title: t('title'), description: t('subtitle'), alternates: altLanguages('/events') };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('EventsPage');
  const events = await getUpcomingEvents(locale as Locale);

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Container className="pb-20">
        {events.length > 0 ? (
          <EventsCalendar events={events} />
        ) : (
          <div className="rounded-card border border-dashed border-foreground/15 bg-white/40 px-6 py-20 text-center text-muted">
            {t('empty')}
          </div>
        )}
      </Container>
    </>
  );
}

export const revalidate = 300;
