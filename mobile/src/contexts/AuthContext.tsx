import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { setAuthFailureListener } from '@/lib/api';
import { getMeApi, logoutApi, type AuthResponse } from '@/lib/auth';
import { tokenStore } from '@/lib/tokenStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthResponse | null;
  /** Called after a successful login/register from an auth screen. */
  setUser: (user: AuthResponse) => void;
  logout: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUserState] = useState<AuthResponse | null>(null);

  // Prevent multiple concurrent session checks
  const initStarted = useRef(false);

  // ---------------------------------------------------------------------------
  // Session initialisation
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    async function initSession() {
      // Load tokens from SecureStore into the in-memory cache
      await tokenStore.load();

      if (!tokenStore.hasTokens()) {
        setStatus('unauthenticated');
        return;
      }

      try {
        const me = await getMeApi();
        setUserState(me);
        setStatus('authenticated');
      } catch {
        // Access token invalid or expired and refresh failed (apiFetch handles refresh)
        await tokenStore.clear();
        setStatus('unauthenticated');
      }
    }

    initSession();
  }, []);

  // ---------------------------------------------------------------------------
  // Auth failure listener (double-401 from any API call after session starts)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setAuthFailureListener(() => {
      setUserState(null);
      setStatus('unauthenticated');
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const setUser = useCallback((newUser: AuthResponse) => {
    setUserState(newUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Best-effort server logout — always clear local state
    }
    await tokenStore.clear();
    setUserState(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ status, user, setUser, logout }),
    [status, user, setUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
