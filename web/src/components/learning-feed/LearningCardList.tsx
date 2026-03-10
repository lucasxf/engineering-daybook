'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { FeedItem } from '@/lib/pokApi';

interface LearningCardListProps {
  learnings: FeedItem[];
}

function formatRelativeTime(date: Date, locale: string): string {
  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, 'second');
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  return rtf.format(diffDays, 'day');
}

export default function LearningCardList({ learnings }: LearningCardListProps) {
  const params = useParams<{ locale: string }>();
  const t = useTranslations('poks');

  return (
    <div className="space-y-3">
      {learnings.map((learning) => {
        // This feed shows owned learnings only; re-learnings (PokShare) are handled separately.
        if (learning.type !== 'owned') return null;
        const createdDate = new Date(learning.createdAt);
        const updatedDate = new Date(learning.updatedAt);
        const formattedDate = createdDate.toLocaleDateString(params.locale, {
          month: 'short',
          day: 'numeric',
        });
        const relativeTime = formatRelativeTime(updatedDate, params.locale);

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
