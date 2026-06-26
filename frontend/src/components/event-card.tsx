import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getMediaUrl } from '@/lib/api';
import type { EventEntry } from '@/lib/types';

export function EventCard({ event }: { event: EventEntry }) {
  const locale = useLocale();
  const cover = getMediaUrl(event.cover ?? event.image);
  const date = new Date(event.date);
  const formatted = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
  }).format(date);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex gap-5 rounded-card bg-white p-4 shadow-sm ring-1 ring-foreground/5 transition-all duration-500 hover:shadow-lg"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-secondary/10 md:size-28">
        {cover ? (
          <Image
            src={cover}
            alt={event.cover?.alternativeText ?? event.title}
            fill
            sizes="120px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-accent/20 to-primary/20" />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          {formatted}
        </span>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-foreground">
          {event.title}
        </h3>
        {event.venue && <span className="mt-1 text-sm text-muted">{event.venue}</span>}
      </div>
    </Link>
  );
}
