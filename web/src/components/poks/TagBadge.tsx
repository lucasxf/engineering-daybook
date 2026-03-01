'use client';

import { Tag } from '@/lib/tagApi';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: (tagId: string) => void;
}

/**
 * Displays a colored tag badge. Optionally shows a remove button.
 */
export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
      style={{ borderLeft: `3px solid ${resolveColor(tag.color)}` }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(tag.id);
          }}
          className="ml-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label={`Remove tag ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

/**
 * Maps named colors to CSS color values.
 */
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
