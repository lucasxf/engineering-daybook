'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Tag } from '@/lib/tagApi';
import { useTags } from '@/hooks/useTags';
import { TagBadge } from './TagBadge';

interface TagPickerProps {
  selectedTags: Tag[];
  onSelectionChange: (tags: Tag[]) => void;
}

/**
 * Inline tag picker that works without a pokId.
 *
 * Manages local selection state only — no API calls for assignment.
 * The caller is responsible for passing selectedTags.map(t => t.id) to the
 * create/save endpoint when the parent form submits.
 *
 * Reuses the same dropdown UI as TagSection.
 */
export function TagPicker({ selectedTags, onSelectionChange }: TagPickerProps) {
  const tTags = useTranslations('tags');
  const { tags: userTags, createTag } = useTags();

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

  const selectedIds = new Set(selectedTags.map((t) => t.id));
  const availableTags = userTags.filter((t) => !selectedIds.has(t.id));

  const handleRemove = (tagId: string) => {
    onSelectionChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleSelect = (tag: Tag) => {
    onSelectionChange([...selectedTags, tag]);
    setShowPicker(false);
  };

  const handleCreateAndSelect = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setIsBusy(true);
    try {
      const tag = await createTag(name);
      if (tag) {
        onSelectionChange([...selectedTags, tag]);
        setNewTagName('');
        setShowPicker(false);
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        {selectedTags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} onRemove={handleRemove} />
        ))}

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
                        onClick={() => handleSelect(tag)}
                        className="w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
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
                      if (e.key === 'Enter') handleCreateAndSelect();
                      if (e.key === 'Escape') setShowPicker(false);
                    }}
                    placeholder={tTags('createNew')}
                    className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    disabled={isBusy}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateAndSelect}
                    disabled={isBusy || !newTagName.trim()}
                    className="rounded bg-primary-600 px-2 py-1 text-xs text-white hover:bg-primary-700 disabled:opacity-50"
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
    </div>
  );
}
