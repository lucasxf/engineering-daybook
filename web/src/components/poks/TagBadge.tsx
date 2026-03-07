'use client';

import { Tag } from '@/lib/tagApi';
import { resolveTagColor } from '@/lib/tagColors';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: (tagId: string) => void;
}

/**
 * Displays a colored tag badge. Optionally shows a remove button.
 * Uses Library at Dusk design system tokens.
 */
export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
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
          className="ml-0.5 rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Remove tag ${tag.displayName}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
