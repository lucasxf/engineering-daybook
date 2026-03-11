'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { HANDLE_PATTERN } from '@/lib/validations';
import { ApiRequestError } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { HandleInput } from './HandleInput';
import { useHandleAvailability } from '@/hooks/useHandleAvailability';
import { cn } from '@/lib/utils';

// Minimal schema: only handle is required on this screen
const handleOnlySchema = z.object({
  handle: z
    .string()
    .min(3, 'auth.errors.handleMinLength')
    .max(30, 'auth.errors.handleMaxLength')
    .regex(HANDLE_PATTERN, 'auth.errors.handleFormat'),
});

type HandleOnlyFormData = z.infer<typeof handleOnlySchema>;

interface ChooseHandleFormProps {
  tempToken: string;
  defaultDisplayName?: string;
}

type FormView = 'form' | 'sessionExpired';

export function ChooseHandleForm({ tempToken }: ChooseHandleFormProps) {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const { completeGoogleSignup } = useAuth();
  const [genericError, setGenericError] = useState<string | null>(null);
  const [view, setView] = useState<FormView>('form');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HandleOnlyFormData>({
    resolver: zodResolver(handleOnlySchema),
    mode: 'onChange',
    defaultValues: { handle: '' },
  });

  const handleValue = watch('handle');
  const { isAvailable } = useHandleAvailability(handleValue);

  // CTA is only enabled when server confirmed availability and no validation errors
  const canSubmit =
    !isSubmitting && isAvailable === true && !errors.handle;

  const resolveError = (key: string): string => {
    try {
      return t(key.replace('auth.', ''));
    } catch {
      return key;
    }
  };

  const onSubmit = async (data: HandleOnlyFormData) => {
    setGenericError(null);
    try {
      await completeGoogleSignup({
        tempToken,
        handle: data.handle,
        displayName: data.handle, // fallback: use handle as display name
      });
      router.push(`/${params.locale}/poks` as never);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 401) {
          setView('sessionExpired');
        } else if (error.status === 409) {
          setGenericError(
            t('chooseHandleTaken', { handle: data.handle })
          );
        } else {
          setGenericError(t('errors.unexpected'));
        }
      } else {
        setGenericError(t('errors.unexpected'));
      }
    }
  };

  // Session-expired state: replace the form with a focused error card
  if (view === 'sessionExpired') {
    return (
      <div
        role="alert"
        className={cn(
          'rounded-xl border p-6 text-center space-y-5',
          'bg-card border-border'
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-red-500 dark:text-red-400"
              />
              <path
                d="M12 7v5M12 16h.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-red-500 dark:text-red-400"
              />
            </svg>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('chooseHandleSessionExpired')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${params.locale}/login` as never)}
          className={cn(
            'w-full rounded-md py-2.5 text-sm font-medium transition-all',
            'bg-accent text-accent-foreground',
            'hover:opacity-90 active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          {t('googleSignIn')}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* Handle field */}
      <div className="space-y-1.5">
        <label
          htmlFor="choose-handle"
          className="block text-sm font-medium text-foreground"
        >
          {t('chooseHandleLabel')}
        </label>

        <HandleInput
          id="choose-handle"
          autoComplete="username"
          autoFocus
          value={handleValue}
          hasError={!!errors.handle}
          validationError={
            errors.handle
              ? resolveError(errors.handle.message!)
              : undefined
          }
          disabled={isSubmitting}
          placeholder={t('chooseHandlePlaceholder')}
          {...register('handle')}
        />

        {/* Format hint */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('chooseHandleFormatHint')}
        </p>
      </div>

      {/* Generic server error */}
      {genericError && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 dark:border-red-400/30 dark:bg-red-400/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400"
        >
          <div className="flex items-center justify-between gap-2">
            <span>{genericError}</span>
            <button
              type="button"
              onClick={() => {
                setGenericError(null);
              }}
              className="shrink-0 text-xs underline opacity-70 hover:opacity-100"
            >
              {t('errors.unexpected').includes('retry') ? 'Retry' : '×'}
            </button>
          </div>
        </div>
      )}

      {/* CTA button */}
      <button
        type="submit"
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        className={cn(
          'w-full rounded-md py-2.5 text-sm font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          'active:scale-[0.98]',
          canSubmit
            ? 'bg-accent text-accent-foreground hover:opacity-90 cursor-pointer'
            : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
        )}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner size="sm" />
            {t('chooseHandleSubmitting')}
          </span>
        ) : (
          t('chooseHandleCta')
        )}
      </button>
    </form>
  );
}
