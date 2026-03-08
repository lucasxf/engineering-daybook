'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { pokApi, type Pok, type FeedItem } from '@/lib/pokApi';
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
  /** Feed items — owned POKs and re-learnings (mixed when no filters; owned-only when searching). */
  poks: FeedItem[];
  totalElements: number;
  loading: boolean;
  error: string | null;
  /** Current keyword derived from URL search params. */
  keyword: string;
  /** Current sort option derived from URL search params. Default: createdAt DESC. */
  sortOption: SortOption;
  /** Current page derived from URL search params. Default: 0. */
  page: number;
  /** Currently active tag filter (tagId UUID string), or null if not filtering by tag. */
  selectedTagId: string | null;
  handleSearch: (keyword: string) => void;
  handleSortChange: (sortOption: SortOption) => void;
  handleClearSearch: () => void;
  /** Filters the feed by tag. Pass null to clear the filter. Clears keyword. */
  handleTagFilter: (tagId: string | null) => void;
  /** Optimistically prepends a newly created owned pok to the list without a full reload. */
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
  const sortOption: SortOption = useMemo(() => ({ sortBy, sortDirection }), [sortBy, sortDirection]);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const view = searchParams.get('view') || '';
  const selectedTagId = searchParams.get('tagId') || null;

  const [poks, setPoks] = useState<FeedItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isReady = !authLoading && isAuthenticated;

  // Update URL, staying on the current path and preserving the view param.
  // newTagId defaults to the current tagId so sort/search changes preserve the active filter.
  const updateURL = useCallback(
    (newKeyword: string, newSortOption: SortOption, newTagId: string | null = selectedTagId) => {
      const newParams = new URLSearchParams();

      if (newKeyword) newParams.set('keyword', newKeyword);
      if (newTagId) newParams.set('tagId', newTagId);

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
    [pathname, router, view, selectedTagId]
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
        keyword: selectedTagId ? undefined : (keyword || undefined),
        // Only send searchMode when there is a keyword to search — it's meaningless otherwise,
        // and sending it forces the backend into search mode (owned POKs only), preventing
        // re-learnings from appearing in the default feed.
        searchMode: (keyword && !selectedTagId) ? 'hybrid' : undefined,
        tagId: selectedTagId || undefined,
        sortBy,
        sortDirection,
        page,
        size: fetchSize,
      });
      // getAll returns PokListPage (PokPage | FeedPage).
      // When no keyword/tag filter is active the backend returns FeedPage (mixed feed with
      // re-learnings). When filters are present it returns PokPage (owned POKs only).
      // Both shapes are compatible with FeedItem[] — PokShare items carry originalPokId.
      setPoks(result.content as FeedItem[]);
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
  }, [keyword, selectedTagId, sortBy, sortDirection, page, fetchSize, t]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPoks();
    }
  }, [loadPoks, isAuthenticated]);

  const handleSearch = useCallback(
    (newKeyword: string) => {
      // Searching clears the tag filter (keyword and tag filter are mutually exclusive)
      updateURL(newKeyword, sortOption, null);
    },
    [sortOption, updateURL]
  );

  const handleTagFilter = useCallback(
    (tagId: string | null) => {
      // Tag filter clears keyword (tag filter and keyword search are mutually exclusive)
      updateURL('', sortOption, tagId);
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
    updateURL('', sortOption, null);
  }, [sortOption, updateURL]);

  const handleQuickSave = useCallback((pok: Pok) => {
    // Newly-created poks are always owned; add the type discriminant so the item
    // is a valid FeedItem (Pok & { type: 'owned' }).
    const feedItem: FeedItem = { ...pok, type: 'owned' as const };
    setPoks((prev) => [feedItem, ...prev]);
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
    selectedTagId,
    handleSearch,
    handleSortChange,
    handleClearSearch,
    handleTagFilter,
    handleQuickSave,
  };
}
