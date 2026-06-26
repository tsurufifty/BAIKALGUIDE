'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
type FavType = 'route' | 'event' | 'location' | 'article';

export function FavoriteButton({ type, itemId }: { type: FavType; itemId: string }) {
  const t = useTranslations('Favorite');
  const { token } = useAuth();
  const [favId, setFavId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${STRAPI_URL}/api/favorites?populate=*`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        const match = (j.data ?? []).find(
          (f: Record<string, { documentId?: string } | null>) => f[type]?.documentId === itemId,
        );
        setFavId(match?.documentId ?? null);
      })
      .catch(() => {});
  }, [token, type, itemId]);

  async function toggle() {
    if (!token || busy) return;
    setBusy(true);
    try {
      if (favId) {
        await fetch(`${STRAPI_URL}/api/favorites/${favId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavId(null);
      } else {
        const res = await fetch(`${STRAPI_URL}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: { [type]: { connect: [itemId] } } }),
        });
        const j = await res.json();
        setFavId(j?.data?.documentId ?? null);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!token) return null;
  const active = Boolean(favId);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-foreground/20 text-foreground/70 hover:border-accent/50',
      )}
    >
      <Heart className={cn('size-4', active && 'fill-accent')} />
      {active ? t('saved') : t('save')}
    </button>
  );
}
