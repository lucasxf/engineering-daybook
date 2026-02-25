'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { pokApi, type Pok } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { SortOption } from '@/components/poks/SortDropdown';

interface UsePoksDataOptions {
  /** Number of items per page. Use 20 for paginated feed, 1000 for visualization views. */
  fetchSize: number;
}

export interface UsePoksDataReturn {
  /** True when auth check is complete and user is authenticated — safe to render protected content. */
  isReady: boolean;
  poks: Pok[];
  totalElements: number;
  loading: boolean;
  error: string | null;
  /** Current keyword derived from URL search params. */
  keyword: string;
  /** Current sort option derived from URL search params. Default: createdAt DESC. */
  sortOption: SortOption;
  /** Current page derived from URL search params. Default: 0. */
  page: number;
  handleSearch: (keyword: string) => void;
  handleSortChange: (sortOption: SortOption) => void;
  handleClearSearch: () => void;
  /** Optimistically prepends a newly created pok to the list without a full reload. */
  handleQuickSave: (pok: Pok) => void;
}

/** Default sort: newest first (createdAt DESC). Omitted from URL when active. */
const DEFAULT_SORT: SortOption = { sortBy: 'createdAt', sortDirection: 'DESC' };

/**
 * Shared data hook for all poks views (feed, tag-grouped, timeline).
 *
 * Centralises auth-guard, data loading, URL state management, and the
 * updateURL logic previously scattered across poks/page.tsx.
 *
 * URL is the single source of truth for keyword, sort, and page — components
 * call the returned handlers, which update the URL, which triggers a re-render
 * with updated params, which re-fires data loading.
 */
export function usePoksData({ fetchSize }: UsePoksDataOptions): UsePoksDataReturn {
  const t = useTranslations('poks');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Derive all shareable state directly from the URL
  const keyword = searchParams.get('keyword') || '';
  const sortBy = (searchParams.get('sortBy') as SortOption['sortBy']) || DEFAULT_SORT.sortBy;
  const sortDirection =
    (searchParams.get('sortDirection') as SortOption['sortDirection']) || DEFAULT_SORT.sortDirection;
  const sortOption: SortOption = { sortBy, sortDirection };
  const page = parseInt(searchParams.get('page') || '0', 10);
  const view = searchParams.get('view') || '';

  const [poks, setPoks] = useState<Pok[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isReady = !authLoading && isAuthenticated;

  // Update URL, staying on the current path and preserving the view param
  const updateURL = useCallback(
    (newKeyword: string, newSortOption: SortOption) => {
      const newParams = new URLSearchParams();

      if (newKeyword) newParams.set('keyword', newKeyword);

      // Omit sort params when they match the default (createdAt DESC) so the
      // URL stays clean for the most common case
      if (
        newSortOption.sortBy !== DEFAULT_SORT.sortBy ||
        newSortOption.sortDirection !== DEFAULT_SORT.sortDirection
      ) {
        newParams.set('sortBy', newSortOption.sortBy);
        newParams.set('sortDirection', newSortOption.sortDirection);
      }

      // Preserve the current view toggle (e.g. ?view=tags)
      if (view) newParams.set('view', view);

      newParams.set('page', '0'); // always reset to first page on filter/sort change

      const qs = newParams.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ''}` as never, { scroll: false });
    },
    [pathname, router, view]
  );

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${params.locale}/login` as never);
    }
  }, [authLoading, isAuthenticated, router, params.locale]);

  // Fetch poks whenever the URL-derived params change
  const loadPoks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await pokApi.getAll({
        keyword: keyword || undefined,
        sortBy,
        sortDirection,
        page,
        size: fetchSize,
      });
      setPoks(result.content);
      setTotalElements(result.totalElements);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message || t('errors.unexpected'));
      } else {
        setError(t('errors.unexpected'));
      }
    } finally {
      setLoading(false);
    }
  }, [keyword, sortBy, sortDirection, page, fetchSize, t]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPoks();
    }
  }, [loadPoks, isAuthenticated]);

  const handleSearch = useCallback(
    (newKeyword: string) => {
      updateURL(newKeyword, sortOption);
    },
    [sortOption, updateURL]
  );

  const handleSortChange = useCallback(
    (newSortOption: SortOption) => {
      updateURL(keyword, newSortOption);
    },
    [keyword, updateURL]
  );

  const handleClearSearch = useCallback(() => {
    updateURL('', sortOption);
  }, [sortOption, updateURL]);

  const handleQuickSave = useCallback((pok: Pok) => {
    setPoks((prev) => [pok, ...prev]);
    setTotalElements((prev) => prev + 1);
  }, []);

  return {
    isReady,
    poks,
    totalElements,
    loading,
    error,
    keyword,
    sortOption,
    page,
    handleSearch,
    handleSortChange,
    handleClearSearch,
    handleQuickSave,
  };
}
