'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  registerSchema,
  type RegisterFormData,
  getPasswordStrength,
} from '@/lib/validations';
import { ApiRequestError } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { PasswordInput } from './PasswordInput';
import { HandleInput } from './HandleInput';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  locale: string;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
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
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        handle: data.handle,
      });
      router.push(`/${locale}/poks` as never);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setServerError(
          error.status === 409
            ? error.message
            : error.message || t('errors.unexpected')
        );
      } else {
        setServerError(t('errors.unexpected'));
      }
    }
  };

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <FormField
        label={t('displayName')}
        htmlFor="register-displayName"
        error={
          errors.displayName
            ? resolveError(errors.displayName.message!)
            : undefined
        }
      >
        <Input
          id="register-displayName"
          type="text"
          autoComplete="name"
          hasError={!!errors.displayName}
          aria-describedby={
            errors.displayName ? 'register-displayName-error' : undefined
          }
          {...register('displayName')}
        />
      </FormField>

      <FormField
        label={t('email')}
        htmlFor="register-email"
        error={
          errors.email ? resolveError(errors.email.message!) : undefined
        }
      >
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          hasError={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          {...register('email')}
        />
      </FormField>

      <FormField
        label={t('handle')}
        htmlFor="register-handle"
        error={
          errors.handle ? resolveError(errors.handle.message!) : undefined
        }
        hint={t('handleHint')}
      >
        <HandleInput
          id="register-handle"
          autoComplete="username"
          hasError={!!errors.handle}
          aria-describedby={
            errors.handle ? 'register-handle-error' : 'register-handle-hint'
          }
          value={handle}
          {...register('handle')}
        />
      </FormField>

      <FormField
        label={t('password')}
        htmlFor="register-password"
        error={
          errors.password
            ? resolveError(errors.password.message!)
            : undefined
        }
      >
        <PasswordInput
          id="register-password"
          autoComplete="new-password"
          hasError={!!errors.password}
          aria-describedby={
            errors.password ? 'register-password-error' : undefined
          }
          {...register('password')}
        />
        {password.length > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              <div
                className={cn('h-full flex-1 rounded-full', strengthColors[strength])}
              />
              <div
                className={cn(
                  'h-full flex-1 rounded-full',
                  strength === 'medium' || strength === 'strong'
                    ? strengthColors[strength]
                    : 'bg-slate-200 dark:bg-slate-700'
                )}
              />
              <div
                className={cn(
                  'h-full flex-1 rounded-full',
                  strength === 'strong'
                    ? strengthColors[strength]
                    : 'bg-slate-200 dark:bg-slate-700'
                )}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t(`passwordStrength.${strength}`)}
            </span>
          </div>
        )}
      </FormField>

      <FormField
        label={t('confirmPassword')}
        htmlFor="register-confirmPassword"
        error={
          errors.confirmPassword
            ? resolveError(errors.confirmPassword.message!)
            : undefined
        }
      >
        <PasswordInput
          id="register-confirmPassword"
          autoComplete="new-password"
          hasError={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword
              ? 'register-confirmPassword-error'
              : undefined
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
            {t('signingUp')}
          </>
        ) : (
          t('signUp')
        )}
      </Button>
    </form>
  );
}
