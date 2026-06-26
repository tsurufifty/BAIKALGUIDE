'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import type { RouteEntry, Season, Difficulty, ActivityType } from '@/lib/types';
import { RouteCard } from '@/components/route-card';
import { cn } from '@/lib/utils';

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter', 'all_year'];
const DIFFICULTIES: Difficulty[] = ['easy', 'moderate', 'hard', 'expert'];
const ACTIVITIES: ActivityType[] = ['active', 'culture', 'nature', 'gastronomy', 'relax'];
const DURATIONS = ['1', '2-3', '4+'] as const;
const BUDGETS = ['free', 'lt2000', 'mid', 'gt5000'] as const;

type Duration = (typeof DURATIONS)[number];
type Budget = (typeof BUDGETS)[number];

function matchesDuration(days: number | null | undefined, bucket: Duration): boolean {
  if (typeof days !== 'number') return false;
  if (bucket === '1') return days === 1;
  if (bucket === '2-3') return days >= 2 && days <= 3;
  return days >= 4;
}

function matchesBudget(price: number | null | undefined, bucket: Budget): boolean {
  const p = typeof price === 'number' ? price : 0;
  if (bucket === 'free') return p === 0;
  if (bucket === 'lt2000') return p > 0 && p < 2000;
  if (bucket === 'mid') return p >= 2000 && p <= 5000;
  return p > 5000;
}

export function RoutesExplorer({ routes }: { routes: RouteEntry[] }) {
  const tc = useTranslations('Common');
  const ts = useTranslations('Season');
  const td = useTranslations('Difficulty');
  const ta = useTranslations('Activity');
  const tf = useTranslations('RoutesFilter');
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState<Season | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [activity, setActivity] = useState<ActivityType | 'all'>('all');
  const [duration, setDuration] = useState<Duration | 'all'>('all');
  const [budget, setBudget] = useState<Budget | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return routes.filter((r) => {
      if (season !== 'all' && r.season !== season) return false;
      if (difficulty !== 'all' && r.difficulty !== difficulty) return false;
      if (activity !== 'all' && r.activityType !== activity) return false;
      if (duration !== 'all' && !matchesDuration(r.durationDays, duration)) return false;
      if (budget !== 'all' && !matchesBudget(r.price, budget)) return false;
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [routes, query, season, difficulty, activity, duration, budget]);

  const pill = (selected: boolean) =>
    cn(
      'rounded-full border px-3 py-1.5 text-sm transition-colors',
      selected
        ? 'border-primary bg-primary text-background'
        : 'border-foreground/15 text-foreground/70 hover:border-primary/40',
    );

  return (
    <div>
      <div className="mb-10 space-y-5">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tc('search')}
            className="w-full rounded-full border border-foreground/15 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-primary/50"
          />
        </div>

        <FilterRow label={tf('activity')}>
          <button className={pill(activity === 'all')} onClick={() => setActivity('all')}>
            {tc('all')}
          </button>
          {ACTIVITIES.map((a) => (
            <button key={a} className={pill(activity === a)} onClick={() => setActivity(a)}>
              {ta(a)}
            </button>
          ))}
        </FilterRow>

        <FilterRow label={tf('duration')}>
          <button className={pill(duration === 'all')} onClick={() => setDuration('all')}>
            {tc('all')}
          </button>
          {DURATIONS.map((d) => (
            <button key={d} className={pill(duration === d)} onClick={() => setDuration(d)}>
              {tf(`durationOpt.${d}`)}
            </button>
          ))}
        </FilterRow>

        <FilterRow label={tf('budget')}>
          <button className={pill(budget === 'all')} onClick={() => setBudget('all')}>
            {tc('all')}
          </button>
          {BUDGETS.map((b) => (
            <button key={b} className={pill(budget === b)} onClick={() => setBudget(b)}>
              {tf(`budgetOpt.${b}`)}
            </button>
          ))}
        </FilterRow>

        <FilterRow label={tf('season')}>
          <button className={pill(season === 'all')} onClick={() => setSeason('all')}>
            {tc('all')}
          </button>
          {SEASONS.map((s) => (
            <button key={s} className={pill(season === s)} onClick={() => setSeason(s)}>
              {ts(s)}
            </button>
          ))}
        </FilterRow>

        <FilterRow label={tf('difficulty')}>
          <button className={pill(difficulty === 'all')} onClick={() => setDifficulty('all')}>
            {tc('all')}
          </button>
          {DIFFICULTIES.map((d) => (
            <button key={d} className={pill(difficulty === d)} onClick={() => setDifficulty(d)}>
              {td(d)}
            </button>
          ))}
        </FilterRow>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RouteCard key={r.documentId} route={r} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-foreground/15 bg-white/40 px-6 py-20 text-center text-muted">
          {tc('noResults')}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-full text-xs font-semibold uppercase tracking-wide text-muted sm:w-24">
        {label}
      </span>
      {children}
    </div>
  );
}
