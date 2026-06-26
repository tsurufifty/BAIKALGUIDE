'use client';

import { type FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/auth-context';
import { isRussianMail } from '@/lib/email';
import { Button } from '@/components/ui/button';

type Mode = 'login' | 'register';

export function AuthForm() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'register' && !isRussianMail(email)) {
      setError(t('emailNotAllowed'));
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(username, email, password);
      router.push('/account');
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg === 'email_not_allowed' ? t('emailNotAllowed') : msg);
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-md border border-foreground/15 bg-white px-4 py-3 text-sm outline-none focus:border-primary/50';

  return (
    <div className="mx-auto max-w-md rounded-card bg-white p-8 shadow-sm ring-1 ring-foreground/5">
      <div className="mb-6 flex gap-2 rounded-md bg-foreground/5 p-1 text-sm">
        {(['login', 'register'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded px-3 py-2 transition-colors ${
              mode === m ? 'bg-white font-medium text-primary shadow-sm' : 'text-muted'
            }`}
          >
            {t(m)}
          </button>
        ))}
      </div>

      {mode === 'register' && (
        <p className="mb-5 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
          {t('registerNotice')}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'register' && (
          <input
            className={field}
            placeholder={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        )}
        <input
          className={field}
          type={mode === 'login' ? 'text' : 'email'}
          placeholder={mode === 'login' ? t('identifier') : t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        {mode === 'register' && <p className="-mt-2 text-xs text-muted">{t('emailHint')}</p>}
        <input
          className={field}
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {error && <p className="text-sm text-accent">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? t('pending') : t(mode)}
        </Button>
      </form>
    </div>
  );
}
