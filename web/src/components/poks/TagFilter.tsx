'use client';

import { useTags } from '@/hooks/useTags';

interface TagFilterProps {
  selectedTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
}

/**
 * Horizontal chip list that lets users filter the feed by a single tag.
 *
 * Clicking a chip sets ?tagId=<uuid> in the URL; clicking the active chip
 * deselects it (clears the filter). Uses tagId as the stable key (not name),
 * and renders displayName so canonical names (with dashes) look human-friendly.
 */
export function TagFilter({ selectedTagId, onTagSelect }: TagFilterProps) {
  const { tags } = useTags();

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = tag.tagId === selectedTagId;
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagSelect(isSelected ? null : tag.tagId)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
            style={isSelected ? undefined : { borderLeft: `3px solid ${resolveColor(tag.color)}` }}
            aria-pressed={isSelected}
          >
            {tag.displayName}
          </button>
        );
      })}
    </div>
  );
}

function resolveColor(color: string): string {
  const palette: Record<string, string> = {
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    purple: '#a855f7',
    yellow: '#eab308',
    orange: '#f97316',
    pink: '#ec4899',
    teal: '#14b8a6',
  };
  return palette[color] ?? '#6b7280';
}
