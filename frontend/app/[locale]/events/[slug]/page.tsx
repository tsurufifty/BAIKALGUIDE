import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations, getLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { BlockContent } from '@/components/block-content';
import { ShareButtons } from '@/components/share-buttons';
import { getEventBySlug, getMediaUrl } from '@/lib/api';
import { JsonLd } from '@/components/json-ld';
import { eventJsonLd, SITE_URL } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventBySlug(locale as Locale, slug);
  if (!event) return {};
  return {
    title: event.seo?.metaTitle ?? event.title,
    description: event.seo?.metaDescription ?? undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const event = await getEventBySlug(locale as Locale, slug);
  if (!event) notFound();

  const t = await getTranslations('EventDetail');
  const cover = getMediaUrl(event.cover ?? event.image);
  const fullDate = new Intl.DateTimeFormat(await getLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(event.date));

  const url = `${SITE_URL}/${locale}/events/${event.slug}`;
  return (
    <article>
      <JsonLd data={eventJsonLd(event, url)} />
      <header className="relative flex min-h-[45vh] items-end overflow-hidden">
        {cover ? (
          <Image src={cover} alt={event.title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Container className="relative z-10 pb-12 pt-32">
          <span className="text-sm font-semibold uppercase tracking-wide text-white/90">{fullDate}</span>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-white md:text-6xl">
            {event.title}
          </h1>
        </Container>
      </header>

      <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_280px]">
        <BlockContent content={event.description} />
        <aside className="space-y-4 rounded-card bg-white p-6 shadow-sm ring-1 ring-foreground/5 text-sm">
          <div>
            <p className="text-muted">{t('when')}</p>
            <p className="mt-1 font-medium text-foreground">{fullDate}</p>
          </div>
          {event.venue && (
            <div>
              <p className="text-muted">{t('where')}</p>
              <p className="mt-1 font-medium text-foreground">{event.venue}</p>
            </div>
          )}
          <div className="border-t border-foreground/10 pt-4">
            <ShareButtons url={url} title={event.title} />
          </div>
        </aside>
      </Container>
    </article>
  );
}
