'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useHandleAvailability } from '@/hooks/useHandleAvailability';

interface HandleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  hasError?: boolean;
}

/**
 * Handle input with real-time availability check.
 * Shows availability status inline after debounce.
 */
export const HandleInput = forwardRef<HTMLInputElement, HandleInputProps>(
  ({ value, hasError, ...props }, ref) => {
    const t = useTranslations('auth');
    const { isChecking, isAvailable } = useHandleAvailability(value);

    return (
      <div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            @
          </span>
          <Input
            ref={ref}
            type="text"
            hasError={hasError || isAvailable === false}
            className="pl-7"
            value={value}
            {...props}
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>
        {!hasError && isAvailable === true && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            {t('handleAvailable')}
          </p>
        )}
        {!hasError && isAvailable === false && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {t('handleTaken')}
          </p>
        )}
      </div>
    );
  }
);

HandleInput.displayName = 'HandleInput';
