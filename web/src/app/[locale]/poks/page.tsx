'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PokList } from '@/components/poks/PokList';
import { QuickEntry } from '@/components/poks/QuickEntry';
import { SearchBar } from '@/components/poks/SearchBar';
import { SortDropdown, type SortOption } from '@/components/poks/SortDropdown';
import { NoSearchResults } from '@/components/poks/NoSearchResults';
import { pokApi, type Pok, type PokSearchParams } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/poks/EmptyState';
import { Toast } from '@/components/ui/Toast';

/**
 * Page for listing and searching POKs.
 *
 * Features:
 * - Keyword search (debounced)
 * - Sort by createdAt/updatedAt (ASC/DESC)
 * - Pagination
 * - URL state management (bookmarkable)
 * - Loading, error, empty, and no-results states
 */
function PoksContent() {
  const t = useTranslations('poks');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [poks, setPoks] = useState<Pok[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickSaveToast, setQuickSaveToast] = useState(false);

  // Read initial state from URL
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [sortOption, setSortOption] = useState<SortOption>({
    sortBy: (searchParams.get('sortBy') as 'createdAt' | 'updatedAt') || 'updatedAt',
    sortDirection: (searchParams.get('sortDirection') as 'ASC' | 'DESC') || 'DESC',
  });

  // Derive page from URL directly so it updates reactively when URL changes
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Update URL when search/sort params change
  const updateURL = useCallback(
    (newKeyword: string, newSortOption: SortOption) => {
      const newParams = new URLSearchParams();

      if (newKeyword) newParams.set('keyword', newKeyword);
      if (newSortOption.sortBy !== 'updatedAt' || newSortOption.sortDirection !== 'DESC') {
        newParams.set('sortBy', newSortOption.sortBy);
        newParams.set('sortDirection', newSortOption.sortDirection);
      }
      newParams.set('page', '0'); // Reset to first page on search/sort change

      const queryString = newParams.toString();
      router.push(`/${params.locale}/poks${queryString ? `?${queryString}` : ''}` as never, {
        scroll: false,
      });
    },
    [params.locale, router]
  );

  // Load POKs with current search/filter/sort parameters
  const loadPoks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParamsObj: PokSearchParams = {
        keyword: keyword || undefined,
        sortBy: sortOption.sortBy,
        sortDirection: sortOption.sortDirection,
        page,
        size: 20,
      };

      const result = await pokApi.getAll(searchParamsObj);
      setPoks(result.content);
      setTotalElements(result.totalElements);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    } finally {
      setLoading(false);
    }
  }, [keyword, sortOption, page, t]);

  // Load POKs on mount and when search params change
  useEffect(() => {
    loadPoks();
  }, [loadPoks]);

  // Handle search
  const handleSearch = useCallback(
    (newKeyword: string) => {
      setKeyword(newKeyword);
      updateURL(newKeyword, sortOption);
    },
    [sortOption, updateURL]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSortOption: SortOption) => {
      setSortOption(newSortOption);
      updateURL(keyword, newSortOption);
    },
    [keyword, updateURL]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setKeyword('');
    updateURL('', sortOption);
  }, [sortOption, updateURL]);

  // Handle quick-entry save: prepend new learning to current list
  const handleQuickSave = useCallback((pok: Pok) => {
    setPoks((prev) => [pok, ...prev]);
    setTotalElements((prev) => prev + 1);
    setQuickSaveToast(true);
  }, []);

  // Determine which content to display
  const hasSearchOrFilter = !!keyword;
  const isEmptyResults = !loading && poks.length === 0;
  const showNoResults = isEmptyResults && hasSearchOrFilter;
  // Only show empty state when the list is genuinely empty — not when an API error occurred.
  // An API error (401, 500, network) leaves poks=[] which would otherwise show the empty
  // state, making the user think their data is gone.
  const showEmptyState = isEmptyResults && !hasSearchOrFilter && !error;

  return (
    <div className="mx-auto max-w-7xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('list.title')}
        </h1>
      </div>

      {/* Inline quick-entry */}
      <QuickEntry onSaved={handleQuickSave} />

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
      ) : poks.length > 0 ? (
        <PokList poks={poks} />
      ) : null}

      {/* Results count (when not loading and has results) */}
      {!loading && poks.length > 0 && (
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
