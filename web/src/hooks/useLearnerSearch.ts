'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchLearners } from '@/lib/learnerApi';
import type { LearnerSearchResult } from '@/lib/learnerApi';

interface UseLearnerSearchState {
  results: LearnerSearchResult[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  query: string;
}

interface UseLearnerSearchResult extends UseLearnerSearchState {
  setQuery: (q: string) => void;
  goToPage: (page: number) => void;
}

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

/**
 * Debounced learner search hook.
 *
 * Fires the search API 300 ms after the user stops typing.
 * Queries shorter than 2 characters return an empty result set immediately.
 */
export function useLearnerSearch(): UseLearnerSearchResult {
  const [state, setState] = useState<UseLearnerSearchState>({
    results: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    isLoading: false,
    error: null,
    query: '',
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeSearch = useCallback((q: string, page: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    searchLearners(q, { page, size: PAGE_SIZE })
      .then((data) => {
        setState((prev) => ({
          ...prev,
          results: data.content,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          currentPage: data.number,
          isLoading: false,
          error: null,
        }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, isLoading: false, error: 'Search failed' }));
      });
  }, []);

  const setQuery = useCallback(
    (q: string) => {
      setState((prev) => ({ ...prev, query: q }));

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (q.trim().length < 2) {
        setState((prev) => ({
          ...prev,
          results: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          isLoading: false,
          error: null,
          query: q,
        }));
        return;
      }

      debounceRef.current = setTimeout(() => {
        executeSearch(q.trim(), 0);
      }, DEBOUNCE_MS);
    },
    [executeSearch]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (state.query.trim().length >= 2) {
        executeSearch(state.query.trim(), page);
      }
    },
    [executeSearch, state.query]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { ...state, setQuery, goToPage };
}
