import { useCallback, useEffect, useRef, useState } from 'react';
import { getLearnerProfile, type LearnerProfileResponse } from '@/lib/learnerApi';

export interface UseLearnerProfileResult {
  profile: LearnerProfileResponse | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetches the public profile of a learner by handle.
 * Re-fetches when the handle changes. Exposes `reload()` to trigger a manual re-fetch.
 * Cleans up in-flight requests on unmount or handle change.
 */
export function useLearnerProfile(handle: string): UseLearnerProfileResult {
  const [profile, setProfile] = useState<LearnerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Increment to trigger a re-fetch without changing `handle`
  const [reloadTick, setReloadTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    getLearnerProfile(handle)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if ((e as Error).name === 'AbortError') return;
        setError((e as Error).message ?? 'Failed to load profile');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // reloadTick intentionally included to allow manual re-fetch via reload()
  }, [handle, reloadTick]);

  const reload = useCallback(() => {
    setReloadTick((t) => t + 1);
  }, []);

  return { profile, loading, error, reload };
}
