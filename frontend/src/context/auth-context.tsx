'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, fetchMe, type AuthUser } from '@/lib/auth';

const TOKEN_KEY = 'baikal_jwt';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    fetchMe(stored)
      .then((u) => {
        setUser(u);
        setToken(stored);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((jwt: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    setUser(u);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const { jwt, user: u } = await apiLogin(identifier, password);
      persist(jwt, u);
    },
    [persist],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const { jwt, user: u } = await apiRegister(username, email, password);
      persist(jwt, u);
    },
    [persist],
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setUser(await fetchMe(token));
    } catch {
      /* keep current user on transient failure */
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, token, loading, login, register, refresh, logout }),
    [user, token, loading, login, register, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
