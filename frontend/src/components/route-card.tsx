import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getMediaUrl, routeRating } from '@/lib/api';
import type { RouteEntry } from '@/lib/types';
import { BookingActions } from '@/components/booking-actions';

export function RouteCard({ route }: { route: RouteEntry }) {
  const t = useTranslations('RouteCard');
  const td = useTranslations('Difficulty');
  const ts = useTranslations('Season');
  const cover = getMediaUrl(route.cover);
  const { average, count } = routeRating(route);

  return (
    <div className="group flex flex-col overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-foreground/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/routes/${route.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/10">
          {cover ? (
            <Image
              src={cover}
              alt={route.cover?.alternativeText ?? route.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              {ts(route.season)}
            </span>
            <span className="rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-accent backdrop-blur">
              {td(route.difficulty)}
            </span>
          </div>
          {count > 0 && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur">
              <Star className="size-3.5 fill-accent text-accent" />
              {average.toFixed(1)}
            </span>
          )}
        </div>

        <div className="p-6 pb-4">
          <h3 className="font-display text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {route.title}
          </h3>
          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>{route.duration}</span>
            {typeof route.price === 'number' && route.price > 0 && (
              <span className="font-medium text-primary">
                {t('from')} {route.price.toLocaleString()} ₽
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-auto px-6 pb-6">
        <BookingActions routeTitle={route.title} className="flex gap-2" />
      </div>
    </div>
  );
}
