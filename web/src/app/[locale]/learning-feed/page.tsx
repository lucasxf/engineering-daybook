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
import TopNav from '@/components/learning-feed/TopNav';
import { usePoksData } from '@/hooks/usePoksData';

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
  const isEmpty = !isLoading && totalItems === 0 && !keyword;
  const hasNoResults = !isLoading && learnings.length === 0 && keyword !== '';

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
                <LearningCardList learnings={learnings} />
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
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="py-8 px-4">
        <Suspense fallback={<LoadingState />}>
          <LearningFeedContent />
        </Suspense>
      </main>
    </div>
  );
}
