'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function FeedbackForm() {
  const t = useTranslations('Feedback');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'sending' || !message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch(`${STRAPI_URL}/api/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { name, email, message } }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-card bg-white p-8 text-center shadow-sm ring-1 ring-foreground/5">
        <p className="font-display text-lg font-semibold text-primary">{t('successTitle')}</p>
        <p className="mt-2 text-sm text-muted">{t('successBody')}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-5 text-sm font-medium text-accent underline underline-offset-4 hover:text-accent/80"
        >
          {t('sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-card bg-white p-8 shadow-sm ring-1 ring-foreground/5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground/80">{t('name')}</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
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

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground/80">
          {t('message')} <span className="text-accent">*</span>
        </span>
        <textarea
          required
          rows={5}
          maxLength={4000}
          className="input resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      {status === 'error' && <p className="text-sm text-accent">{t('error')}</p>}

      <Button type="submit" size="lg" disabled={status === 'sending'}>
        <Send className="size-4" />
        {status === 'sending' ? t('sending') : t('submit')}
      </Button>
    </form>
  );
}
