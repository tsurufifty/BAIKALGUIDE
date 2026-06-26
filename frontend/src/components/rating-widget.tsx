'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

/**
 * User rating for a route (1–5 stars). Shows the current average + count and,
 * for signed-in users, lets them set/update their own rating. The backend
 * controller upserts (one rating per user per route).
 */
export function RatingWidget({
  routeId,
  initialAverage,
  initialCount,
}: {
  routeId: string;
  initialAverage: number;
  initialCount: number;
}) {
  const t = useTranslations('Rating');
  const { token, user } = useAuth();
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  // Load the signed-in user's own rating for this route.
  useEffect(() => {
    if (!token || !user) return;
    fetch(
      `${STRAPI_URL}/api/ratings?filters[route][documentId][$eq]=${routeId}&filters[user][id][$eq]=${user.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((r) => r.json())
      .then((j) => {
        const own = (j.data ?? [])[0];
        if (own) setMine(own.value ?? null);
      })
      .catch(() => {});
  }, [token, user, routeId]);

  async function submit(value: number) {
    if (!token || busy) return;
    setBusy(true);
    const prevMine = mine;
    try {
      const res = await fetch(`${STRAPI_URL}/api/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: { route: routeId, value } }), // routeId is a documentId
      });
      if (!res.ok) return; // don't show a rating that wasn't saved
      // Optimistically recompute the average shown.
      const sum = average * count;
      if (prevMine == null) {
        const newCount = count + 1;
        setAverage(Math.round(((sum + value) / newCount) * 10) / 10);
        setCount(newCount);
      } else if (count > 0) {
        setAverage(Math.round(((sum - prevMine + value) / count) * 10) / 10);
      }
      setMine(value);
    } finally {
      setBusy(false);
    }
  }

  const display = hover || mine || Math.round(average);

  return (
    <div className="rounded-card bg-white p-6 shadow-sm ring-1 ring-foreground/5">
      <h3 className="mb-3 font-display font-semibold text-primary">{t('title')}</h3>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold text-foreground">
          {count > 0 ? average.toFixed(1) : '—'}
        </span>
        <span className="text-xs text-muted">
          {count > 0 ? t('count', { count }) : t('noRatings')}
        </span>
      </div>

      <div
        className="mt-3 flex gap-1"
        onMouseLeave={() => setHover(0)}
        role={token ? 'radiogroup' : undefined}
        aria-label={token ? t('yourRating') : undefined}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={!token || busy}
            onMouseEnter={() => token && setHover(n)}
            onClick={() => submit(n)}
            aria-label={t('star', { n })}
            className={cn(
              'transition-transform',
              token ? 'cursor-pointer hover:scale-110' : 'cursor-default',
            )}
          >
            <Star
              className={cn(
                'size-6',
                n <= display ? 'fill-accent text-accent' : 'text-foreground/25',
              )}
            />
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">{token ? t('hint') : t('signInHint')}</p>
    </div>
  );
}
