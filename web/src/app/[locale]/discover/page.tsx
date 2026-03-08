'use client';

import { Suspense, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { LearnerSearchBar } from '@/components/discover/LearnerSearchBar';
import { LearnerResultsList } from '@/components/discover/LearnerResultsList';
import { useLearnerSearch } from '@/hooks/useLearnerSearch';

/**
 * Learner discovery page — search for PUBLIC learners by name or handle.
 *
 * Route: /[locale]/discover
 * Auth: required (redirected to login when unauthenticated)
 */
function DiscoverContent() {
  const t = useTranslations('discover');
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { query, results, isLoading, error, setQuery } = useLearnerSearch();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${params.locale}/login` as never);
    }
  }, [authLoading, isAuthenticated, router, params.locale]);

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h2>

      <div className="mb-6">
        <LearnerSearchBar value={query} onChange={setQuery} />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8" aria-label="Searching learners">
          <Spinner />
        </div>
      )}

      {!isLoading && error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">{t('errors.searchFailed')}</p>
      )}

      {!isLoading && !error && (
        <LearnerResultsList results={results} query={query} />
      )}
    </div>
  );
}

/**
 * Discover page with Suspense boundary (required for useSearchParams compatibility).
 */
export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverContent />
    </Suspense>
  );
}
