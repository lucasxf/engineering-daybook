'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { pokSchema, type PokFormData } from '@/lib/validations/pokSchema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';

interface PokFormProps {
  onSubmit: (data: PokFormData) => void | Promise<void>;
  initialData?: Partial<PokFormData>;
  mode?: 'create' | 'edit';
}

/**
 * Form component for creating or editing a POK.
 *
 * Features:
 * - Title field (optional, max 200 chars)
 * - Content field (required, 1-50K chars)
 * - Validation with inline error messages
 * - i18n support (EN/PT-BR)
 * - Pre-population for edit mode
 *
 * @param onSubmit callback when form is submitted with valid data
 * @param initialData optional initial values for edit mode
 * @param mode 'create' or 'edit' (affects button text)
 */
export function PokForm({
  onSubmit,
  initialData,
  mode = 'create',
}: PokFormProps) {
  const t = useTranslations('poks');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PokFormData>({
    resolver: zodResolver(pokSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
    },
  });

  const handleFormSubmit = async (data: PokFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
      <FormField
        label={t('form.titleLabel')}
        error={errors.title?.message}
        htmlFor="pok-title"
      >
        <Input
          id="pok-title"
          type="text"
          placeholder={t('form.titlePlaceholder')}
          {...register('title')}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'pok-title-error' : undefined}
        />
      </FormField>

      <FormField
        label={t('form.contentLabel')}
        error={errors.content?.message}
        htmlFor="pok-content"
      >
        <Textarea
          id="pok-content"
          rows={10}
          placeholder={t('form.contentPlaceholder')}
          {...register('content')}
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? 'pok-content-error' : undefined}
          hasError={!!errors.content}
        />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('form.submitting')
            : mode === 'edit'
              ? t('form.updateButton')
              : t('form.createButton')}
        </Button>
      </div>
    </form>
  );
}
