'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface DeletePokButtonProps {
  onDelete: () => void | Promise<void>;
}

/**
 * Button component for deleting a POK with confirmation dialog.
 *
 * Features:
 * - Confirmation dialog to prevent accidental deletion
 * - i18n support (poks.delete.*)
 * - Accessible dialog (role, focus management)
 *
 * @param onDelete callback when delete is confirmed
 */
export function DeletePokButton({ onDelete }: DeletePokButtonProps) {
  const t = useTranslations('poks.delete');
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    if (!showDialog) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDialog(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDialog]);

  const handleDelete = () => {
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        type="button"
        aria-label={t('button')}
        className="text-slate-500 hover:text-red-600 dark:hover:text-red-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
        </svg>
      </Button>

      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md animate-slideUp rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
            <h2
              id="delete-dialog-title"
              className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {t('confirmTitle')}
            </h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              {t('confirmMessage')}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isDeleting}
                type="button"
                autoFocus
              >
                {t('cancelButton')}
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirm}
                disabled={isDeleting}
                type="button"
              >
                {isDeleting ? t('deleting') : t('confirmButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
