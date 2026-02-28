'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { pokApi, type Pok } from '@/lib/pokApi';
import { tagApi } from '@/lib/tagApi';
import { ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { DeletePokButton } from '@/components/poks/DeletePokButton';
import { TagBadge } from '@/components/poks/TagBadge';
import { TagSuggestionPrompt } from '@/components/poks/TagSuggestionPrompt';
import { useTags } from '@/hooks/useTags';

/**
 * Page for viewing a single POK.
 *
 * Features:
 * - Fetches POK by ID
 * - Displays title (if present) and content
 * - Displays assigned tags with remove action
 * - Shows AI tag suggestions for approval/rejection
 * - Inline tag picker: assign existing tags or create new ones
 * - Formatted timestamps
 * - Edit button (links to edit page)
 * - Delete button with confirmation
 */
export default function ViewPokPage() {
  const t = useTranslations('poks');
  const tTags = useTranslations('tags');
  const router = useRouter();
  const params = useParams<{ locale: string; id: string }>();
  const pokId = params.id;

  const [pok, setPok] = useState<Pok | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Tag picker state
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isTagging, setIsTagging] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { tags: userTags, createTag, assignTag } = useTags();

  useEffect(() => {
    loadPok();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokId]);

  // Close picker on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowTagPicker(false);
      }
    }
    if (showTagPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTagPicker]);

  const loadPok = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pokApi.getById(pokId);
      setPok(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await pokApi.delete(pokId);
      setShowSuccessToast(true);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    }
  };

  const handleSuccessToastDismiss = () => {
    router.push(`/${params.locale}/poks` as never);
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      await tagApi.remove(pokId, tagId);
      await loadPok();
    } catch {
      // Silently ignore — tag may already be removed
    }
  };

  const handleAssignTag = async (tagId: string) => {
    setIsTagging(true);
    try {
      await assignTag(pokId, tagId);
      await loadPok();
      setShowTagPicker(false);
    } finally {
      setIsTagging(false);
    }
  };

  const handleCreateAndAssignTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setIsTagging(true);
    try {
      const tag = await createTag(name);
      if (tag) {
        await assignTag(pokId, tag.id);
        await loadPok();
      }
      setNewTagName('');
      setShowTagPicker(false);
    } finally {
      setIsTagging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error !== null || !pok) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          {error || t('errors.notFound')}
        </div>
        <Link href={`/${params.locale}/poks` as never}>
          <Button className="mt-4">{t('view.backButton')}</Button>
        </Link>
      </div>
    );
  }

  const assignedTagIds = new Set(pok.tags.map((tag) => tag.id));
  const availableTags = userTags.filter((tag) => !assignedTagIds.has(tag.id));

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/${params.locale}/poks` as never}>
          <Button variant="secondary">{t('view.backButton')}</Button>
        </Link>
        <div className="flex space-x-2">
          <Link href={`/${params.locale}/poks/${pokId}/edit` as never}>
            <Button>{t('view.editButton')}</Button>
          </Link>
          <DeletePokButton onDelete={handleDelete} />
        </div>
      </div>

      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {pok.title && (
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {pok.title}
          </h1>
        )}
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {pok.content}
          </p>
        </div>

        {/* Tags section */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-1">
            {pok.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} onRemove={handleRemoveTag} />
            ))}

            {/* Tag picker */}
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setShowTagPicker((v) => !v)}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-gray-400 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-600 dark:border-gray-500 dark:text-gray-500 dark:hover:border-gray-300 dark:hover:text-gray-300"
                aria-label={tTags('addTag')}
              >
                +
              </button>

              {showTagPicker && (
                <div className="absolute left-0 top-7 z-10 w-52 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {availableTags.length > 0 && (
                    <ul className="max-h-40 overflow-y-auto py-1">
                      {availableTags.map((tag) => (
                        <li key={tag.id}>
                          <button
                            type="button"
                            disabled={isTagging}
                            onClick={() => handleAssignTag(tag.id)}
                            className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            {tag.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-t border-gray-100 p-2 dark:border-gray-700">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateAndAssignTag();
                          if (e.key === 'Escape') setShowTagPicker(false);
                        }}
                        placeholder={tTags('createNew')}
                        className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        disabled={isTagging}
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateAndAssignTag}
                        disabled={isTagging || !newTagName.trim()}
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI tag suggestions */}
          {pok.pendingSuggestions && pok.pendingSuggestions.length > 0 && (
            <TagSuggestionPrompt
              pokId={pokId}
              suggestions={pok.pendingSuggestions}
              onResolved={loadPok}
            />
          )}
        </div>

        <div className="mt-6 flex space-x-4 text-sm text-gray-500 dark:text-gray-500">
          <time dateTime={pok.createdAt}>
            {t('view.created')}: {new Date(pok.createdAt).toLocaleDateString(params.locale)}
          </time>
          <time dateTime={pok.updatedAt}>
            {t('view.updated')}: {new Date(pok.updatedAt).toLocaleDateString(params.locale)}
          </time>
        </div>
      </article>

      {showSuccessToast && (
        <Toast message={t('success.deleted')} onDismiss={handleSuccessToastDismiss} />
      )}
    </div>
  );
}
