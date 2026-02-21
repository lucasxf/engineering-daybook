'use client';

import { Suspense, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ChooseHandleForm } from '@/components/auth/ChooseHandleForm';

function ChooseHandleContent() {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const tempToken = searchParams.get('t');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(`/${params.locale}/poks`);
    } else if (!tempToken) {
      router.replace(`/${params.locale}/login`);
    }
  }, [isLoading, isAuthenticated, tempToken, router, params.locale]);

  if (!tempToken || (!isLoading && isAuthenticated)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t('chooseHandleTitle')}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('chooseHandleSubtitle')}
        </p>
      </div>

      <ChooseHandleForm tempToken={decodeURIComponent(tempToken)} />
    </div>
  );
}

export default function ChooseHandlePage() {
  return (
    <Suspense>
      <ChooseHandleContent />
    </Suspense>
  );
}
