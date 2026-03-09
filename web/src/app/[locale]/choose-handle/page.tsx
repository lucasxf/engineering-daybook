'use client';

import { Suspense, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ChooseHandleForm } from '@/components/auth/ChooseHandleForm';
import { cn } from '@/lib/utils';

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
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center px-4 py-12',
        'bg-[#0F1B2D]'
      )}
    >
      {/* Page header — wordmark only, no nav */}
      <header className="mb-10 text-center">
        <span className="wordmark text-2xl tracking-tight text-[#F5F0E8]">
          <span className="wordmark-regular">learn</span>
          <span className="wordmark-bold">imo</span>
        </span>
      </header>

      {/* Card */}
      <div
        className={cn(
          'w-full max-w-[480px] rounded-xl border p-8 space-y-6',
          'bg-[#1A365D] border-[#2B4A78]'
        )}
      >
        {/* Hero heading */}
        <div className="space-y-2 text-center">
          <h1
            className={cn(
              'font-heading text-3xl font-semibold text-balance',
              'text-[#F5F0E8]'
            )}
            style={{ fontFamily: 'var(--font-sora), Sora, sans-serif' }}
          >
            {t('chooseHandleTitle')}
          </h1>
          <p className="text-sm leading-relaxed text-[#8899AA]">
            {t('chooseHandleSubtitle')}
          </p>
          <p className="text-xs leading-relaxed text-[#8899AA]/70 italic">
            {t('chooseHandlePermanentNote')}
          </p>
        </div>

        {/* Form */}
        <ChooseHandleForm tempToken={decodeURIComponent(tempToken)} />
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center">
        <button
          type="button"
          onClick={() => router.push(`/${params.locale}/login` as never)}
          className={cn(
            'text-sm transition-colors',
            'text-[#8899AA] hover:text-[#D4854A]',
            'focus-visible:outline-none focus-visible:underline'
          )}
        >
          {t('chooseHandleWrongAccount')}
        </button>
      </footer>
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
