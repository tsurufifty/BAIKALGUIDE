'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, User } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/context/auth-context';
import { Container } from '@/components/ui/container';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const MEDIA_BASE = STRAPI_URL.replace(/\/api\/?$/, '');
function avatarUrl(a?: { url?: string } | null): string | null {
  if (!a?.url) return null;
  return a.url.startsWith('http') ? a.url : `${MEDIA_BASE}${a.url}`;
}

const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/routes', key: 'routes' },
  { href: '/map', key: 'map' },
  { href: '/events', key: 'events' },
  { href: '/music', key: 'music' },
] as const;

export function Navbar() {
  const t = useTranslations('Nav');
  const tc = useTranslations('Common');
  const { user } = useAuth();
  const avatar = avatarUrl(user?.avatar);
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/5 bg-background/70 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between md:h-20">
        <Link href="/" aria-label="Байкал гайд" className="inline-flex">
          <Logo className="h-7 w-auto md:h-8" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/account" aria-label={t('account')} className="text-foreground/70 transition-colors hover:text-primary">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="size-7 rounded-full object-cover ring-1 ring-foreground/10" />
            ) : (
              <User className="size-5" />
            )}
          </Link>
          <LanguageSwitcher />
        </div>

        <button
          type="button"
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? tc('close') : tc('menu')}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      <div
        className={cn(
          'overflow-hidden border-t border-foreground/5 bg-background/95 backdrop-blur-xl transition-[max-height] duration-300 lg:hidden',
          open ? 'max-h-96' : 'max-h-0',
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-base font-medium text-foreground/80 hover:bg-foreground/5"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-3 text-base font-medium text-foreground/80 hover:bg-foreground/5"
          >
            {t('account')}
          </Link>
          <div className="mt-2 px-2">
            <LanguageSwitcher />
          </div>
        </Container>
      </div>
    </header>
  );
}
