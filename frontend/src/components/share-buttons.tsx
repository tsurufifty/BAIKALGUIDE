'use client';

import { useState } from 'react';
import { Send, MessageCircle, Link2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Social share row for detail pages. Uses share intents for Telegram, VK and
 * WhatsApp (most relevant for the audience) plus a copy-link fallback.
 */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations('Share');
  const [copied, setCopied] = useState(false);
  const e = encodeURIComponent;

  const links = [
    {
      key: 'tg',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${e(url)}&text=${e(title)}`,
      icon: <Send className="size-4" />,
    },
    {
      key: 'vk',
      label: 'VK',
      href: `https://vk.com/share.php?url=${e(url)}&title=${e(title)}`,
      icon: <span className="text-xs font-bold">VK</span>,
    },
    {
      key: 'wa',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${e(`${title} ${url}`)}`,
      icon: <MessageCircle className="size-4" />,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <div>
      <h3 className="mb-3 font-display font-semibold text-primary">{t('title')}</h3>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            title={l.label}
            className="inline-flex size-10 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
          >
            {l.icon}
          </a>
        ))}
        <button
          type="button"
          onClick={copy}
          aria-label={t('copy')}
          title={copied ? t('copied') : t('copy')}
          className="inline-flex size-10 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
        >
          {copied ? <Check className="size-4 text-primary" /> : <Link2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
