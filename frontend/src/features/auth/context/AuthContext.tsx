/**
 * Auth/session context (T019). Holds the authenticated user in memory and keeps the
 * token-store in sync so the API client can attach the bearer token. Logout clears both.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { setToken, clearToken } from '../../../lib/token-store.js';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Record a successful login: store the token and user. */
  setSession: (token: string, user: AuthUser) => void;
  /** Clear the session (logout). */
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [user, setUser] = useState<AuthUser | null>(null);

  const setSession = useCallback((token: string, nextUser: AuthUser) => {
    setToken(token);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, setSession, clearSession }),
    [user, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
