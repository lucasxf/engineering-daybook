import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { appleLoginApi } from '@/lib/auth';
import type { AuthResponse } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppleAuthSuccess =
  | { type: 'existing'; user: AuthResponse }
  | { type: 'new'; tempToken: string; email: string | null };

export interface UseAppleAuthReturn {
  loading: boolean;
  handlePress: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppleAuth(
  onSuccess: (result: AppleAuthSuccess) => void,
  onError: (message: string) => void
): UseAppleAuthReturn {
  const [loading, setLoading] = useState(false);

  const handlePress = async (): Promise<void> => {
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;

      if (!identityToken) {
        setLoading(false);
        onError('auth.errors.appleFailed');
        return;
      }

      try {
        const result = await appleLoginApi(identityToken);

        if (result.requiresHandle) {
          // New user — navigate to ChooseHandle
          onSuccess({
            type: 'new',
            tempToken: result.tempToken!,
            email: result.email ?? null,
          });
        } else {
          // Existing user — tokens already stored by appleLoginApi
          onSuccess({
            type: 'existing',
            user: {
              handle: result.handle!,
              userId: result.userId!,
              email: result.email!,
            },
          });
        }
      } catch {
        // Backend API error
        onError('auth.errors.appleFailed');
      } finally {
        setLoading(false);
      }
    } catch (err: unknown) {
      setLoading(false);
      // Silent no-op on user cancel
      if (
        err instanceof Error &&
        (err as { code?: string }).code === AppleAuthentication.AppleAuthenticationError.CANCELED
      ) {
        return;
      }
      onError('auth.errors.appleFailed');
    }
  };

  return { loading, handlePress };
}
