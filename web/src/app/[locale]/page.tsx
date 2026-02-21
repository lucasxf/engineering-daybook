'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';

const GoogleLoginButton = dynamic(
  () => import('@/components/auth/GoogleLoginButton').then(m => m.GoogleLoginButton),
  { ssr: false }
);

/**
 * Home page. Authenticated users are redirected to the feed.
 * Guests see the login form directly (no intermediate "Get Started" screen).
 */
export default function HomePage() {
  const t = useTranslations('home');
  const tAuth = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(`/${params.locale}/poks`);
    }
  }, [isLoading, isAuthenticated, router, params.locale]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">learnimo</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('description')}
        </p>
      </div>

      <LoginForm locale={params.locale} />

      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1 border-slate-300 dark:border-slate-600" />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {tAuth('orContinueWith')}
        </span>
        <hr className="flex-1 border-slate-300 dark:border-slate-600" />
      </div>

      <GoogleLoginButton mode="login" />

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {tAuth('noAccount')}{' '}
        <Link
          href={`/${params.locale}/register` as never}
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          {tAuth('signUpLink')}
        </Link>
      </p>
    </div>
  );
}
