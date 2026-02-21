'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';
import { confirmPasswordResetApi } from '@/lib/auth';
import { ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { PasswordInput } from './PasswordInput';

interface ResetPasswordFormProps {
  token: string;
  locale: string;
}

export function ResetPasswordForm({ token, locale }: ResetPasswordFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const resolveError = (key: string): string => {
    try {
      return t(key.replace('auth.', ''));
    } catch {
      return key;
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      await confirmPasswordResetApi(token, data.newPassword);
      router.push(`/${locale}/login?reset=success` as never);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setServerError(t('resetPasswordInvalid'));
      } else {
        setServerError(t('errors.unexpected'));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          {serverError}
        </div>
      )}

      <FormField
        label={t('newPassword')}
        htmlFor="reset-password"
        error={errors.newPassword ? resolveError(errors.newPassword.message!) : undefined}
      >
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          hasError={!!errors.newPassword}
          aria-describedby={errors.newPassword ? 'reset-password-error' : undefined}
          {...register('newPassword')}
        />
      </FormField>

      <FormField
        label={t('confirmPassword')}
        htmlFor="reset-confirm-password"
        error={
          errors.confirmPassword
            ? resolveError(errors.confirmPassword.message!)
            : undefined
        }
      >
        <PasswordInput
          id="reset-confirm-password"
          autoComplete="new-password"
          hasError={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? 'reset-confirm-password-error' : undefined
          }
          {...register('confirmPassword')}
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
