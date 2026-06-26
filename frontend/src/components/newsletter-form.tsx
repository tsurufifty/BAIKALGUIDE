'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function NewsletterForm() {
  const t = useTranslations('Newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'sending' || !email.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch(`${STRAPI_URL}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { email, source: 'footer' } }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="max-w-sm">
      <p className="font-display text-lg font-semibold text-foreground">{t('title')}</p>
      <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>

      {status === 'sent' ? (
        <p className="mt-4 text-sm font-medium text-primary">{t('success')}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('placeholder')}
            autoComplete="email"
            aria-label={t('placeholder')}
            className="input flex-1"
          />
          <Button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? t('sending') : t('submit')}
          </Button>
        </form>
      )}
      {status === 'error' && <p className="mt-2 text-sm text-accent">{t('error')}</p>}
    </div>
  );
}
