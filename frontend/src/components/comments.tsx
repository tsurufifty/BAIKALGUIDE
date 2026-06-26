'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const MEDIA_BASE = STRAPI_URL.replace(/\/api\/?$/, '');
type Target = 'article' | 'route';

function avatarUrl(a?: { url?: string } | null): string | null {
  if (!a?.url) return null;
  return a.url.startsWith('http') ? a.url : `${MEDIA_BASE}${a.url}`;
}

interface CommentRow {
  documentId: string;
  content: string;
  createdAt: string;
  user?: { username?: string; avatar?: { url?: string } | null } | null;
}

export function Comments({ target, itemId }: { target: Target; itemId: string }) {
  const t = useTranslations('Comments');
  const { token } = useAuth();
  const [items, setItems] = useState<CommentRow[]>([]);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [profane, setProfane] = useState(false);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch(
      `${STRAPI_URL}/api/comments?populate[user][populate][0]=avatar&sort=createdAt:desc&filters[${target}][documentId][$eq]=${itemId}`,
    )
      .then((r) => r.json())
      .then((j) => setItems(j.data ?? []))
      .catch(() => setItems([]));
  }

  useEffect(load, [target, itemId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!token || !text.trim()) return;
    setBusy(true);
    setFailed(false);
    setProfane(false);
    setSent(false);
    try {
      const res = await fetch(`${STRAPI_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: { content: text.trim(), [target]: { connect: [itemId] } } }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        if (res.status === 400 && j?.error?.message === 'profanity') setProfane(true);
        else setFailed(true);
        return;
      }
      setText('');
      setSent(true);
      load(); // comment is auto-published — show it right away
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-display text-2xl font-semibold text-primary">{t('title')}</h2>

      {token ? (
        <form onSubmit={submit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={t('placeholder')}
            className="w-full rounded-md border border-foreground/15 bg-white px-4 py-3 text-sm outline-none focus:border-primary/50"
          />
          <div className="mt-3 flex items-center gap-4">
            <Button type="submit" size="sm" disabled={busy || !text.trim()}>
              {t('submit')}
            </Button>
            {sent && <span className="text-sm text-muted">{t('posted')}</span>}
            {profane && <span className="text-sm text-accent">{t('profanity')}</span>}
            {failed && <span className="text-sm text-accent">{t('error')}</span>}
          </div>
        </form>
      ) : (
        <p className="mb-8 text-sm text-muted">
          <Link href="/login" className="text-accent underline underline-offset-2">
            {t('loginPrompt')}
          </Link>
        </p>
      )}

      {items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((c) => (
            <li key={c.documentId} className="rounded-card bg-white p-5 shadow-sm ring-1 ring-foreground/5">
              <div className="mb-2 flex items-center gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/20">
                  {avatarUrl(c.user?.avatar) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl(c.user?.avatar)!} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary/50">
                      {(c.user?.username ?? '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="font-medium text-foreground">{c.user?.username ?? '—'}</span>
                <span className="ml-auto text-xs text-muted">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-foreground/80">{c.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">{t('empty')}</p>
      )}
    </section>
  );
}
