import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeed, type FeedItem, type FeedPage } from '@/lib/learnerApi';

interface SocialFeedState {
  items: FeedItem[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  totalElements: number;
}

interface UseSocialFeedDataReturn extends SocialFeedState {
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const PAGE_SIZE = 20;

/**
 * Fetches and manages the social discovery feed (followed learners' learnings).
 * Supports pull-to-refresh and infinite scroll.
 */
export function useSocialFeedData(): UseSocialFeedDataReturn {
  const [state, setState] = useState<SocialFeedState>({
    items: [],
    loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: false,
    error: null,
    totalElements: 0,
  });

  const abortRef = useRef<AbortController | null>(null);
  const currentPageRef = useRef(0);

  // ---------------------------------------------------------------------------
  // Fetch a page
  // ---------------------------------------------------------------------------

  const fetchPage = useCallback(async (page: number): Promise<FeedPage | null> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      return await getFeed({ page, size: PAGE_SIZE });
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return null;
      throw e;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    currentPageRef.current = 0;

    fetchPage(0)
      .then((data) => {
        if (!data || cancelled) return;
        setState({
          items: data.content,
          loading: false,
          refreshing: false,
          loadingMore: false,
          hasMore: data.number < data.totalPages - 1,
          error: null,
          totalElements: data.totalElements,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: (e as Error).message ?? 'Failed to load',
        }));
      });

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [fetchPage]);

  // ---------------------------------------------------------------------------
  // Pull-to-refresh
  // ---------------------------------------------------------------------------

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, refreshing: true, error: null }));
    currentPageRef.current = 0;
    try {
      const data = await fetchPage(0);
      if (!data) {
        setState((prev) => ({ ...prev, refreshing: false }));
        return;
      }
      setState({
        items: data.content,
        loading: false,
        refreshing: false,
        loadingMore: false,
        hasMore: data.number < data.totalPages - 1,
        error: null,
        totalElements: data.totalElements,
      });
    } catch (e) {
      setState((prev) => ({
        ...prev,
        refreshing: false,
        error: (e as Error).message ?? 'Failed to refresh',
      }));
    }
  }, [fetchPage]);

  // ---------------------------------------------------------------------------
  // Infinite scroll
  // ---------------------------------------------------------------------------

  const loadMore = useCallback(async () => {
    if (state.loadingMore || !state.hasMore) return;

    const nextPage = currentPageRef.current + 1;
    setState((prev) => ({ ...prev, loadingMore: true }));

    try {
      const data = await fetchPage(nextPage);
      if (!data) {
        setState((prev) => ({ ...prev, loadingMore: false }));
        return;
      }
      currentPageRef.current = nextPage;
      setState((prev) => ({
        ...prev,
        items: [...prev.items, ...data.content],
        loadingMore: false,
        hasMore: data.number < data.totalPages - 1,
        totalElements: data.totalElements,
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        loadingMore: false,
        error: (e as Error).message ?? 'Failed to load more',
      }));
    }
  }, [fetchPage, state.loadingMore, state.hasMore]);

  return { ...state, refresh, loadMore };
}
