'use client';

import { Suspense, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ChooseHandleForm } from '@/components/auth/ChooseHandleForm';
import { cn } from '@/lib/utils';

function ChooseHandleContent() {
  const t = useTranslations('auth');
  const { resolvedTheme } = useTheme();
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const isDark = resolvedTheme === 'dark';

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
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: isDark ? '#0F1B2D' : '#F5F0E8' }}
    >
      {/* Page header — wordmark only, no nav */}
      <header className="mb-10 text-center">
        <span
          className="wordmark text-2xl tracking-tight"
          style={{ color: isDark ? '#F5F0E8' : '#1A1A2E' }}
        >
          <span className="wordmark-regular">learn</span>
          <span className="wordmark-bold">imo</span>
        </span>
      </header>

      {/* Card */}
      <div
        className="w-full max-w-[480px] rounded-xl border p-8 space-y-6"
        style={{
          backgroundColor: isDark ? '#1A365D' : 'white',
          borderColor: isDark ? '#2B4A78' : '#E8E4DF',
        }}
      >
        {/* Hero heading */}
        <div className="space-y-2 text-center">
          <h1
            className="font-heading text-3xl font-semibold text-balance"
            style={{
              fontFamily: 'var(--font-sora), Sora, sans-serif',
              color: isDark ? '#F5F0E8' : '#1A1A2E',
            }}
          >
            {t('chooseHandleTitle')}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#8899AA' }}>
            {t('chooseHandleSubtitle')}
          </p>
          <p className="text-xs leading-relaxed italic" style={{ color: 'rgba(136, 153, 170, 0.7)' }}>
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
            'hover:text-[#D4854A]',
            'focus-visible:outline-none focus-visible:underline'
          )}
          style={{ color: isDark ? '#8899AA' : '#666666' }}
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
