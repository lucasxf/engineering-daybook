'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import type { Pok } from '@/lib/pokApi';

interface LearningCardListProps {
  learnings: Pok[];
}

export default function LearningCardList({ learnings }: LearningCardListProps) {
  const t = useTranslations('poks');

  return (
    <div className="space-y-3">
      {learnings.map((learning) => {
        const createdDate = new Date(learning.createdAt);
        const updatedDate = new Date(learning.updatedAt);
        const formattedDate = format(createdDate, 'MMM d');
        const relativeTime = formatDistanceToNow(updatedDate, { addSuffix: true });

        return (
          <div
            key={learning.id}
            className="group card-hover rounded-md border border-border bg-card p-4 dark:border-mid-blue dark:bg-primary-blue"
          >
            {/* Title */}
            {learning.title && (
              <h3 className="font-heading text-lg font-semibold text-foreground dark:text-parchment line-clamp-2">
                {learning.title}
              </h3>
            )}

            {/* Content Preview */}
            <p className="mt-2 text-sm text-muted-foreground dark:text-muted truncate-lines">
              {learning.content}
            </p>

            {/* Tags */}
            {learning.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {learning.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block rounded px-2 py-1 text-xs font-medium bg-input text-muted-foreground dark:bg-mid-blue dark:text-blue-200"
                  >
                    {tag.displayName ?? tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
              <span>{t('feed.card.createdAt', { date: formattedDate })}</span>
              <span>·</span>
              <span>{t('feed.card.updatedAt', { relativeTime })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
