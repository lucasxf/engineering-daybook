'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { checkHandleApi } from '@/lib/auth';
import { HANDLE_PATTERN } from '@/lib/validations';

interface HandleAvailabilityState {
  isChecking: boolean;
  isAvailable: boolean | null;
}

/**
 * Debounced handle availability check hook.
 * Only checks when the handle matches the valid format.
 */
export function useHandleAvailability(
  handle: string,
  debounceMs = 500
): HandleAvailabilityState {
  const [state, setState] = useState<HandleAvailabilityState>({
    isChecking: false,
    isAvailable: null,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const checkAvailability = useCallback(async (value: string) => {
    const requestId = ++requestIdRef.current;

    setState({ isChecking: true, isAvailable: null });

    try {
      const result = await checkHandleApi(value);
      if (requestId === requestIdRef.current) {
        setState({ isChecking: false, isAvailable: result.available });
      }
    } catch {
      if (requestId === requestIdRef.current) {
        setState({ isChecking: false, isAvailable: null });
      }
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Reset if handle is empty or invalid format
    if (!handle || handle.length < 3 || !HANDLE_PATTERN.test(handle)) {
      setState({ isChecking: false, isAvailable: null });
      return;
    }

    timerRef.current = setTimeout(() => {
      checkAvailability(handle);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handle, debounceMs, checkAvailability]);

  return state;
}
