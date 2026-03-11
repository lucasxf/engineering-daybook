'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { RegisterFormV2 } from '@/components/auth/RegisterFormV2';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(`/${params.locale}/poks`);
    }
  }, [isLoading, isAuthenticated, router, params.locale]);

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t('registerTitle')}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('registerSubtitle')}
        </p>
      </div>

      <RegisterFormV2 locale={params.locale} />
    </div>
  );
}
