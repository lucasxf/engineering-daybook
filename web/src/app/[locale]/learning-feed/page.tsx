'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import PageHeader from '@/components/learning-feed/PageHeader';
import SearchSortToolbar from '@/components/learning-feed/SearchSortToolbar';
import LearningCardList from '@/components/learning-feed/LearningCardList';
import PaginationControls from '@/components/learning-feed/PaginationControls';
import EmptyState from '@/components/learning-feed/EmptyState';
import LoadingState from '@/components/learning-feed/LoadingState';
import ErrorState from '@/components/learning-feed/ErrorState';
import NoResultsState from '@/components/learning-feed/NoResultsState';
import { pokApi, type FeedItem } from '@/lib/pokApi';
import { useAuth } from '@/hooks/useAuth';

const ITEMS_PER_PAGE = 10;

function LearningFeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ locale: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // State management
  const [learnings, setLearnings] = useState<FeedItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query parameters
  const keyword = searchParams.get('keyword') ?? '';
  const sortBy = (searchParams.get('sortBy') ?? 'createdAt') as 'createdAt' | 'updatedAt';
  const sortDirection = (searchParams.get('sortDirection') ?? 'DESC') as 'ASC' | 'DESC';
  const pageStr = searchParams.get('page') ?? '1';
  const page = Math.max(1, parseInt(pageStr, 10));

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const isEmpty = !isLoading && totalItems === 0 && !keyword;
  const hasNoResults = !isLoading && learnings.length === 0 && keyword !== '';

  // Auth guard — redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${params.locale}/login`);
    }
  }, [authLoading, isAuthenticated, router, params.locale]);

  // Load data from real API
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    setIsLoading(true);

    pokApi
      .getAll({
        keyword: keyword || undefined,
        sortBy,
        sortDirection,
        page: page - 1, // backend is 0-indexed
        size: ITEMS_PER_PAGE,
        ...(keyword ? { searchMode: 'hybrid' } : {}),
      })
      .then((result) => {
        if (cancelled) return;
        setLearnings(result.content);
        setTotalItems(result.totalElements);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('failed');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, keyword, sortBy, sortDirection, page]);

  const handleSearch = useCallback(
    (query: string) => {
      const p = new URLSearchParams(searchParams);
      if (query) {
        p.set('keyword', query);
      } else {
        p.delete('keyword');
      }
      p.set('page', '1');
      router.push(`?${p.toString()}`);
    },
    [router, searchParams]
  );

  const handleSort = useCallback(
    (newSortBy: string, newSortDirection: 'ASC' | 'DESC') => {
      const p = new URLSearchParams(searchParams);
      p.set('sortBy', newSortBy);
      p.set('sortDirection', newSortDirection);
      p.set('page', '1');
      router.push(`?${p.toString()}`);
    },
    [router, searchParams]
  );

  const handleClearSearch = useCallback(() => {
    router.push('?');
  }, [router]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const p = new URLSearchParams(searchParams);
      p.set('page', newPage.toString());
      router.push(`?${p.toString()}`);
    },
    [router, searchParams]
  );

  const handleNewLearning = useCallback(() => {
    router.push(`/${params.locale}/poks/new`);
  }, [router, params.locale]);

  // Show loading while auth is initializing
  if (authLoading) {
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
              sortBy={sortBy}
              sortDirection={sortDirection}
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
                    currentPage={page}
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
