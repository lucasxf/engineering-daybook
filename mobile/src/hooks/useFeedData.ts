import { useCallback, useEffect, useRef, useState } from 'react';
import { pokApi, type Pok, type PokPage, type PokSearchParams } from '@/lib/pokApi';

interface FeedState {
  poks: Pok[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  totalElements: number;
}

interface UseFeedDataReturn extends FeedState {
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setParams: (params: PokSearchParams) => void;
}

const PAGE_SIZE = 20;

export function useFeedData(initialParams?: PokSearchParams): UseFeedDataReturn {
  const [params, setParamsState] = useState<PokSearchParams>({
    page: 0,
    size: PAGE_SIZE,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    ...initialParams,
  });

  const [state, setState] = useState<FeedState>({
    poks: [],
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

  const fetchPage = useCallback(
    async (page: number, _refreshing: boolean): Promise<PokPage | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        return await pokApi.getAll({ ...params, page, size: PAGE_SIZE }, controller.signal);
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return null;
        throw e;
      }
    },
    [params]
  );

  // ---------------------------------------------------------------------------
  // Initial load / param change → reset to page 0
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    currentPageRef.current = 0;

    fetchPage(0, false)
      .then((data) => {
        if (!data || cancelled) return;
        setState({
          poks: data.content,
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
      const data = await fetchPage(0, true);
      if (!data) {
        setState((prev) => ({ ...prev, refreshing: false }));
        return;
      }
      setState({
        poks: data.content,
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
      const data = await fetchPage(nextPage, false);
      if (!data) {
        setState((prev) => ({ ...prev, loadingMore: false }));
        return;
      }
      currentPageRef.current = nextPage;
      setState((prev) => ({
        ...prev,
        poks: [...prev.poks, ...data.content],
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

  // ---------------------------------------------------------------------------
  // Update params (resets to page 0 via the params effect above)
  // ---------------------------------------------------------------------------

  const setParams = useCallback((newParams: PokSearchParams) => {
    setParamsState((prev) => ({ ...prev, ...newParams, page: 0 }));
  }, []);

  return { ...state, refresh, loadMore, setParams };
}
