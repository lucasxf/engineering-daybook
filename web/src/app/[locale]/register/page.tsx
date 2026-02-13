'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    redirect(`/${params.locale}`);
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t('registerTitle')}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('registerSubtitle')}
        </p>
      </div>

      <RegisterForm locale={params.locale} />

      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1 border-slate-300 dark:border-slate-600" />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('orContinueWith')}
        </span>
        <hr className="flex-1 border-slate-300 dark:border-slate-600" />
      </div>

      <GoogleLoginButton mode="register" />

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {t('hasAccount')}{' '}
        <Link
          href={`/${params.locale}/login` as never}
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          {t('logInLink')}
        </Link>
      </p>
    </div>
  );
}
