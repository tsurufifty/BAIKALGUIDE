'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { LocationEntry, LocationCategory } from '@/lib/types';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./map-view').then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-[70vh] w-full animate-pulse rounded-card bg-secondary/10" />,
});
import { cn } from '@/lib/utils';

const CATEGORIES: LocationCategory[] = [
  'nature', 'culture', 'gastronomy', 'viewpoint', 'lodging', 'transport', 'other',
];

export function MapExplorer({ locations }: { locations: LocationEntry[] }) {
  const locale = useLocale();
  const lang = locale === 'en' ? 'en_US' : 'ru_RU';
  const t = useTranslations('Categories');
  const tc = useTranslations('Common');
  const [active, setActive] = useState<LocationCategory | 'all'>('all');

  const filtered = useMemo(
    () => (active === 'all' ? locations : locations.filter((l) => l.category === active)),
    [active, locations],
  );

  const chip = (key: LocationCategory | 'all', label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setActive(key)}
      className={cn(
        'rounded-full border px-4 py-2 text-sm transition-colors',
        active === key
          ? 'border-primary bg-primary text-background'
          : 'border-foreground/15 text-foreground/70 hover:border-primary/40',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {chip('all', tc('all'))}
        {CATEGORIES.map((c) => chip(c, t(c)))}
      </div>
      <MapView locations={filtered} lang={lang} />
    </div>
  );
}
