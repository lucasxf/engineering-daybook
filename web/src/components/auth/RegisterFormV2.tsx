'use client';

import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  registerSchema,
  type RegisterFormData,
  getPasswordStrength,
} from '@/lib/validations';

/* ─────────────────────────────────────────────────────────────────────────────
   Design System Tokens (CSS Custom Properties)
   Injected via :root or .theme-* classes for theming isolation.
────────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   Icons
────────────────────────────────────────────────────────────────────────────── */
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Styled Input
────────────────────────────────────────────────────────────────────────────── */
interface InputV2Props extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const InputV2 = forwardRef<HTMLInputElement, InputV2Props>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-200',
          'bg-[var(--input-bg)] text-[var(--input-text)]',
          'placeholder:text-[var(--input-placeholder)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-[var(--error)] focus:ring-[var(--error)]'
            : 'border-[var(--input-border)]',
          className
        )}
        {...props}
      />
    );
  }
);
InputV2.displayName = 'InputV2';

/* ─────────────────────────────────────────────────────────────────────────────
   Password Input with visibility toggle
────────────────────────────────────────────────────────────────────────────── */
interface PasswordInputV2Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  hasError?: boolean;
}

const PasswordInputV2 = forwardRef<HTMLInputElement, PasswordInputV2Props>(
  ({ hasError, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const t = useTranslations('auth');

    return (
      <div className="relative">
        <InputV2
          ref={ref}
          type={visible ? 'text' : 'password'}
          hasError={hasError}
          className="pr-10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label={visible ? t('hidePassword') : t('showPassword')}
        >
          {visible ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInputV2.displayName = 'PasswordInputV2';

/* ─────────────────────────────────────────────────────────────────────────────
   Handle Input with @ prefix
────────────────────────────────────────────────────────────────────────────── */
interface HandleInputV2Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  hasError?: boolean;
  isChecking?: boolean;
  isAvailable?: boolean | null;
}

const HandleInputV2 = forwardRef<HTMLInputElement, HandleInputV2Props>(
  ({ value, hasError, isChecking, isAvailable, ...props }, ref) => {
    const t = useTranslations('auth');

    return (
      <div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
            @
          </span>
          <InputV2
            ref={ref}
            type="text"
            hasError={hasError || isAvailable === false}
            className="pl-7"
            value={value}
            {...props}
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <SpinnerIcon className="h-4 w-4 text-[var(--muted)]" />
            </div>
          )}
        </div>
        {!hasError && isAvailable === true && (
          <p className="mt-1.5 text-xs text-[var(--success)]">
            {t('handleAvailable')}
          </p>
        )}
        {!hasError && isAvailable === false && (
          <p className="mt-1.5 text-xs text-[var(--error)]">
            {t('handleTaken')}
          </p>
        )}
      </div>
    );
  }
);
HandleInputV2.displayName = 'HandleInputV2';

/* ─────────────────────────────────────────────────────────────────────────────
   Form Field wrapper
────────────────────────────────────────────────────────────────────────────── */
interface FormFieldV2Props {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FormFieldV2({ label, htmlFor, error, hint, children }: FormFieldV2Props) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>
      <div>{children}</div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[var(--error)]">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Alert component
────────────────────────────────────────────────────────────────────────────── */
interface AlertV2Props {
  variant: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

function AlertV2({ variant, children }: AlertV2Props) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border p-3 text-sm',
        variant === 'error' && 'border-[var(--error)]/30 bg-[var(--error)]/10 text-[var(--error)]',
        variant === 'success' && 'border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]',
        variant === 'info' && 'border-[var(--muted)]/30 bg-[var(--muted)]/10 text-[var(--foreground)]'
      )}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Button component
────────────────────────────────────────────────────────────────────────────── */
interface ButtonV2Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

function ButtonV2({ className, variant = 'primary', isLoading, children, disabled, ...props }: ButtonV2Props) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 active:scale-[0.98]',
        variant === 'secondary' && 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:brightness-95 active:scale-[0.98]',
        variant === 'outline' && 'border border-[var(--input-border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)] active:scale-[0.98]',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <SpinnerIcon className="mr-2 h-4 w-4" />
      )}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Password Strength Indicator
────────────────────────────────────────────────────────────────────────────── */
function PasswordStrengthIndicator({ strength }: { strength: 'weak' | 'medium' | 'strong' }) {
  const t = useTranslations('auth');

  const strengthConfig = {
    weak: { bars: 1, color: 'var(--error)', label: t('passwordStrength.weak') },
    medium: { bars: 2, color: 'var(--warning)', label: t('passwordStrength.medium') },
    strong: { bars: 3, color: 'var(--success)', label: t('passwordStrength.strong') },
  };

  const config = strengthConfig[strength];

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex h-1.5 flex-1 gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className="h-full flex-1 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: bar <= config.bars ? config.color : 'var(--input-border)',
            }}
          />
        ))}
      </div>
      <span className="text-xs text-[var(--muted)]">{config.label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main RegisterFormV2 Component
────────────────────────────────────────────────────────────────────────────── */
export interface RegisterFormV2Props {
  locale: string;
  /** For demo: force submitting state */
  forceSubmitting?: boolean;
  /** For demo: inject server error */
  serverErrorOverride?: string | null;
  /** For demo: handle availability state */
  handleAvailability?: { isChecking: boolean; isAvailable: boolean | null };
  /** Callback when form submits (for demo purposes) */
  onSubmit?: (data: RegisterFormData) => Promise<void>;
}

export function RegisterFormV2({
  locale,
  forceSubmitting,
  serverErrorOverride,
  handleAvailability,
  onSubmit: onSubmitProp,
}: RegisterFormV2Props) {
  const t = useTranslations('auth');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      handle: '',
    },
    mode: 'onTouched',
  });

  const isSubmitting = forceSubmitting ?? formIsSubmitting;
  const displayedServerError = serverErrorOverride ?? serverError;

  const password = watch('password');
  const handle = watch('handle');
  const strength = getPasswordStrength(password);

  const resolveError = (key: string): string => {
    try {
      return t(key.replace('auth.', ''));
    } catch {
      return key;
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    if (onSubmitProp) {
      try {
        await onSubmitProp(data);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : t('errors.unexpected'));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {displayedServerError && (
        <AlertV2 variant="error">{displayedServerError}</AlertV2>
      )}

      <FormFieldV2
        label={t('displayName')}
        htmlFor="register-displayName"
        error={errors.displayName ? resolveError(errors.displayName.message!) : undefined}
      >
        <InputV2
          id="register-displayName"
          type="text"
          autoComplete="name"
          placeholder={t('displayNamePlaceholder')}
          hasError={!!errors.displayName}
          aria-describedby={errors.displayName ? 'register-displayName-error' : undefined}
          {...register('displayName')}
        />
      </FormFieldV2>

      <FormFieldV2
        label={t('email')}
        htmlFor="register-email"
        error={errors.email ? resolveError(errors.email.message!) : undefined}
      >
        <InputV2
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          hasError={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          {...register('email')}
        />
      </FormFieldV2>

      <FormFieldV2
        label={t('handle')}
        htmlFor="register-handle"
        error={errors.handle ? resolveError(errors.handle.message!) : undefined}
        hint={t('handleHint')}
      >
        <HandleInputV2
          id="register-handle"
          autoComplete="username"
          placeholder={t('handlePlaceholder')}
          hasError={!!errors.handle}
          aria-describedby={errors.handle ? 'register-handle-error' : 'register-handle-hint'}
          value={handle}
          isChecking={handleAvailability?.isChecking}
          isAvailable={handleAvailability?.isAvailable}
          {...register('handle')}
        />
      </FormFieldV2>

      <FormFieldV2
        label={t('password')}
        htmlFor="register-password"
        error={errors.password ? resolveError(errors.password.message!) : undefined}
      >
        <PasswordInputV2
          id="register-password"
          autoComplete="new-password"
          placeholder={t('passwordPlaceholder')}
          hasError={!!errors.password}
          aria-describedby={errors.password ? 'register-password-error' : undefined}
          {...register('password')}
        />
        {password.length > 0 && (
          <PasswordStrengthIndicator strength={strength} />
        )}
      </FormFieldV2>

      <FormFieldV2
        label={t('confirmPassword')}
        htmlFor="register-confirmPassword"
        error={errors.confirmPassword ? resolveError(errors.confirmPassword.message!) : undefined}
      >
        <PasswordInputV2
          id="register-confirmPassword"
          autoComplete="new-password"
          placeholder={t('confirmPasswordPlaceholder')}
          hasError={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'register-confirmPassword-error' : undefined}
          {...register('confirmPassword')}
        />
      </FormFieldV2>

      <div className="pt-2">
        <ButtonV2 type="submit" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? t('signingUp') : t('signUp')}
        </ButtonV2>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--input-border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--background)] px-3 text-[var(--muted)]">
            {t('orContinueWith')}
          </span>
        </div>
      </div>

      <ButtonV2 type="button" variant="outline" className="w-full">
        <GoogleIcon className="mr-2 h-4 w-4" />
        {t('continueWithGoogle')}
      </ButtonV2>

      <p className="text-center text-sm text-[var(--muted)]">
        {t('hasAccount')}{' '}
        <a
          href={`/${locale}/login`}
          className="font-medium text-[var(--primary)] hover:underline"
        >
          {t('logInLink')}
        </a>
      </p>
    </form>
  );
}
