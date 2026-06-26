'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('Common');

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => {
      // next-intl preserves the current path and writes the NEXT_LOCALE cookie.
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={cn('flex items-center gap-1 text-sm', className)}
      aria-label={t('language')}
    >
      <Globe className="size-4 opacity-60" aria-hidden />
      {routing.locales.map((code, i) => (
        <span key={code} className="flex items-center">
          {i > 0 && <span className="mx-1 opacity-30">/</span>}
          <button
            type="button"
            onClick={() => switchTo(code)}
            disabled={isPending}
            className={cn(
              'uppercase tracking-wide transition-opacity',
              code === locale ? 'font-semibold text-primary' : 'opacity-50 hover:opacity-100',
            )}
            aria-current={code === locale ? 'true' : undefined}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
