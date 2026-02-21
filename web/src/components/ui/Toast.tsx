'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * Accessible success toast notification.
 *
 * Announced to screen readers via role="status" and aria-live="polite".
 * Auto-dismisses after durationMs (default 3000ms).
 */
export function Toast({ message, onDismiss, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
        'rounded-md bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-lg',
        'dark:bg-green-700'
      )}
    >
      {message}
    </div>
  );
}
