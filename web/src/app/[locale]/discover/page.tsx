'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';
import { LearnerSearchBar } from '@/components/discover/LearnerSearchBar';
import { LearnerResultsList } from '@/components/discover/LearnerResultsList';
import { useLearnerSearch } from '@/hooks/useLearnerSearch';

/**
 * Learner discovery page — search for PUBLIC learners by name or handle.
 *
 * Route: /[locale]/discover
 * Auth: required (redirected to login by middleware if unauthenticated)
 */
function DiscoverContent() {
  const t = useTranslations('discover');
  const { query, results, isLoading, setQuery } = useLearnerSearch();

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

      {!isLoading && (
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
