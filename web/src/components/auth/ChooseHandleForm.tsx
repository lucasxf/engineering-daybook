'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { chooseHandleSchema, type ChooseHandleFormData } from '@/lib/validations';
import { ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { HandleInput } from './HandleInput';

interface ChooseHandleFormProps {
  tempToken: string;
  defaultDisplayName?: string;
}

export function ChooseHandleForm({
  tempToken,
  defaultDisplayName = '',
}: ChooseHandleFormProps) {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const { completeGoogleSignup } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChooseHandleFormData>({
    resolver: zodResolver(chooseHandleSchema),
    mode: 'onTouched',
    defaultValues: {
      handle: '',
      displayName: defaultDisplayName,
    },
  });

  const handleValue = watch('handle');

  const resolveError = (key: string): string => {
    try {
      return t(key.replace('auth.', ''));
    } catch {
      return key;
    }
  };

  const onSubmit = async (data: ChooseHandleFormData) => {
    setServerError(null);
    try {
      await completeGoogleSignup({
        tempToken,
        handle: data.handle,
        displayName: data.displayName,
      });
      router.push(`/${params.locale}` as never);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 401) {
          setServerError(t('errors.sessionExpired'));
          setTimeout(() => {
            router.push(`/${params.locale}/login` as never);
          }, 2000);
        } else if (error.status === 409) {
          setServerError(t('handleTaken'));
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
        label={t('displayName')}
        htmlFor="choose-displayName"
        error={
          errors.displayName
            ? resolveError(errors.displayName.message!)
            : undefined
        }
      >
        <Input
          id="choose-displayName"
          type="text"
          autoComplete="name"
          hasError={!!errors.displayName}
          {...register('displayName')}
        />
      </FormField>

      <FormField
        label={t('handle')}
        htmlFor="choose-handle"
        hint={t('handleHint')}
        error={
          errors.handle ? resolveError(errors.handle.message!) : undefined
        }
      >
        <HandleInput
          id="choose-handle"
          autoComplete="username"
          value={handleValue}
          hasError={!!errors.handle}
          autoFocus
          {...register('handle')}
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
            {t('completingRegistration')}
          </>
        ) : (
          t('completeRegistration')
        )}
      </Button>
    </form>
  );
}
