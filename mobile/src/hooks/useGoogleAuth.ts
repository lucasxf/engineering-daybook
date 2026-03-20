import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
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
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  // Android native OAuth client — uses the reverse client ID scheme
  // (com.googleusercontent.apps.{id}:/oauth2redirect/google) which is
  // automatically allowed for Android OAuth clients. Web client IDs cannot
  // use custom URI scheme redirects, which is why they produce 400 errors.
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  // FR9: disabled when no client IDs are configured.
  const hasClientId = !!(webClientId || iosClientId || androidClientId);

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId,
    androidClientId,
    // Dummy fallback — prevents expo-auth-session's invariantClientId() throw
    // when all platform-specific IDs are absent. Never used: button is hidden
    // via the disabled flag when hasClientId is false.
    ...(!hasClientId && { clientId: '__disabled__' }),
    // responseType intentionally omitted — expo-auth-session defaults to
    // ResponseType.Code on installed apps (Android/iOS) and auto-exchanges
    // the code for tokens including id_token. ResponseType.IdToken causes
    // "400: unsupported_response_type" on Android OAuth clients.
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
      // On Android (code flow), id_token comes from the auto-exchanged
      // authentication object. On web (implicit flow), it's in params directly.
      const idToken = response.params?.id_token ?? response.authentication?.idToken;
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
  }, [response]); // intentional: onSuccess/onError are stable callbacks from callers

  const handlePress = async (): Promise<void> => {
    if (disabled) return;
    setLoading(true);
    await promptAsync();
  };

  const disabled = !hasClientId;

  return { loading, handlePress, disabled };
}
