'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TopNav from '@/components/learning-feed/TopNav';
import PageHeader from '@/components/learning-feed/PageHeader';
import SearchSortToolbar from '@/components/learning-feed/SearchSortToolbar';
import LearningCardList from '@/components/learning-feed/LearningCardList';
import PaginationControls from '@/components/learning-feed/PaginationControls';
import EmptyState from '@/components/learning-feed/EmptyState';
import LoadingState from '@/components/learning-feed/LoadingState';
import ErrorState from '@/components/learning-feed/ErrorState';
import NoResultsState from '@/components/learning-feed/NoResultsState';

export interface Learning {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function LearningFeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query parameters
  const keyword = searchParams.get('keyword') || '';
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as string;
  const sortDirection = (searchParams.get('sortDirection') || 'DESC') as 'ASC' | 'DESC';
  const pageStr = searchParams.get('page') || '1';
  const page = Math.max(1, parseInt(pageStr));

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const isEmpty = totalItems === 0 && !keyword;
  const hasNoResults = !keyword && isLoading === false;

  // Mock data for demonstration
  const mockLearnings: Learning[] = [
    {
      id: '1',
      title: 'React Server Components',
      content: 'Learned about the new React Server Components pattern. Allows rendering components on the server and sending minimal JavaScript to the browser. Great for performance optimization.',
      tags: ['react', 'performance'],
      createdAt: '2024-01-14T10:00:00Z',
      updatedAt: '2024-01-14T10:00:00Z',
    },
    {
      id: '2',
      title: 'TypeScript Generics',
      content: 'Deep dive into TypeScript generics. Understanding how to write reusable components and functions with type safety. Key concepts: constraints, default types, and conditional types.',
      tags: ['typescript', 'programming'],
      createdAt: '2024-01-13T14:30:00Z',
      updatedAt: '2024-01-13T14:30:00Z',
    },
    {
      id: '3',
      title: 'CSS Grid Layout',
      content: 'Mastered CSS Grid for complex layouts. Learned about grid areas, auto-placement, and responsive design patterns. Much more powerful than flexbox for 2D layouts.',
      tags: ['css', 'design'],
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-11T15:45:00Z',
    },
    {
      id: '4',
      title: 'API Rate Limiting',
      content: 'Implemented rate limiting for API endpoints using Redis. Learned about token bucket algorithm and exponential backoff strategies for retries.',
      tags: ['backend', 'api', 'redis'],
      createdAt: '2024-01-11T11:20:00Z',
      updatedAt: '2024-01-11T11:20:00Z',
    },
    {
      id: '5',
      title: 'Next.js 16 Features',
      content: 'Explored the new features in Next.js 16. Learned about improved caching APIs with revalidateTag and updateTag. Also studied the new Cache Components pattern with use cache directive.',
      tags: ['next.js', 'web-development'],
      createdAt: '2024-01-10T16:00:00Z',
      updatedAt: '2024-01-10T16:00:00Z',
    },
  ];

  // Simulated loading effect
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setLearnings(mockLearnings);
      setTotalItems(mockLearnings.length);
      setIsLoading(false);
      setError(null);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, sortBy, sortDirection, page]);

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams();
      if (query) {
        params.set('keyword', query);
        params.set('page', '1');
      }
      router.push(`?${params.toString()}`);
    },
    [router]
  );

  const handleSort = useCallback(
    (newSortBy: string, newSortDirection: 'ASC' | 'DESC') => {
      const params = new URLSearchParams(searchParams);
      params.set('sortBy', newSortBy);
      params.set('sortDirection', newSortDirection);
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleClearSearch = useCallback(() => {
    router.push('?');
  }, [router]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', newPage.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleNewLearning = useCallback(() => {
    router.push('/learning/new');
  }, [router]);

  return (
    <div className="min-h-screen bg-background dark:bg-deep-navy">
      <TopNav />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <PageHeader
          totalCount={totalItems}
          onNewLearning={handleNewLearning}
        />

        {isEmpty && !isLoading ? (
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

            {error ? (
              <ErrorState onRetry={() => router.refresh()} />
            ) : isLoading ? (
              <LoadingState />
            ) : learnings.length === 0 ? (
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
      </main>
    </div>
  );
}
