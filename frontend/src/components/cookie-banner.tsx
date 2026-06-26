'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'baikal_cookie_consent';

/**
 * Cookie consent banner. Shows once until the visitor accepts or declines;
 * the choice is stored in localStorage. When analytics is added later, gate it
 * on `localStorage.getItem('baikal_cookie_consent') === 'accepted'`.
 */
export function CookieBanner() {
  const t = useTranslations('Cookie');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* localStorage unavailable — don't show */
    }
  }, []);

  function decide(choice: 'accepted' | 'declined') {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-foreground/10 bg-background/95 backdrop-blur-xl">
      <Container className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-foreground/80">
          {t('text')}{' '}
          <Link href="/privacy" className="font-medium text-accent underline underline-offset-2">
            {t('more')}
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <Button size="sm" variant="outline" onClick={() => decide('declined')}>
            {t('decline')}
          </Button>
          <Button size="sm" onClick={() => decide('accepted')}>
            {t('accept')}
          </Button>
        </div>
      </Container>
    </div>
  );
}
