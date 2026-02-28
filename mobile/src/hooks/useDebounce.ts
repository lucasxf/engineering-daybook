import { useEffect, useState } from 'react';

/**
 * Debounces a value by the given delay (default 300ms).
 * Useful for deferring expensive search API calls while the user types.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
