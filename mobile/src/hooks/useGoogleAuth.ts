import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType } from 'expo-auth-session';
import { googleLoginApi } from '@/lib/auth';
import type { AuthResponse } from '@/lib/auth';

// Required by expo-auth-session — must be called at module level
WebBrowser.maybeCompleteAuthSession();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GoogleAuthSuccess =
  | { type: 'existing'; user: AuthResponse }
  | { type: 'new'; tempToken: string; email: string };

export interface UseGoogleAuthReturn {
  loading: boolean;
  handlePress: () => Promise<void>;
  disabled: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGoogleAuth(
  onSuccess: (result: GoogleAuthSuccess) => void,
  onError: (message: string) => void
): UseGoogleAuthReturn {
  const [loading, setLoading] = useState(false);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
    responseType: ResponseType.IdToken,
  });

  // Android cold-start optimisation: warm up the browser on mount
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  // React to the OAuth response whenever it changes
  useEffect(() => {
    if (!response) return;

    if (response.type === 'cancel' || response.type === 'dismiss') {
      // FR5: silent no-op — user dismissed
      setLoading(false);
      return;
    }

    if (response.type === 'error') {
      // FR6: Google-side error
      setLoading(false);
      onError('auth.errors.googleFailed');
      return;
    }

    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      if (!idToken) {
        setLoading(false);
        onError('auth.errors.googleFailed');
        return;
      }

      // FR3 / FR4: call backend and branch on requiresHandle
      googleLoginApi(idToken)
        .then((result) => {
          if (result.requiresHandle) {
            // FR4: new user — navigate to ChooseHandle
            onSuccess({
              type: 'new',
              tempToken: result.tempToken!,
              email: result.email!,
            });
          } else {
            // FR3: existing user — tokens already stored by googleLoginApi
            onSuccess({
              type: 'existing',
              user: {
                handle: result.handle!,
                userId: result.userId!,
                email: result.email!,
              },
            });
          }
        })
        .catch(() => {
          // FR6b: backend API error
          onError('auth.errors.googleFailed');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [response]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePress = async (): Promise<void> => {
    setLoading(true);
    await promptAsync();
  };

  // FR9: disabled when no client IDs configured (request will be null)
  const disabled = request === null;

  return { loading, handlePress, disabled };
}
