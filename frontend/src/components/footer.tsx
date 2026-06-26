import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NewsletterForm } from '@/components/newsletter-form';
import { SocialIcons } from '@/components/social-icons';
import { Logo } from '@/components/logo';

const SECTIONS = [
  { key: 'routes', href: '/routes' },
  { key: 'map', href: '/map' },
  { key: 'events', href: '/events' },
  { key: 'music', href: '/music' },
  { key: 'about', href: '/about' },
  { key: 'faq', href: '/faq' },
] as const;

const SERVICE = [
  { key: 'eco', href: '/eco' },
  { key: 'gettingThere', href: '/getting-there' },
  { key: 'transport', href: '/transport' },
  { key: 'safety', href: '/safety' },
  { key: 'partners', href: '/partners' },
  { key: 'contacts', href: '/contacts' },
  { key: 'feedback', href: '/feedback' },
] as const;

export function Footer() {
  const t = useTranslations('Nav');
  const tm = useTranslations('Meta');
  const tn = useTranslations('Newsletter');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-foreground/10 bg-primary/[0.03]">
      <Container className="py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo className="h-9 w-auto" />
            <p className="mt-3 text-sm leading-relaxed text-muted">{tm('defaultDescription')}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-2">
            <nav className="flex flex-col gap-3">
              {SECTIONS.map((s) => (
                <Link
                  key={s.key}
                  href={s.href}
                  className="text-sm text-foreground/70 transition-colors hover:text-primary"
                >
                  {t(s.key)}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t('services')}
              </span>
              {SERVICE.map((s) => (
                <Link
                  key={s.key}
                  href={s.href}
                  className="text-sm text-foreground/70 transition-colors hover:text-primary"
                >
                  {t(s.key)}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-10 border-t border-foreground/10 pt-10 md:flex-row md:items-start md:justify-between">
          <NewsletterForm />
          <div className="md:text-right">
            <p className="font-display text-lg font-semibold text-foreground">{tn('follow')}</p>
            <SocialIcons className="mt-4 flex items-center gap-5 md:justify-end" />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-foreground/10 pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <span>© {year} Байкал гайд.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-primary">
              {t('privacy')}
            </Link>
            <Link href="/personal-data" className="transition-colors hover:text-primary">
              {t('personalData')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </Container>
    </footer>
  );
}
