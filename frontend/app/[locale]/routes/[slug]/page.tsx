import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { BlockContent } from '@/components/block-content';
import { Gallery } from '@/components/gallery';
import { FavoriteButton } from '@/components/favorite-button';
import { BookingActions } from '@/components/booking-actions';
import { ShareButtons } from '@/components/share-buttons';
import { RatingWidget } from '@/components/rating-widget';
import { Comments } from '@/components/comments';
import { JsonLd } from '@/components/json-ld';
import { routeJsonLd, faqJsonLd, SITE_URL } from '@/lib/seo';
import { getRouteBySlug, getMediaUrl, routeRating } from '@/lib/api';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const route = await getRouteBySlug(locale as Locale, slug);
  if (!route) return {};
  return {
    title: route.seo?.metaTitle ?? route.title,
    description: route.seo?.metaDescription ?? undefined,
  };
}

export default async function RouteDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const route = await getRouteBySlug(locale as Locale, slug);
  if (!route) notFound();

  const t = await getTranslations('RouteDetail');
  const td = await getTranslations('Difficulty');
  const ts = await getTranslations('Season');
  const cover = getMediaUrl(route.cover);
  const url = `${SITE_URL}/${locale}/routes/${route.slug}`;
  const faq = faqJsonLd(route.seo);
  const { average, count } = routeRating(route);
  const hasLogistics = Array.isArray(route.logistics) && route.logistics.length > 0;

  return (
    <article>
      <JsonLd data={routeJsonLd(route, url)} />
      {faq && <JsonLd data={faq} />}

      <header className="relative flex min-h-[55vh] items-end overflow-hidden">
        {cover ? (
          <Image src={cover} alt={route.title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <Container className="relative z-10 pb-12 pt-32">
          <div className="flex flex-wrap gap-2">
            <Chip>{ts(route.season)}</Chip>
            <Chip>{td(route.difficulty)}</Chip>
            {route.duration && <Chip>{route.duration}</Chip>}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold text-white md:text-6xl">
            {route.title}
          </h1>
        </Container>
      </header>

      <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_300px]">
        <div className="space-y-12">
          <BlockContent content={route.description} />

          {route.coordinates && route.coordinates.length > 0 && (
            <section>
              <h2 className="mb-6 font-display text-2xl font-semibold text-primary">{t('timeline')}</h2>
              <ol className="relative ml-3 space-y-6 border-l-2 border-primary/15">
                {route.coordinates.map((c, i) => (
                  <li key={i} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-4 ring-background">
                      {i + 1}
                    </span>
                    <p className="font-medium text-foreground">
                      {c.label ?? `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}`}
                    </p>
                    {c.label && (
                      <p className="text-xs text-muted">
                        {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {hasLogistics && (
            <section>
              <h2 className="mb-6 font-display text-2xl font-semibold text-primary">{t('logistics')}</h2>
              <BlockContent content={route.logistics} />
            </section>
          )}

          {route.gallery && route.gallery.length > 0 && (
            <section>
              <h2 className="mb-6 font-display text-2xl font-semibold text-primary">{t('gallery')}</h2>
              <Gallery images={route.gallery} />
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-card bg-white p-6 shadow-sm ring-1 ring-foreground/5">
            <dl className="space-y-4 text-sm">
              <Row label={t('duration')} value={route.duration ?? '—'} />
              <Row label={t('season')} value={ts(route.season)} />
              <Row label={t('difficulty')} value={td(route.difficulty)} />
              <Row
                label={t('price')}
                value={
                  typeof route.price === 'number' && route.price > 0
                    ? `${route.price.toLocaleString()} ₽`
                    : t('free')
                }
              />
            </dl>
            <BookingActions routeTitle={route.title} className="mt-5 grid gap-2" />
            <div className="mt-3 flex flex-col gap-3">
              <FavoriteButton type="route" itemId={route.documentId} />
              <a
                href={`/${locale}/routes/${route.slug}/pdf`}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
              >
                <Download className="size-4" /> PDF
              </a>
            </div>
          </div>

          <RatingWidget routeId={route.documentId} initialAverage={average} initialCount={count} />

          <div className="rounded-card bg-white p-6 shadow-sm ring-1 ring-foreground/5">
            <ShareButtons url={url} title={route.title} />
          </div>
        </aside>
      </Container>

      <Container className="max-w-3xl pb-20">
        <Comments target="route" itemId={route.documentId} />
      </Container>
    </article>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-foreground/5 pb-3 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

export const revalidate = 300;
