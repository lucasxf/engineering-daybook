'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { useHandleAvailability } from '@/hooks/useHandleAvailability';
import { HANDLE_PATTERN } from '@/lib/validations';

interface HandleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  hasError?: boolean;
  /**
   * External validation error message from react-hook-form.
   * When set, suppresses the availability status indicator.
   */
  validationError?: string;
}

type StatusState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function getStatus(
  value: string,
  isChecking: boolean,
  isAvailable: boolean | null,
  hasValidationError: boolean
): StatusState {
  if (!value || value.length === 0) return 'idle';
  if (hasValidationError) return 'invalid';
  if (value.length > 0 && !HANDLE_PATTERN.test(value)) return 'invalid';
  if (isChecking) return 'checking';
  if (isAvailable === true) return 'available';
  if (isAvailable === false) return 'taken';
  return 'idle';
}

/**
 * Handle input with real-time availability check and rich status states.
 * Follows the Choose Handle design spec: idle, checking, available, taken, invalid.
 */
export const HandleInput = forwardRef<HTMLInputElement, HandleInputProps>(
  ({ value, hasError, validationError, className, id, ...props }, ref) => {
    const t = useTranslations('auth');
    const { isChecking, isAvailable } = useHandleAvailability(value as string);

    const hasValidationError = !!(hasError || validationError);
    const status = getStatus(
      value as string,
      isChecking,
      isAvailable,
      hasValidationError
    );

    const showPreviewPill =
      (status === 'available' || status === 'checking') &&
      value &&
      (value as string).length >= 3;

    const inputHasError = status === 'taken' || status === 'invalid';

    const statusId = id ? `${id}-status` : undefined;

    return (
      <div className="space-y-2">
        {/* Input row */}
        <div className="relative flex items-stretch">
          {/* @ prefix */}
          <span
            aria-hidden="true"
            className={cn(
              'flex items-center rounded-l-md border border-r-0 px-3 text-sm select-none',
              'border-[#2B4A78] bg-[#2B4A78] text-[#8899AA]',
              'dark:border-[#2B4A78] dark:bg-[#2B4A78] dark:text-[#8899AA]',
              'light:border-[#CCC] light:bg-[#F0EDE8] light:text-[#888]'
            )}
          >
            @
          </span>

          {/* Text input */}
          <input
            ref={ref}
            id={id}
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby={statusId}
            aria-invalid={inputHasError}
            value={value}
            className={cn(
              'block w-full rounded-r-md border py-2 pr-10 pl-3 text-sm transition-colors',
              'bg-[#0F1B2D] text-[#F5F0E8]',
              'placeholder:text-[#8899AA]',
              'focus:outline-none focus:ring-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              inputHasError
                ? 'border-[#F87171] focus:ring-[#F87171]'
                : status === 'available'
                  ? 'border-[#4ADE80] focus:ring-[#4ADE80]'
                  : 'border-[#2B4A78] focus:ring-[#D4854A]',
              className
            )}
            {...props}
          />

          {/* Right-side spinner (checking state) */}
          {status === 'checking' && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}

          {/* Available checkmark */}
          {status === 'available' && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4ADE80]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8l3.5 3.5L13 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* Taken × */}
          {status === 'taken' && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#F87171]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {/* Invalid ⚠ */}
          {status === 'invalid' && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#FBBF24]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2L14 13H2L8 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6.5v3M8 11h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Live status message — aria-live region */}
        <div
          id={statusId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-[1.25rem] text-xs"
        >
          {status === 'checking' && (
            <span className="text-[#8899AA] animate-pulse">
              {t('chooseHandleChecking')}
            </span>
          )}
          {status === 'available' && (
            <span className="text-[#4ADE80] dark:text-[#4ADE80] font-medium">
              {t('chooseHandleAvailable', { handle: value as string })}
            </span>
          )}
          {status === 'taken' && (
            <span className="text-[#F87171] dark:text-[#F87171]">
              {t('chooseHandleTaken', { handle: value as string })}
            </span>
          )}
          {status === 'invalid' && validationError && (
            <span className="text-[#FBBF24] dark:text-[#FBBF24]">
              {validationError}
            </span>
          )}
        </div>

        {/* Handle preview pill */}
        {showPreviewPill && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8899AA]">Preview:</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                'bg-[#2B4A78]',
                status === 'available'
                  ? 'text-[#8B5E3C]'
                  : 'text-[#8899AA]'
              )}
            >
              @{value}
            </span>
          </div>
        )}
      </div>
    );
  }
);

HandleInput.displayName = 'HandleInput';
