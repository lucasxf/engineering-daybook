'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { PasswordInput } from './PasswordInput';

interface LoginFormProps {
  locale: string;
  redirectTo?: string;
}

export function LoginForm({ locale, redirectTo }: LoginFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    resetField,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const resolveError = (key: string): string => {
    try {
      return t(key.replace('auth.', ''));
    } catch {
      return key;
    }
  };

  const getSafeRedirect = (target?: string): string => {
    // Only allow relative paths starting with / to prevent open redirects
    if (target && target.startsWith('/') && !target.startsWith('//')) {
      return target;
    }
    return `/${locale}/poks`;
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data);
      router.push(getSafeRedirect(redirectTo) as never);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 401) {
          setServerError(t('errors.invalidCredentials'));
          resetField('password');
        } else {
          setServerError(error.message);
        }
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
        label={t('email')}
        htmlFor="login-email"
        error={errors.email ? resolveError(errors.email.message!) : undefined}
      >
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          hasError={!!errors.email}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email')}
        />
      </FormField>

      <FormField
        label={t('password')}
        htmlFor="login-password"
        error={
          errors.password
            ? resolveError(errors.password.message!)
            : undefined
        }
      >
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          hasError={!!errors.password}
          aria-describedby={
            errors.password ? 'login-password-error' : undefined
          }
          {...register('password')}
        />
      </FormField>

      <div className="text-right">
        <Link
          href={`/${locale}/forgot-password` as never}
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          {t('forgotPassword')}
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="mr-2" />
            {t('loggingIn')}
          </>
        ) : (
          t('logIn')
        )}
      </Button>
    </form>
  );
}
