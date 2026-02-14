'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { ApiRequestError } from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

interface GoogleLoginButtonProps {
  mode: 'login' | 'register';
}

export function GoogleLoginButton({ mode }: GoogleLoginButtonProps) {
  // Don't render if Google OAuth is not configured
  if (!GOOGLE_CLIENT_ID) {
    return null;
  }
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError(t('errors.unexpected'));
      return;
    }

    setError(null);
    try {
      const response = await googleLogin(credentialResponse.credential);
      if (response.requiresHandle) {
        const tempToken = encodeURIComponent(response.tempToken!);
        router.push(`/${params.locale}/choose-handle?t=${tempToken}` as never);
      } else {
        router.push(`/${params.locale}` as never);
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 409) {
          setError(t('errors.googleEmailConflict'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('errors.unexpected'));
      }
    }
  };

  const handleError = () => {
    setError(t('errors.googleCancelled'));
  };

  return (
    <div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={mode === 'login' ? 'signin_with' : 'signup_with'}
          size="large"
          width="384"
        />
      </div>
      {error && (
        <p
          role="alert"
          className="mt-2 text-center text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
