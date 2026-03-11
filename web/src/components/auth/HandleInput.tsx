'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
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
 * Colors follow the "Library at Dusk" palette with dark/light mode support.
 */
export const HandleInput = forwardRef<HTMLInputElement, HandleInputProps>(
  ({ value, hasError, validationError, className, id, ...props }, ref) => {
    const t = useTranslations('auth');
    const { resolvedTheme } = useTheme();
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
    const isDark = resolvedTheme === 'dark';

    // Color palette
    const prefixBg = isDark ? '#2B4A78' : '#F0EDE8';
    const prefixText = isDark ? '#8899AA' : '#888888';
    const inputBg = isDark ? '#0F1B2D' : 'white';
    const inputText = isDark ? '#F5F0E8' : '#1A1A2E';
    const inputPlaceholder = isDark ? '#8899AA' : 'rgb(107, 114, 128)';
    const inputBorder = isDark ? '#2B4A78' : '#CCC';
    const focusRing = isDark ? '#D4854A' : '#D4854A';
    
    const errorBorder = isDark ? '#F87171' : '#DC2626';
    const availableBorder = isDark ? '#4ADE80' : '#16A34A';
    
    const statusText = isDark ? '#8899AA' : '#999999';
    const availableText = isDark ? '#4ADE80' : '#16A34A';
    const errorText = isDark ? '#F87171' : '#DC2626';
    const warningText = isDark ? '#FBBF24' : '#D97706';
    
    const pillBg = isDark ? '#2B4A78' : '#E0E8F2';
    const pillText = isDark ? '#8899AA' : '#888888';
    const pillAccent = '#8B5E3C';

    return (
      <div className="space-y-2">
        {/* Input row */}
        <div className="relative flex items-stretch">
          {/* @ prefix */}
          <span
            aria-hidden="true"
            className="flex items-center rounded-l-md border border-r-0 px-3 text-sm select-none"
            style={{
              backgroundColor: prefixBg,
              color: prefixText,
              borderColor: inputBorder,
            }}
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
              'focus:outline-none focus:ring-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            style={{
              backgroundColor: inputBg,
              color: inputText,
              borderColor: inputHasError ? errorBorder : status === 'available' ? availableBorder : inputBorder,
              outlineColor: focusRing,
            }}
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
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: availableText }}
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
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: errorText }}
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
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: warningText }}
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
            <span className="animate-pulse" style={{ color: statusText }}>
              {t('chooseHandleChecking')}
            </span>
          )}
          {status === 'available' && (
            <span className="font-medium" style={{ color: availableText }}>
              {t('chooseHandleAvailable', { handle: value as string })}
            </span>
          )}
          {status === 'taken' && (
            <span style={{ color: errorText }}>
              {t('chooseHandleTaken', { handle: value as string })}
            </span>
          )}
          {status === 'invalid' && validationError && (
            <span style={{ color: warningText }}>
              {validationError}
            </span>
          )}
        </div>

        {/* Handle preview pill */}
        {showPreviewPill && (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: statusText }}>
              Preview:
            </span>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: pillBg,
                color: status === 'available' ? pillAccent : pillText,
              }}
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



