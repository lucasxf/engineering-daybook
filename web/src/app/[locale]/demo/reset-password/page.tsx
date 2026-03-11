'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { FormField } from '@/components/ui/FormField';
import { PasswordInput } from '@/components/auth/PasswordInput';

type DemoState = 'loading' | 'valid' | 'invalid' | 'submitting' | 'error';

function DemoResetPasswordForm({ isSubmitting, showError }: { isSubmitting?: boolean; showError?: boolean }) {
  const t = useTranslations('auth');
  const [password, setPassword] = useState('Test123!');
  
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      {showError && (
        <Alert variant="error" role="alert">
          {t('resetPasswordInvalid')}
        </Alert>
      )}

      <FormField
        label={t('newPassword')}
        htmlFor="demo-reset-password"
        hint={
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-medium">Password requirements:</p>
            <ul className="space-y-1 pl-4">
              <li className={requirements.minLength ? 'text-success' : ''}>
                {'\u2022'} 8-128 characters
              </li>
              <li className={requirements.hasUppercase ? 'text-success' : ''}>
                {'\u2022'} At least one uppercase letter
              </li>
              <li className={requirements.hasLowercase ? 'text-success' : ''}>
                {'\u2022'} At least one lowercase letter
              </li>
              <li className={requirements.hasNumber ? 'text-success' : ''}>
                {'\u2022'} At least one number
              </li>
            </ul>
          </div>
        }
      >
        <PasswordInput
          id="demo-reset-password"
          placeholder="********"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>

      <FormField
        label={t('confirmPassword')}
        htmlFor="demo-reset-confirm-password"
      >
        <PasswordInput
          id="demo-reset-confirm-password"
          placeholder="********"
          autoComplete="new-password"
          defaultValue="Test123!"
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="mr-2" />
            {t('resettingPassword')}
          </>
        ) : (
          t('resetPasswordButton')
        )}
      </Button>
    </form>
  );
}

function ResetPasswordDemo({ state, locale }: { state: DemoState; locale: string }) {
  const t = useTranslations('auth');

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] px-4 py-8">
      {/* Wordmark */}
      <div className="mb-12 text-center">
        <span className="inline-flex items-center gap-1 font-bricolage text-2xl font-semibold text-ink dark:text-parchment">
          <span className="font-normal">learn</span>
          <span className="font-bold">imo</span>
        </span>
      </div>

      {/* Main Card Container */}
      <Card className="w-full max-w-sm p-8">
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="md" className="mb-3" />
            <p className="text-sm text-muted-foreground">
              Validating reset link...
            </p>
          </div>
        )}

        {state === 'invalid' && (
          <div className="space-y-4">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <svg
                  className="h-6 w-6 text-destructive"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-2 text-center">
              <h2 className="text-lg font-semibold text-foreground">
                {t('resetPasswordExpired')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('resetPasswordInvalid')}
              </p>
            </div>

            {/* Error CTA */}
            <span className="block w-full rounded-md bg-primary px-4 py-2.5 text-center font-medium text-primary-foreground cursor-pointer hover:bg-primary-hover transition-colors">
              {t('requestNewLink')}
            </span>

            {/* Back Link */}
            <p className="text-center">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {t('backToLogin')}
              </span>
            </p>
          </div>
        )}

        {(state === 'valid' || state === 'submitting' || state === 'error') && (
          <div className="space-y-6">
            {/* Form Header */}
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                {t('resetPasswordTitle')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('resetPasswordSubtitle')}
              </p>
            </div>

            {/* Form */}
            <DemoResetPasswordForm 
              isSubmitting={state === 'submitting'} 
              showError={state === 'error'}
            />
          </div>
        )}
      </Card>

      {/* Back Link (shown below card when in valid state) */}
      {(state === 'valid' || state === 'submitting' || state === 'error') && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <span className="font-medium hover:text-foreground transition-colors cursor-pointer">
            {t('backToLogin')}
          </span>
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordDemoPage() {
  const params = useParams<{ locale: string }>();
  const [activeState, setActiveState] = useState<DemoState>('valid');

  const states: { value: DemoState; label: string }[] = [
    { value: 'loading', label: 'Loading' },
    { value: 'valid', label: 'Valid Token' },
    { value: 'invalid', label: 'Invalid/Expired Token' },
    { value: 'submitting', label: 'Submitting' },
    { value: 'error', label: 'Server Error' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Controls */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Reset Password - Demo
              </h1>
              <p className="text-sm text-muted-foreground">
                Preview all states of the redesigned reset password screen
              </p>
            </div>
            <Link
              href={`/${params.locale}/reset-password?token=demo` as never}
              className="text-sm text-primary hover:underline"
            >
              View actual page
            </Link>
          </div>

          {/* State Selector */}
          <div className="mt-4 flex flex-wrap gap-2">
            {states.map((state) => (
              <button
                key={state.value}
                onClick={() => setActiveState(state.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeState === state.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Preview */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-border bg-background shadow-sm">
          <ResetPasswordDemo state={activeState} locale={params.locale} />
        </div>

        {/* State Description */}
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium text-foreground">Current State: {states.find(s => s.value === activeState)?.label}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeState === 'loading' && 'Shown while validating the password reset token from the URL.'}
            {activeState === 'valid' && 'Shown when the token is valid. User can enter their new password with real-time requirement validation.'}
            {activeState === 'invalid' && 'Shown when the token is expired, invalid, or already used. Prompts user to request a new link.'}
            {activeState === 'submitting' && 'Shown while the new password is being submitted to the server.'}
            {activeState === 'error' && 'Shown when a server error occurs during password reset (e.g., token expired during submission).'}
          </p>
        </div>
      </div>
    </div>
  );
}
