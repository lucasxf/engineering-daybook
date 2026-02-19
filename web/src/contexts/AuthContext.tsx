'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { configureApiAuth } from '@/lib/api';
import {
  loginApi,
  registerApi,
  refreshApi,
  logoutApi,
  googleLoginApi,
  completeGoogleSignupApi,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
  type GoogleLoginResponse,
  type CompleteGoogleSignupPayload,
} from '@/lib/auth';

interface JwtPayload {
  sub: string;
  email: string;
  handle: string;
  iat: number;
  exp: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  handle: string;
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
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleAuthResponseRef = useRef<((response: AuthResponse) => void) | null>(null);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    setUser(null);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const extractUser = useCallback((token: string): AuthUser => {
    const payload = jwtDecode<JwtPayload>(token);
    return {
      userId: payload.sub,
      email: payload.email,
      handle: payload.handle,
    };
  }, []);

  const scheduleRefresh = useCallback(
    (expiresIn: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // Refresh 2 minutes before expiry, minimum 10 seconds
      const refreshMs = Math.max((expiresIn - 120) * 1000, 10_000);

      refreshTimerRef.current = setTimeout(async () => {
        const token = refreshTokenRef.current;
        if (!token) return;

        try {
          const response = await refreshApi(token);
          handleAuthResponseRef.current?.(response);
        } catch {
          clearAuth();
        }
      }, refreshMs);
    },
    [clearAuth]
  );

  const handleAuthResponse = useCallback(
    (response: AuthResponse) => {
      accessTokenRef.current = response.accessToken;
      refreshTokenRef.current = response.refreshToken;
      setUser(extractUser(response.accessToken));
      scheduleRefresh(response.expiresIn);
    },
    [extractUser, scheduleRefresh]
  );
  handleAuthResponseRef.current = handleAuthResponse;

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginApi(payload);
      handleAuthResponse(response);
    },
    [handleAuthResponse]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerApi(payload);
      handleAuthResponse(response);
    },
    [handleAuthResponse]
  );

  const googleLoginAction = useCallback(
    async (idToken: string): Promise<GoogleLoginResponse> => {
      const response = await googleLoginApi(idToken);
      if (!response.requiresHandle && response.accessToken && response.refreshToken) {
        handleAuthResponse({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          handle: response.handle!,
          userId: response.userId!,
          expiresIn: response.expiresIn!,
        });
      }
      return response;
    },
    [handleAuthResponse]
  );

  const completeGoogleSignup = useCallback(
    async (payload: CompleteGoogleSignupPayload) => {
      const response = await completeGoogleSignupApi(payload);
      handleAuthResponse(response);
    },
    [handleAuthResponse]
  );

  const logout = useCallback(async () => {
    const token = refreshTokenRef.current;
    clearAuth();
    if (token) {
      try {
        await logoutApi(token);
      } catch {
        // Ignore logout API errors — tokens are already cleared locally
      }
    }
  }, [clearAuth]);

  const refreshAndGetToken = useCallback(async (): Promise<string | null> => {
    const token = refreshTokenRef.current;
    if (!token) return null;

    try {
      const response = await refreshApi(token);
      handleAuthResponse(response);
      return response.accessToken;
    } catch {
      clearAuth();
      return null;
    }
  }, [handleAuthResponse, clearAuth]);

  // Configure API client with token getters
  useEffect(() => {
    configureApiAuth(
      () => accessTokenRef.current,
      refreshAndGetToken
    );
  }, [refreshAndGetToken]);

  // Initial auth check — try to restore session
  // Since tokens are in-memory only (MVP), this will always result in
  // isLoading=false, user=null on fresh page load.
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
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
    }),
    [user, isLoading, login, register, logout, googleLoginAction, completeGoogleSignup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
