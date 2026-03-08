'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { pokApi, type Pok, type PokShare, type PokVisibility } from '@/lib/pokApi';

interface ReLearningModalProps {
  /** The original public learning to re-learn. Only id and title are needed. */
  pok: Pick<Pok, 'id' | 'title'>;
  onClose: () => void;
  onSuccess: (share: PokShare) => void;
}

/**
 * Modal dialog for creating a re-learning (PokShare).
 *
 * Lets the learner add an optional personal note and choose visibility before
 * re-learning another learner's public learning.
 *
 * @param pok the original public learning to re-learn
 * @param onClose callback to close the modal (cancel or after success)
 * @param onSuccess callback called with the created PokShare on successful submission
 */
export function ReLearningModal({ pok, onClose, onSuccess }: ReLearningModalProps) {
  const t = useTranslations('poks.share');
  const tVisibility = useTranslations('poks.visibility');

  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<PokVisibility>('PUBLIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const share = await pokApi.share(pok.id, {
        note: note.trim() || null,
        visibility,
      });
      onSuccess(share);
      onClose();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = (err as { message?: string })?.message ?? '';
      if (status === 400) {
        if (message.includes('own learning') || message.includes('self')) {
          setError(t('errors.selfShare'));
        } else if (message.includes('500') || message.includes('Validation failed') || message.includes('Note must')) {
          setError(t('errors.noteTooLong'));
        } else {
          setError(t('errors.notPublic'));
        }
      } else if (status === 409) {
        setError(t('errors.duplicate'));
      } else if (status === 404) {
        setError(t('errors.notFound'));
      } else {
        setError(t('errors.unexpected'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibilityOptions: { value: PokVisibility; label: string }[] = [
    { value: 'PUBLIC', label: `🌐 ${tVisibility('public')}` },
    { value: 'FOLLOWERS_ONLY', label: `👥 ${tVisibility('followersOnly')}` },
    { value: 'COLLEAGUES_ONLY', label: `🤝 ${tVisibility('colleaguesOnly')}` },
    { value: 'PRIVATE', label: `🔒 ${tVisibility('private')}` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="relearning-modal-title"
    >
      <div className="w-full max-w-md animate-slideUp rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
        <h2
          id="relearning-modal-title"
          className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100"
        >
          {t('modalTitle')}
        </h2>
        {pok.title && (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            &ldquo;{pok.title}&rdquo;
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="relearning-note"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('noteLabel')}
            </label>
            <textarea
              id="relearning-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('notePlaceholder')}
              maxLength={500}
              rows={3}
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('noteHint')}
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="relearning-visibility"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('visibilityLabel')}
            </label>
            <select
              id="relearning-visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as PokVisibility)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              {visibilityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error !== null && (
            <p
              role="alert"
              className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              autoFocus
            >
              {t('cancelButton')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('submitting') : t('submitButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
