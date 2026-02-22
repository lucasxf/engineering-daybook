'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { pokApi, type Pok } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';

interface QuickEntryProps {
  onSaved: (pok: Pok) => void;
}

/**
 * Phase A inline quick-entry for capturing learnings without leaving the feed.
 *
 * Content-only textarea — no title field. Submit via Ctrl+Enter (Cmd+Enter on Mac).
 * On success: clears the textarea, shows a toast (via onSaved callback), and
 * prepends the new learning to the feed.
 *
 * The "New Learning" button remains available in the header for the full-form
 * experience (deliberate entries with titles).
 */
export function QuickEntry({ onSaved }: QuickEntryProps) {
  const t = useTranslations('poks');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setError(null);
    try {
      const pok = await pokApi.create({ content: trimmed });
      setContent('');
      onSaved(pok);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    } finally {
      setSaving(false);
      textareaRef.current?.focus();
    }
  }, [content, saving, onSaved, t]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('quickEntry.placeholder')}
        disabled={saving}
        rows={3}
        className="w-full resize-none rounded-md border border-gray-200 bg-transparent p-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 dark:border-gray-700 dark:placeholder-gray-500"
        aria-label={t('quickEntry.placeholder')}
      />

      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {t('quickEntry.hint')}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? t('quickEntry.saving') : t('form.createButton')}
        </button>
      </div>
    </div>
  );
}
