'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations';
import { requestPasswordResetApi } from '@/lib/auth';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const resolveError = (key: string): string => {
    try {
      return t(key.replace('auth.', ''));
    } catch {
      return key;
    }
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    try {
      await requestPasswordResetApi(data.email);
      setSubmitted(true);
    } catch {
      // Show generic success even on error to prevent email enumeration
      setSubmitted(true);
    }
  };

  if (submitted) {
    return <Alert variant="success" role="status">{t('forgotPasswordSent')}</Alert>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <FormField
        label={t('email')}
        htmlFor="forgot-email"
        error={errors.email ? resolveError(errors.email.message!) : undefined}
      >
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          hasError={!!errors.email}
          aria-describedby={errors.email ? 'forgot-email-error' : undefined}
          {...register('email')}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="mr-2" />
            {t('sendingResetLink')}
          </>
        ) : (
          t('forgotPasswordButton')
        )}
      </Button>
    </form>
  );
}
