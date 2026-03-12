'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { validatePasswordResetTokenApi } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Spinner } from '@/components/ui/Spinner';

function ResetPasswordContent() {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [tokenState, setTokenState] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }
    validatePasswordResetTokenApi(token)
      .then(() => setTokenState('valid'))
      .catch(() => setTokenState('invalid'));
  }, [token]);

  // Focus management for accessibility
  useEffect(() => {
    if (tokenState === 'invalid' && alertRef.current) {
      alertRef.current.focus();
    }
  }, [tokenState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      {/* Wordmark */}
      <div className="mb-12 text-center">
        <Link
          href={`/${params.locale}` as never}
          className="inline-flex items-center gap-1 font-bricolage text-2xl font-semibold text-ink transition-opacity hover:opacity-70 dark:text-parchment"
        >
          <span className="font-normal">learn</span>
          <span className="font-bold">imo</span>
        </Link>
      </div>

      {/* Main Card Container */}
      <Card className="w-full max-w-sm p-8">
        {tokenState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="md" className="mb-3" />
            <p className="text-sm text-muted-foreground">
              {t('validatingResetLink')}
            </p>
          </div>
        )}

        {tokenState === 'invalid' && (
          <div ref={alertRef} tabIndex={-1} role="alert" className="space-y-4">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <svg
                  className="h-6 w-6 text-destructive"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-2 text-center">
              <h2 className="text-lg font-semibold text-foreground">
                {t('resetPasswordExpired')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('resetPasswordInvalid')}
              </p>
            </div>

            {/* Error CTA */}
            <Link
              href={`/${params.locale}/forgot-password` as never}
              className="block w-full rounded-md bg-primary px-4 py-2.5 text-center font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t('requestNewLink')}
            </Link>

            {/* Back Link */}
            <p className="text-center">
              <Link
                href={`/${params.locale}/login` as never}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('backToLogin')}
              </Link>
            </p>
          </div>
        )}

        {tokenState === 'valid' && (
          <div className="space-y-6">
            {/* Form Header */}
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                {t('resetPasswordTitle')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('resetPasswordSubtitle')}
              </p>
            </div>

            {/* Form */}
            <ResetPasswordForm token={token} locale={params.locale} />
          </div>
        )}
      </Card>

      {/* Back Link (shown below card when not in success state) */}
      {tokenState === 'valid' && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href={`/${params.locale}/login` as never}
            className="font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('backToLogin')}
          </Link>
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
