'use client';

import { Tag } from '@/lib/tagApi';
import { resolveTagColor } from '@/lib/tagColors';

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
      style={{ borderLeft: `3px solid ${resolveTagColor(tag.color)}` }}
    >
      {tag.displayName}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(tag.id);
          }}
          className="ml-0.5 rounded-full text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
          aria-label={`Remove tag ${tag.displayName}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

