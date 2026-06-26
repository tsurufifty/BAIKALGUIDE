'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import type { EventEntry } from '@/lib/types';
import { EventCard } from '@/components/event-card';

export function EventsCalendar({ events }: { events: EventEntry[] }) {
  const locale = useLocale();

  const groups = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    const map = new Map<string, EventEntry[]>();
    for (const ev of events) {
      const key = fmt.format(new Date(ev.date));
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [events, locale]);

  return (
    <div className="space-y-12">
      {groups.map(([month, list]) => (
        <section key={month}>
          <h2 className="mb-5 font-display text-xl font-semibold capitalize text-primary">{month}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {list.map((ev) => <EventCard key={ev.documentId} event={ev} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
