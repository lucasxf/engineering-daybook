'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getFeed } from '@/lib/learnerApi';
import type { FeedItem, FeedPage } from '@/lib/pokApi';

interface UseFeedDataState {
  items: FeedItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

interface UseFeedDataResult extends UseFeedDataState {
  goToPage: (page: number) => void;
  refresh: () => void;
}

const PAGE_SIZE = 20;

/**
 * Fetches and manages the discovery feed (social feed) for the authenticated user.
 *
 * @returns feed items, pagination state, and page-navigation helpers
 */
export function useFeedData(): UseFeedDataResult {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [state, setState] = useState<UseFeedDataState>({
    items: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    isLoading: true,
    error: null,
  });

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${params.locale}/login` as never);
    }
  }, [authLoading, isAuthenticated, router, params.locale]);

  const loadPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    getFeed({ page, size: PAGE_SIZE })
      .then((data: FeedPage) => {
        setState({
          items: data.content,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          currentPage: data.number,
          isLoading: false,
          error: null,
        });
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load feed',
        }));
      });
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadPage(0);
    }
  }, [authLoading, isAuthenticated, loadPage]);

  return {
    ...state,
    goToPage: loadPage,
    refresh: () => loadPage(state.currentPage),
  };
}
