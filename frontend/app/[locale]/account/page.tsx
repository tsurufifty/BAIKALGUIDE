'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/auth-context';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { ProfileEditor } from '@/components/auth/profile-editor';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

interface FavoriteRow {
  documentId: string;
  route?: { title?: string } | null;
  event?: { title?: string } | null;
  location?: { title?: string } | null;
  article?: { title?: string } | null;
}

export default function AccountPage() {
  const t = useTranslations('Account');
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${STRAPI_URL}/api/favorites?populate=*`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setFavorites(j.data ?? []))
      .catch(() => setFavorites([]));
  }, [token]);

  if (loading || !user) return null;

  return (
    <Container className="py-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">{t('greeting', { name: user.username })}</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <Button variant="outline" onClick={logout}>{t('logout')}</Button>
      </div>

      <h2 className="mb-4 font-display text-xl font-semibold text-primary">{t('profileTitle')}</h2>
      <div className="mb-12">
        <ProfileEditor />
      </div>

      <h2 className="mb-4 font-display text-xl font-semibold text-primary">{t('favorites')}</h2>
      {favorites.length > 0 ? (
        <ul className="space-y-2">
          {favorites.map((f) => {
            const title = f.route?.title ?? f.event?.title ?? f.location?.title ?? f.article?.title ?? '—';
            return (
              <li key={f.documentId} className="rounded-md bg-white px-5 py-4 shadow-sm ring-1 ring-foreground/5">
                {title}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted">{t('noFavorites')}</p>
      )}
    </Container>
  );
}
