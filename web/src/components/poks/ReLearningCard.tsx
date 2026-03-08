'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { pokApi, type PokShare } from '@/lib/pokApi';
import { stripMarkdown } from '@/lib/stripMarkdown';
import { Button } from '@/components/ui/Button';

interface ReLearningCardProps {
  /** The re-learning (PokShare) to display. */
  share: PokShare;
  /** Whether the current user is the sharer and can remove this re-learning. */
  isOwner: boolean;
  /** Called after the re-learning is successfully removed. */
  onRemoved?: () => void;
}

/**
 * Card component for displaying a re-learning (PokShare) in the feed.
 *
 * Shows attribution to the original author and an optional personal note
 * from the sharer. The card links to the original learning's detail page.
 * Owners see a "Remove re-learning" button.
 *
 * @param share  the PokShare to display
 * @param isOwner whether the current user is the sharer
 * @param onRemoved callback after successful removal
 */
export function ReLearningCard({ share, isOwner, onRemoved }: ReLearningCardProps) {
  const params = useParams<{ locale: string }>();
  const t = useTranslations('poks.share');

  const [showConfirm, setShowConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!showConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConfirm(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showConfirm]);

  const original = share.originalPok;
  const header = original.title && original.title.trim()
    ? original.title
    : truncate(original.content, 50);
  const contentPreview = truncate(stripMarkdown(original.content), 100);

  const formattedDate = new Date(share.createdAt).toLocaleDateString(params.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleRemoveConfirm = async () => {
    setIsRemoving(true);
    try {
      await pokApi.unshare(share.id);
      setShowConfirm(false);
      onRemoved?.();
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div className="group relative rounded-lg border border-blue-100 bg-blue-50/30 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-blue-900/40 dark:bg-blue-900/10 dark:hover:border-blue-800">
        {/* Re-learning attribution badge */}
        <div className="flex items-center justify-between px-4 pt-3">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            🔁 @{share.sharedByHandle}
          </p>
          {isOwner && (
            <button
              type="button"
              aria-label={t('remove')}
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              className="rounded-md p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        <Link
          href={`/${params.locale}/poks/${original.id}` as never}
          className="block px-4 pb-4 pt-2"
        >
          <article>
            <h3 className="mb-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
              {header}
            </h3>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              {contentPreview}
            </p>
            {share.note && (
              <blockquote className="mb-2 border-l-2 border-blue-300 pl-3 text-sm italic text-slate-500 dark:border-blue-600 dark:text-slate-400">
                {share.note}
              </blockquote>
            )}
            <time
              dateTime={share.createdAt}
              className="text-xs text-slate-500 dark:text-slate-500"
            >
              {formattedDate}
            </time>
          </article>
        </Link>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-relearning-title"
        >
          <div className="w-full max-w-md animate-slideUp rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
            <h2
              id="remove-relearning-title"
              className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {t('removeConfirmTitle')}
            </h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              {t('removeConfirmMessage')}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isRemoving}
                autoFocus
              >
                {t('cancelButton')}
              </Button>
              <Button
                variant="danger"
                type="button"
                onClick={handleRemoveConfirm}
                disabled={isRemoving}
              >
                {isRemoving ? t('removing') : t('removeConfirmButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
