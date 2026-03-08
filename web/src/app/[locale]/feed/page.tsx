'use client';

import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FeedList } from '@/components/feed/FeedList';
import { FeedEmptyState } from '@/components/feed/FeedEmptyState';
import { useFeedData } from '@/hooks/useFeedData';

/**
 * Discovery feed page — shows learnings from learners the user follows.
 *
 * Route: /[locale]/feed
 * Auth: required (redirected to login by middleware if unauthenticated)
 */
export default function FeedPage() {
  const t = useTranslations('feed');
  const { items, totalElements, totalPages, currentPage, isLoading, error, goToPage, refresh } =
    useFeedData();

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h2>

      {isLoading && (
        <div className="flex justify-center py-12" aria-label="Loading feed">
          <Spinner />
        </div>
      )}

      {!isLoading && error !== null && (
        <Alert variant="error" role="alert">
          {error}
        </Alert>
      )}

      {!isLoading && error === null && items.length === 0 && <FeedEmptyState />}

      {!isLoading && error === null && items.length > 0 && (
        <>
          <FeedList items={items} onShareRemoved={refresh} />

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                disabled={currentPage === 0}
                onClick={() => goToPage(currentPage - 1)}
              >
                ←
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={currentPage >= totalPages - 1}
                onClick={() => goToPage(currentPage + 1)}
              >
                →
              </Button>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
            {totalElements} item{totalElements !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}
