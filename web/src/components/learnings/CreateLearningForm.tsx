'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLearningSchema, type LearningFormData } from '@/lib/validations/learningSchema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Toast } from '@/components/ui/Toast';

interface CreateLearningFormProps {
  onSubmit: (data: LearningFormData) => Promise<void>;
}

/**
 * Form component for creating a new Learning.
 *
 * Features:
 * - Title field (optional, max 200 chars)
 * - Content field (required, 1-50K chars)
 * - Character counters for both fields
 * - Submit button disabled until content is entered
 * - Auto-expanding textarea
 * - i18n support (EN/PT-BR)
 * - Loading state with spinner
 * - Success and error toast notifications
 * - Keyboard shortcuts (Cmd/Ctrl+Enter to submit, Escape to cancel)
 */
export function CreateLearningForm({ onSubmit }: CreateLearningFormProps) {
  const t = useTranslations('learnings.create');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const schema = useMemo(
    () =>
      createLearningSchema({
        contentRequired: t('errors.contentRequired'),
        titleTooLong: t('errors.titleTooLong'),
        contentTooLong: t('errors.contentTooLong'),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LearningFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const titleValue = watch('title') || '';
  const contentValue = watch('content') || '';

  // Keyboard shortcuts: Cmd/Ctrl+Enter to submit, Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
      if (e.key === 'Escape') {
        router.back();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleFormSubmit = async (data: LearningFormData) => {
    try {
      await onSubmit(data);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Failed to save learning:', error);
      setShowErrorToast(true);
    }
  };

  const isContentEmpty = contentValue.trim().length === 0;
  const isFormValid = !isContentEmpty;

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit(handleFormSubmit)}
        className="mx-auto max-w-2xl space-y-6"
        noValidate
      >
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="learning-title" className="text-sm font-medium text-muted-foreground">
            {t('form.titleLabel')}
          </Label>
          <Input
            id="learning-title"
            type="text"
            placeholder={t('form.titlePlaceholder')}
            maxLength={200}
            {...register('title')}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : 'title-counter'}
            hasError={!!errors.title}
          />
          <div className="flex items-center justify-between">
            {errors.title && (
              <span
                id="title-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.title.message}
              </span>
            )}
            <span
              id="title-counter"
              className={`ml-auto text-xs ${
                titleValue.length === 200
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
              aria-live="polite"
            >
              {t('form.titleCharCounter', { current: titleValue.length })}
            </span>
          </div>
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <Label htmlFor="learning-content" className="text-sm font-medium text-muted-foreground">
            {t('form.contentLabel')}
          </Label>
          <Textarea
            id="learning-content"
            placeholder={t('form.contentPlaceholder')}
            maxLength={50000}
            autoExpand
            className="min-h-[180px]"
            {...register('content')}
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? 'content-error' : 'content-counter'}
            hasError={!!errors.content}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            {errors.content && (
              <span
                id="content-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.content.message}
              </span>
            )}
            <span
              id="content-counter"
              className={`ml-auto text-xs ${
                contentValue.length >= 50000
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
              aria-live="polite"
            >
              {t('form.contentCharCounter', { current: contentValue.length })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {t('form.cancelButton')}
          </button>
          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="min-w-32"
          >
            {isSubmitting ? t('form.savingButton') : t('form.saveButton')}
          </Button>
        </div>
      </form>

      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          message={t('success.message')}
          onDismiss={() => setShowSuccessToast(false)}
          durationMs={3000}
        />
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <Toast
          message={t('errors.saveFailed')}
          onDismiss={() => setShowErrorToast(false)}
          durationMs={4000}
        />
      )}
    </>
  );
}
