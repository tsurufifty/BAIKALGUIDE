import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Star, Compass, Wallet, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { RouteEntry } from '@/lib/types';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { RouteCard } from '@/components/route-card';
import { EventCard } from '@/components/event-card';
import { getRoutes, getUpcomingEvents } from '@/lib/api';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const tf = await getTranslations('Faq');
  const faqItems = tf.raw('items') as { q: string; a: string }[];

  const [routes, events] = await Promise.all([
    getRoutes(locale as Locale, 3),
    getUpcomingEvents(locale as Locale, 4),
  ]);

  // "Route of the week" — first available route (editorial pick placeholder
  // until a `featured` flag is added to the route schema).
  const weekRoute: RouteEntry | undefined = routes[0];

  return (
    <>
      {/* Hero — full-bleed photo background with darkening overlay */}
      <section className="relative isolate min-h-[78vh] overflow-hidden">
        <Image
          src="/ddd.jpg"
          alt={t('heroImageAlt')}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Darkening overlays for text legibility (bottom + left weighted) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

        <Container className="relative flex min-h-[78vh] flex-col justify-center py-24">
          <Reveal>
            <p className="mb-5 font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
              {t('eyebrow')}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.05] text-white drop-shadow-sm md:text-7xl">
              {t('heroTitle')}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              {t('heroSubtitle')}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/routes">
                <Button size="lg">{t('exploreRoutes')}</Button>
              </Link>
              <Link href="/map">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 text-white hover:bg-white/10"
                >
                  {t('openMap')}
                </Button>
              </Link>
            </div>
          </Reveal>
        </Container>

        {/* Photo credit — required attribution (Magnific / Freepik license) */}
        <a
          href="https://www.magnific.com"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="absolute bottom-3 right-4 z-10 text-[11px] tracking-wide text-white/55 transition-colors hover:text-white/85"
        >
          {t('photoCredit')}
        </a>
      </section>

      {/* Navigation by interest */}
      <Container className="py-14 md:py-20">
        <Reveal>
          <SectionHeading title={t('interestsTitle')} subtitle={t('interestsSub')} />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INTERESTS.map((item, i) => (
            <Reveal key={item.key} delay={i * 0.06}>
              <Link
                href={item.href}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card shadow-sm transition-shadow duration-500 hover:shadow-xl"
              >
                {/* Colour fallback shown until a photo is added */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
                {/* Photo */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={item.img ? { backgroundImage: `url(${item.img})` } : undefined}
                />
                {/* Darkening overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

                <div className="relative p-6">
                  <h3 className="font-display text-xl font-bold text-white">{t(item.titleKey)}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/85">{t(item.descKey)}</p>
                  <span className="mt-4 inline-flex items-center rounded-full border border-white/60 px-5 py-2 text-sm font-medium text-white transition-colors group-hover:bg-white group-hover:text-foreground">
                    {t('topPickCta')}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* FAQ */}
      <Container className="py-14 md:py-20">
        <Reveal>
          <SectionHeading title={tf('title')} subtitle={tf('subtitle')} />
        </Reveal>
        <div className="max-w-3xl space-y-4">
          {faqItems.map((item, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <details className="group rounded-card bg-white p-6 shadow-sm ring-1 ring-foreground/5">
                <summary className="cursor-pointer list-none font-display font-semibold text-foreground marker:hidden">
                  {item.q}
                </summary>
                <p className="mt-3 leading-relaxed text-foreground/75">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Popular routes */}
      <Container className="py-14 md:py-20">
        <Reveal>
          <SectionHeading title={t('popularRoutes')} subtitle={t('popularRoutesSub')} />
        </Reveal>
        {routes.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {routes.map((route, i) => (
              <Reveal key={route.documentId} delay={i * 0.08}>
                <RouteCard route={route} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState text={t('emptyRoutes')} />
        )}
      </Container>

      {/* Top picks */}
      <Container className="py-14 md:py-20">
        <Reveal>
          <SectionHeading title={t('topPicksTitle')} subtitle={t('topPicksSub')} />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              key: 'week',
              Icon: Star,
              href: weekRoute ? `/routes/${weekRoute.slug}` : '/routes',
              title: t('topPickWeekTitle'),
              desc: weekRoute ? weekRoute.title : t('topPickWeekDesc'),
            },
            {
              key: 'hidden',
              Icon: Compass,
              href: '/map',
              title: t('topPickHiddenTitle'),
              desc: t('topPickHiddenDesc'),
            },
            {
              key: 'budget',
              Icon: Wallet,
              href: '/routes',
              title: t('topPickBudgetTitle'),
              desc: t('topPickBudgetDesc'),
            },
          ].map((card, i) => (
            <Reveal key={card.key} delay={i * 0.08}>
              <Link
                href={card.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-card bg-primary p-7 text-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                <card.Icon
                  className="absolute -right-4 -top-4 size-28 text-white/10 transition-transform duration-700 group-hover:scale-110"
                  strokeWidth={1.25}
                />
                <card.Icon className="mb-5 size-7 text-secondary" strokeWidth={1.75} />
                <h3 className="font-display text-xl font-semibold">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/80">{card.desc}</p>
                <span className="mt-5 text-sm font-semibold text-secondary">
                  {t('topPickCta')} →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Map preview */}
      <Container className="py-14 md:py-20">
        <Reveal>
          <Link
            href="/map"
            className="group relative block overflow-hidden rounded-lg bg-secondary px-8 py-14 text-primary shadow-sm transition-shadow duration-500 hover:shadow-xl md:px-14 md:py-20"
          >
            <div className="absolute inset-0 opacity-20" aria-hidden>
              {MAP_PINS.map((p, i) => (
                <MapPin
                  key={i}
                  className="absolute size-8 text-primary"
                  strokeWidth={1.5}
                  style={{ left: p.left, top: p.top }}
                />
              ))}
            </div>
            <div className="relative max-w-xl">
              <h2 className="font-display text-3xl font-bold md:text-4xl">{t('mapPreviewTitle')}</h2>
              <p className="mt-4 text-base leading-relaxed text-primary/80">{t('mapPreviewSub')}</p>
              <span className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-transform duration-300 group-hover:translate-x-1">
                <MapPin className="size-4" /> {t('mapPreviewCta')}
              </span>
            </div>
          </Link>
        </Reveal>
      </Container>

      {/* Upcoming events */}
      <Container className="py-14 md:py-20">
        <Reveal>
          <SectionHeading title={t('upcomingEvents')} subtitle={t('upcomingEventsSub')} />
        </Reveal>
        {events.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {events.map((event, i) => (
              <Reveal key={event.documentId} delay={i * 0.06}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState text={t('emptyEvents')} />
        )}
      </Container>
    </>
  );
}

// Interest navigation cards — each links to its hub page, which lists routes
// filtered by the matching activity type. `img` is an optional photo at
// public/interests/<key>.jpg; until it exists, a colour tile shows instead.
const INTERESTS = [
  { key: 'adrenaline', href: '/interests/adrenaline', img: '/interests/adrenaline.svg', titleKey: 'interestAdrenalineTitle', descKey: 'interestAdrenalineDesc' },
  { key: 'soul', href: '/interests/soul', img: '/interests/soul.svg', titleKey: 'interestSoulTitle', descKey: 'interestSoulDesc' },
  { key: 'culture', href: '/interests/culture', img: '/interests/culture.svg', titleKey: 'interestCultureTitle', descKey: 'interestCultureDesc' },
  { key: 'content', href: '/interests/content', img: '/interests/content.svg', titleKey: 'interestContentTitle', descKey: 'interestContentDesc' },
] as const;

// Decorative pin positions for the map-preview banner.
const MAP_PINS = [
  { left: '12%', top: '30%' },
  { left: '34%', top: '64%' },
  { left: '58%', top: '22%' },
  { left: '72%', top: '70%' },
  { left: '86%', top: '40%' },
] as const;

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{title}</h2>
      <p className="mt-3 text-base text-muted">{subtitle}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-foreground/15 bg-white/40 px-6 py-16 text-center text-muted">
      {text}
    </div>
  );
}

export const revalidate = 300;
