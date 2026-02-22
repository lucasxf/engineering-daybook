'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

function ForgotPasswordContent() {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t('forgotPasswordTitle')}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('forgotPasswordSubtitle')}
        </p>
      </div>

      <ForgotPasswordForm />

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

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  );
}
