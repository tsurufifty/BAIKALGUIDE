'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/auth-context';
import { uploadAvatar, updateProfile } from '@/lib/auth';
import { Button } from '@/components/ui/button';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const MEDIA_BASE = STRAPI_URL.replace(/\/api\/?$/, '');

function avatarUrl(avatar?: { url?: string } | null): string | null {
  if (!avatar?.url) return null;
  return avatar.url.startsWith('http') ? avatar.url : `${MEDIA_BASE}${avatar.url}`;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

export function ProfileEditor() {
  const t = useTranslations('Account');
  const { user, token, refresh } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setStatus('idle');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || status === 'saving') return;
    setStatus('saving');
    setError('');
    try {
      let avatarId: number | undefined;
      if (file) avatarId = await uploadAvatar(token, file);
      await updateProfile(token, {
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        ...(avatarId !== undefined ? { avatar: avatarId } : {}),
      });
      await refresh();
      setFile(null);
      setPreview(null);
      setStatus('saved');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }

  const shown = preview ?? avatarUrl(user?.avatar);

  return (
    <form onSubmit={onSubmit} className="rounded-card bg-white p-6 shadow-sm ring-1 ring-foreground/5">
      <div className="flex items-center gap-5">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/20">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt={username} className="size-full object-cover" />
          ) : (
            <span className="font-display text-2xl font-bold text-primary/50">
              {(username || '?').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <label className="cursor-pointer text-sm font-medium text-accent underline underline-offset-4 hover:text-accent/80">
          {t('changeAvatar')}
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground/80">{t('username')}</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground/80">{t('email')}</span>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
      </div>

      {status === 'error' && <p className="mt-3 text-sm text-accent">{error || t('saveError')}</p>}
      {status === 'saved' && <p className="mt-3 text-sm text-primary">{t('saved')}</p>}

      <Button type="submit" className="mt-5" disabled={status === 'saving'}>
        {status === 'saving' ? t('saving') : t('save')}
      </Button>
    </form>
  );
}
