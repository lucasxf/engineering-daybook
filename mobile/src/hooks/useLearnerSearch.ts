import { useEffect, useState } from 'react';
import { searchLearners, type LearnerSearchResult } from '@/lib/learnerApi';
import { useDebounce } from '@/hooks/useDebounce';

export interface UseLearnerSearchResult {
  results: LearnerSearchResult[];
  loading: boolean;
  error: string | null;
}

const MIN_QUERY_LENGTH = 2;

/**
 * Debounced learner search hook.
 * Only fires an API call when the debounced query is at least 2 characters.
 * Returns empty results immediately for short queries without hitting the network.
 * Cleans up in-flight requests on query change or unmount.
 */
export function useLearnerSearch(query: string): UseLearnerSearchResult {
  const debouncedQuery = useDebounce(query, 300);

  const [results, setResults] = useState<LearnerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    searchLearners(debouncedQuery, undefined, controller.signal)
      .then((page) => {
        if (cancelled) return;
        setResults(page.content);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if ((e as Error).name === 'AbortError') return;
        setError((e as Error).message ?? 'Search failed');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery]);

  return { results, loading, error };
}
