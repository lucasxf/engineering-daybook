'use client';

import { Suspense, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
import { Alert } from '@/components/ui/Alert';
import { LoginForm } from '@/components/auth/LoginForm';

const GoogleLoginButton = dynamic(
  () => import('@/components/auth/GoogleLoginButton').then(m => m.GoogleLoginButton),
  { ssr: false }
);

function LoginContent() {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const redirectTo = searchParams.get('redirect') || undefined;
  const resetSuccess = searchParams.get('reset') === 'success';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(`/${params.locale}/poks`);
    }
  }, [isLoading, isAuthenticated, router, params.locale]);

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t('loginTitle')}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('loginSubtitle')}
        </p>
      </div>

      {resetSuccess && (
        <Alert variant="success" role="status" className="mb-4">
          {t('resetPasswordSuccess')}
        </Alert>
      )}

      <LoginForm locale={params.locale} redirectTo={redirectTo} />

      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1 border-slate-300 dark:border-slate-600" />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('orContinueWith')}
        </span>
        <hr className="flex-1 border-slate-300 dark:border-slate-600" />
      </div>

      <GoogleLoginButton mode="login" />

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {t('noAccount')}{' '}
        <Link
          href={`/${params.locale}/register` as never}
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          {t('signUpLink')}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
