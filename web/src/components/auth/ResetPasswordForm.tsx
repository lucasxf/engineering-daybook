'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';
import { confirmPasswordResetApi } from '@/lib/auth';
import { ApiRequestError } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { PasswordInput } from './PasswordInput';

interface ResetPasswordFormProps {
  token: string;
  locale: string;
}

/**
 * Password requirements checker for real-time validation.
 */
function checkPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    maxLength: password.length <= 128,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

export function ResetPasswordForm({ token, locale }: ResetPasswordFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    maxLength: true,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  // Update password requirements as user types
  useEffect(() => {
    setPasswordRequirements(checkPasswordRequirements(newPassword));
  }, [newPassword]);

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
      // Success state will be displayed by parent component
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <Alert variant="error" role="alert">
          {serverError}
        </Alert>
      )}

      <FormField
        label={t('newPassword')}
        htmlFor="reset-password"
        error={errors.newPassword ? resolveError(errors.newPassword.message!) : undefined}
        hint={
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-medium">{t('passwordRequirements.title')}</p>
            <ul className="space-y-1 pl-4">
              <li className={passwordRequirements.minLength && passwordRequirements.maxLength ? 'text-success' : ''}>
                • {t('passwordRequirements.length')}
              </li>
              <li className={passwordRequirements.hasUppercase ? 'text-success' : ''}>
                • {t('passwordRequirements.uppercase')}
              </li>
              <li className={passwordRequirements.hasLowercase ? 'text-success' : ''}>
                • {t('passwordRequirements.lowercase')}
              </li>
              <li className={passwordRequirements.hasNumber ? 'text-success' : ''}>
                • {t('passwordRequirements.number')}
              </li>
            </ul>
          </div>
        }
      >
        <PasswordInput
          id="reset-password"
          placeholder="••••••••"
          autoComplete="new-password"
          hasError={!!errors.newPassword}
          aria-describedby={
            errors.newPassword ? 'reset-password-error' : 'reset-password-hint'
          }
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
          placeholder="••••••••"
          autoComplete="new-password"
          hasError={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? 'reset-confirm-password-error' : undefined
          }
          {...register('confirmPassword')}
        />
      </FormField>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
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
