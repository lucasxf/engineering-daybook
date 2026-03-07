'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiRequestError, apiPublicFetch } from '@/lib/api';
import {
  loginApi,
  registerApi,
  refreshApi,
  logoutApi,
  googleLoginApi,
  completeGoogleSignupApi,
  type AuthResponse,
  type ProfileVisibility,
  type LoginPayload,
  type RegisterPayload,
  type GoogleLoginResponse,
  type CompleteGoogleSignupPayload,
} from '@/lib/auth';
import type { PokVisibility } from '@/lib/pokApi';

export interface AuthUser {
  userId: string;
  email: string;
  handle: string;
  defaultPokVisibility: PokVisibility;
  profileVisibility: ProfileVisibility;
  avatarUrl?: string;
  bio?: string;
  displayName?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (idToken: string) => Promise<GoogleLoginResponse>;
  completeGoogleSignup: (payload: CompleteGoogleSignupPayload) => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function toAuthUser(response: AuthResponse): AuthUser {
  return {
    userId: response.userId,
    email: response.email,
    handle: response.handle,
    defaultPokVisibility: response.defaultPokVisibility ?? 'PRIVATE',
    profileVisibility: response.profileVisibility ?? 'PRIVATE',
    avatarUrl: response.avatarUrl,
    bio: response.bio,
    displayName: response.displayName,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On every page load: restore session from the access_token cookie.
  // If the cookie is absent or expired, attempt a silent refresh via the
  // refresh_token cookie. If that also fails, the user is unauthenticated.
  useEffect(() => {
    async function initializeSession() {
      try {
        const data = await apiPublicFetch<AuthResponse>('/auth/me');
        setUser(toAuthUser(data));
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          try {
            await refreshApi();
            const data = await apiPublicFetch<AuthResponse>('/auth/me');
            setUser(toAuthUser(data));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    initializeSession();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginApi(payload);
    setUser(toAuthUser(response));
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await registerApi(payload);
    setUser(toAuthUser(response));
  }, []);

  const googleLoginAction = useCallback(
    async (idToken: string): Promise<GoogleLoginResponse> => {
      const response = await googleLoginApi(idToken);
      if (!response.requiresHandle && response.handle && response.userId && response.email) {
        try {
          const meData = await apiPublicFetch<AuthResponse>('/auth/me');
          setUser(toAuthUser(meData));
        } catch {
          // Fallback if /auth/me fails — use what Google login returned
          setUser({
            userId: response.userId,
            email: response.email,
            handle: response.handle,
            defaultPokVisibility: 'PRIVATE',
            profileVisibility: 'PRIVATE',
          });
        }
      }
      return response;
    },
    []
  );

  const completeGoogleSignup = useCallback(
    async (payload: CompleteGoogleSignupPayload) => {
      const response = await completeGoogleSignupApi(payload);
      setUser(toAuthUser(response));
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await logoutApi();
    } catch {
      // Ignore logout API errors — user state is already cleared
    }
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      googleLogin: googleLoginAction,
      completeGoogleSignup,
      updateUser,
    }),
    [user, isLoading, login, register, logout, googleLoginAction, completeGoogleSignup, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
