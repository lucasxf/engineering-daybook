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
        variant="danger"
        onClick={handleDelete}
        type="button"
      >
        {t('button')}
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
