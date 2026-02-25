'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { PokList } from '@/components/poks/PokList';
import { QuickEntry } from '@/components/poks/QuickEntry';
import { SearchBar } from '@/components/poks/SearchBar';
import { SortDropdown } from '@/components/poks/SortDropdown';
import { NoSearchResults } from '@/components/poks/NoSearchResults';
import { ViewSwitcher } from '@/components/poks/ViewSwitcher';
import { TagGroupedView } from '@/components/poks/TagGroupedView';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/poks/EmptyState';
import { Toast } from '@/components/ui/Toast';
import { usePoksData } from '@/hooks/usePoksData';
import { useState } from 'react';

/**
 * Page for listing and searching POKs.
 *
 * Supports three view modes:
 * - Feed (default): paginated list ordered by active sort
 * - Tag-grouped (?view=tags): client-side grouped by tag, all learnings
 * - Timeline (/poks/timeline): a separate route (see timeline/page.tsx)
 *
 * State (keyword, sort, view) is held in URL search params.
 */
function PoksContent() {
  const t = useTranslations('poks');
  const searchParams = useSearchParams();
  const isTagsView = searchParams.get('view') === 'tags';

  // Feed view fetches paginated (size=20); tag-grouped needs all (size=1000)
  const fetchSize = isTagsView ? 1000 : 20;

  const {
    isReady,
    poks,
    totalElements,
    loading,
    error,
    keyword,
    sortOption,
    handleSearch,
    handleSortChange,
    handleClearSearch,
    handleQuickSave,
  } = usePoksData({ fetchSize });

  const [quickSaveToast, setQuickSaveToast] = useState(false);

  const handleQuickSaveWithToast = (pok: Parameters<typeof handleQuickSave>[0]) => {
    handleQuickSave(pok);
    setQuickSaveToast(true);
  };

  // Show spinner while auth is initializing or redirect is pending.
  // Keeping the SearchBar unmounted prevents it from firing onSearch → updateURL
  // (which adds ?page=0) before the redirect to /login completes.
  if (!isReady) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Determine which content to display
  const hasSearchOrFilter = !!keyword;
  const isEmptyResults = !loading && poks.length === 0;
  const showNoResults = isEmptyResults && hasSearchOrFilter;
  // Only show empty state when the list is genuinely empty — not when an API
  // error occurred (error === null is strict-null check, handles empty strings)
  const showEmptyState = isEmptyResults && !hasSearchOrFilter && error === null;

  return (
    <div className="mx-auto max-w-7xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('list.title')}
        </h1>
      </div>

      {/* Inline quick-entry */}
      <QuickEntry onSaved={handleQuickSaveWithToast} />

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
      ) : isTagsView ? (
        <TagGroupedView poks={poks} />
      ) : poks.length > 0 ? (
        <PokList poks={poks} />
      ) : null}

      {/* Results count (when not loading and has results) */}
      {!loading && poks.length > 0 && !isTagsView && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('list.resultsCount', { count: totalElements })}
        </div>
      )}

      {quickSaveToast && (
        <Toast
          message={t('success.created')}
          onDismiss={() => setQuickSaveToast(false)}
        />
      )}
    </div>
  );
}

export default function PoksPage() {
  return (
    <Suspense>
      <PoksContent />
    </Suspense>
  );
}
