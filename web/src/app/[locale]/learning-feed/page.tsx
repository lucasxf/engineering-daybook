'use client';

import { useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import PageHeader from '@/components/learning-feed/PageHeader';
import SearchSortToolbar from '@/components/learning-feed/SearchSortToolbar';
import LearningCardList from '@/components/learning-feed/LearningCardList';
import PaginationControls from '@/components/learning-feed/PaginationControls';
import EmptyState from '@/components/learning-feed/EmptyState';
import LoadingState from '@/components/learning-feed/LoadingState';
import ErrorState from '@/components/learning-feed/ErrorState';
import NoResultsState from '@/components/learning-feed/NoResultsState';
import { usePoksData } from '@/hooks/usePoksData';
import type { OwnedPok } from '@/lib/pokApi';

const ITEMS_PER_PAGE = 10;

function LearningFeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ locale: string }>();

  const {
    isReady,
    poks: learnings,
    totalElements: totalItems,
    loading: isLoading,
    error,
    keyword,
    sortOption,
    page,
    handleSearch,
    handleSortChange,
    handleClearSearch,
  } = usePoksData({ fetchSize: ITEMS_PER_PAGE });

  // usePoksData.page is 0-indexed; PaginationControls expects 1-indexed
  const currentPage = page + 1;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Pre-filter to owned POKs: the backend returns a mixed feed (owned + re-learnings) when no
  // keyword/tag filter is active, but this page scopes to authored content only.
  // Note: totalItems still comes from the backend and may include re-learnings, so pagination
  // counts can be slightly off. A dedicated owned-only API param would fix this fully.
  const ownedLearnings = learnings.filter((l): l is OwnedPok => l.type === 'owned');

  const isEmpty = !isLoading && ownedLearnings.length === 0 && !keyword;
  const hasNoResults = !isLoading && ownedLearnings.length === 0 && keyword !== '';

  // Adapter: SearchSortToolbar passes (sortBy, sortDirection) separately;
  // usePoksData.handleSortChange expects a SortOption object
  const handleSort = useCallback(
    (newSortBy: string, newSortDirection: 'ASC' | 'DESC') => {
      handleSortChange({ sortBy: newSortBy as 'createdAt' | 'updatedAt', sortDirection: newSortDirection });
    },
    [handleSortChange]
  );

  // Page navigation: PaginationControls gives 1-indexed pages; usePoksData stores 0-indexed in URL
  const handlePageChange = useCallback(
    (newDisplayPage: number) => {
      const p = new URLSearchParams(searchParams);
      p.set('page', (newDisplayPage - 1).toString());
      router.push(`?${p.toString()}`);
    },
    [router, searchParams]
  );

  const handleNewLearning = useCallback(() => {
    router.push(`/${params.locale}/poks/new`);
  }, [router, params.locale]);

  if (!isReady) {
    return <LoadingState />;
  }

  return (
    <div className="mx-auto max-w-3xl">
        <PageHeader
          totalCount={totalItems}
          onNewLearning={handleNewLearning}
        />

        {isEmpty ? (
          <EmptyState onNewLearning={handleNewLearning} />
        ) : (
          <>
            <SearchSortToolbar
              keyword={keyword}
              sortBy={sortOption.sortBy}
              sortDirection={sortOption.sortDirection}
              onSearch={handleSearch}
              onSort={handleSort}
              onClearSearch={handleClearSearch}
              isSearching={isLoading && keyword !== ''}
            />

            {error !== null ? (
              <ErrorState onRetry={() => router.refresh()} />
            ) : isLoading ? (
              <LoadingState />
            ) : hasNoResults ? (
              <NoResultsState
                query={keyword}
                onClearSearch={handleClearSearch}
                onNewLearning={handleNewLearning}
              />
            ) : (
              <>
                <LearningCardList learnings={ownedLearnings} />
                {totalPages > 1 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        )}
    </div>
  );
}

export default function LearningFeedPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LearningFeedContent />
    </Suspense>
  );
}
