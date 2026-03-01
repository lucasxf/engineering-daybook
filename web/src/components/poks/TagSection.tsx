'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Tag, TagSuggestion } from '@/lib/tagApi';
import { useTags } from '@/hooks/useTags';
import { TagBadge } from './TagBadge';
import { TagSuggestionPrompt } from './TagSuggestionPrompt';

interface TagSectionProps {
  pokId: string;
  tags: Tag[];
  pendingSuggestions: TagSuggestion[];
  onChanged: () => void;
}

/**
 * Self-contained tag management section for a single POK.
 *
 * Renders assigned tag badges (with remove), a prominent "Add tag" button that
 * opens an inline dropdown for assigning existing tags or creating new ones,
 * and the AI suggestion prompt when pending suggestions exist.
 *
 * Used on both ViewPokPage and EditPokPage.
 */
export function TagSection({ pokId, tags, pendingSuggestions, onChanged }: TagSectionProps) {
  const tTags = useTranslations('tags');
  const { tags: userTags, createTag, assignTag, removeTag } = useTags();

  const [showPicker, setShowPicker] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const assignedIds = new Set(tags.map((t) => t.id));
  const availableTags = userTags.filter((t) => !assignedIds.has(t.id));

  const handleRemove = async (tagId: string) => {
    try {
      await removeTag(pokId, tagId);
      onChanged();
    } catch {
      // Silently ignore — tag may already be removed
    }
  };

  const handleAssign = async (tagId: string) => {
    setIsBusy(true);
    try {
      await assignTag(pokId, tagId);
      onChanged();
      setShowPicker(false);
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateAndAssign = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setIsBusy(true);
    try {
      const tag = await createTag(name);
      if (tag) {
        await assignTag(pokId, tag.id);
        onChanged();
        setNewTagName('');
        setShowPicker(false);
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mt-4">
      {/* Assigned tag badges + Add tag button */}
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} onRemove={handleRemove} />
        ))}

        {/* Prominent add-tag button with dropdown */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-400 px-2 py-0.5 text-xs text-slate-500 hover:border-slate-600 hover:text-slate-700 dark:border-slate-500 dark:text-slate-400 dark:hover:border-slate-300 dark:hover:text-slate-300"
            aria-label={tTags('addTag')}
          >
            + {tTags('addTag')}
          </button>

          {showPicker && (
            <div className="absolute left-0 top-8 z-10 w-52 rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {availableTags.length > 0 && (
                <ul className="max-h-40 overflow-y-auto py-1">
                  {availableTags.map((tag) => (
                    <li key={tag.id}>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAssign(tag.id)}
                        className="w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {tag.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-slate-100 p-2 dark:border-slate-700">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateAndAssign();
                      if (e.key === 'Escape') setShowPicker(false);
                    }}
                    placeholder={tTags('createNew')}
                    className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    disabled={isBusy}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateAndAssign}
                    disabled={isBusy || !newTagName.trim()}
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                    aria-label={tTags('createNew')}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI suggestions */}
      {pendingSuggestions && pendingSuggestions.length > 0 && (
        <TagSuggestionPrompt
          pokId={pokId}
          suggestions={pendingSuggestions}
          onResolved={onChanged}
        />
      )}
    </div>
  );
}
