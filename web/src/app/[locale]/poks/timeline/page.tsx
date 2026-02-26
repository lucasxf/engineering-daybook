'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { ViewSwitcher } from '@/components/poks/ViewSwitcher';
import { SearchBar } from '@/components/poks/SearchBar';
import { SortDropdown } from '@/components/poks/SortDropdown';
import { TimelineView } from '@/components/poks/TimelineView';
import { NoSearchResults } from '@/components/poks/NoSearchResults';
import { EmptyState } from '@/components/poks/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { usePoksData } from '@/hooks/usePoksData';

/**
 * Timeline view: learnings grouped by month/year, newest group first.
 *
 * Accessible at `/[locale]/poks/timeline` — a bookmarkable dedicated route.
 * Fetches all learnings (size=1000) for client-side grouping.
 *
 * Auth guard, data fetching, URL state, and sort/keyword handling are all
 * provided by usePoksData; this page only adds the timeline-specific layout.
 */
function TimelineContent() {
  const t = useTranslations('poks');

  const {
    isReady,
    poks,
    loading,
    error,
    keyword,
    sortOption,
    handleSearch,
    handleSortChange,
    handleClearSearch,
  } = usePoksData({ fetchSize: 1000 });

  if (!isReady) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const hasSearchOrFilter = !!keyword;
  const isEmptyResults = !loading && poks.length === 0;
  const showNoResults = isEmptyResults && hasSearchOrFilter;
  const showEmptyState = isEmptyResults && !hasSearchOrFilter && error === null;

  return (
    <div className="mx-auto max-w-7xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('timeline.title')}
        </h1>
      </div>

      {/* View switcher */}
      <div className="mb-4">
        <ViewSwitcher />
      </div>

      {/* Search and Sort Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <SearchBar onSearch={handleSearch} initialValue={keyword} />
        </div>
        <div>
          <SortDropdown value={sortOption} onChange={handleSortChange} />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner />
        </div>
      ) : showNoResults ? (
        <NoSearchResults onClearSearch={handleClearSearch} />
      ) : showEmptyState ? (
        <EmptyState />
      ) : (
        <TimelineView poks={poks} />
      )}
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense>
      <TimelineContent />
    </Suspense>
  );
}
