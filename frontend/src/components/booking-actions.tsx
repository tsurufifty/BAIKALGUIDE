'use client';

import { useState, type FormEvent, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarCheck, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VK_URL } from '@/lib/contacts';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * "Забронировать" opens a booking request form (submitted to the feedback API
 * with the route name prefilled) and "Связаться" links straight to VK.
 * Rendered on route cards, so button clicks stop propagation to avoid
 * triggering the surrounding card link.
 */
export function BookingActions({
  routeTitle,
  className,
}: {
  routeTitle: string;
  className?: string;
}) {
  const t = useTranslations('Booking');
  const tc = useTranslations('RouteCard');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const stop = (e: MouseEvent) => e.stopPropagation();

  function close() {
    setOpen(false);
    setStatus('idle');
    setName('');
    setContact('');
    setComment('');
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const message = [
      `Бронирование маршрута: «${routeTitle}».`,
      `Контакт: ${contact.trim() || '—'}`,
      comment.trim(),
    ]
      .filter(Boolean)
      .join('\n');
    try {
      const res = await fetch(`${STRAPI_URL}/api/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { name: name.trim(), message } }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <div className={className}>
        <Button
          type="button"
          size="sm"
          variant="accent"
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <CalendarCheck className="size-4" />
          {tc('book')}
        </Button>
        <a
          href={VK_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stop}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-primary/30 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <MessageCircle className="size-4" />
          {tc('contact')}
        </a>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-card bg-white p-6 shadow-xl"
            onClick={stop}
          >
            <button
              type="button"
              onClick={close}
              aria-label={t('close')}
              className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            {status === 'sent' ? (
              <div className="py-4 text-center">
                <p className="font-display text-lg font-semibold text-primary">
                  {t('successTitle')}
                </p>
                <p className="mt-2 text-sm text-muted">{t('successBody')}</p>
                <a
                  href={VK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-background transition-colors hover:bg-accent/90"
                >
                  <MessageCircle className="size-4" />
                  {t('vk')}
                </a>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-primary">
                    {t('title')}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{t('intro')}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {t('route')}: {routeTitle}
                  </p>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground/80">
                    {t('name')}
                  </span>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground/80">
                    {t('contact')}
                  </span>
                  <input
                    className="input"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={t('contactPlaceholder')}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground/80">
                    {t('message')}
                  </span>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    className="input resize-y"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </label>

                {status === 'error' && <p className="text-sm text-accent">{t('error')}</p>}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" size="md" variant="accent" disabled={status === 'sending'}>
                    {status === 'sending' ? t('sending') : t('submit')}
                  </Button>
                  <a
                    href={VK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-primary/30 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                  >
                    <MessageCircle className="size-4" />
                    {t('vk')}
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
