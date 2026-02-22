'use client';

import { Suspense, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { validatePasswordResetTokenApi } from '@/lib/auth';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Spinner } from '@/components/ui/Spinner';

function ResetPasswordContent() {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [tokenState, setTokenState] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }
    validatePasswordResetTokenApi(token)
      .then(() => setTokenState('valid'))
      .catch(() => setTokenState('invalid'));
  }, [token]);

  if (tokenState === 'loading') {
    return (
      <div className="mx-auto max-w-sm py-12 text-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (tokenState === 'invalid') {
    return (
      <div className="mx-auto max-w-sm py-12">
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          {t('resetPasswordInvalid')}
        </div>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link
            href={`/${params.locale}/forgot-password` as never}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('requestNewLink')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t('resetPasswordTitle')}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('resetPasswordSubtitle')}
        </p>
      </div>

      <ResetPasswordForm token={token} locale={params.locale} />

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        <Link
          href={`/${params.locale}/login` as never}
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          {t('backToLogin')}
        </Link>
      </p>
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
