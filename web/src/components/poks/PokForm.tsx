'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { pokSchema, type PokFormData } from '@/lib/validations/pokSchema';
import type { PokVisibility } from '@/lib/pokApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { VisibilityPicker } from './VisibilityPicker';

export const cancelLinkClasses =
  "inline-flex items-center justify-center rounded-md font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-card text-card-foreground border border-card-border hover:bg-muted/10 h-10 px-4 text-base";

export interface PokFormSubmitData extends PokFormData {
  visibility: PokVisibility;
}

interface PokFormProps {
  onSubmit: (data: PokFormSubmitData) => void | Promise<void>;
  initialData?: Partial<PokFormData & { visibility: PokVisibility }>;
  mode?: 'create' | 'edit';
  afterContent?: ReactNode;
  cancelButton?: ReactNode;
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
  afterContent,
  cancelButton,
}: PokFormProps) {
  const t = useTranslations('poks');
  const [visibility, setVisibility] = useState<PokVisibility>(
    initialData?.visibility ?? 'PRIVATE'
  );

  useEffect(() => {
    setVisibility(initialData?.visibility ?? 'PRIVATE');
  }, [initialData?.visibility]);

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
    await onSubmit({ ...data, visibility });
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

      {afterContent}

      <div className="flex items-center justify-between">
        <VisibilityPicker
          value={visibility}
          onChange={setVisibility}
          locked={initialData?.visibility === 'PUBLIC'}
        />
        <div className="flex items-center gap-2">
          {cancelButton}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('form.submitting')
              : mode === 'edit'
                ? t('form.updateButton')
                : t('form.createButton')}
          </Button>
        </div>
      </div>
    </form>
  );
}
