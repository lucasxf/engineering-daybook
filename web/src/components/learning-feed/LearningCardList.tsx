'use client';

import { Learning } from '@/app/(authenticated)/learning-feed/page';

interface LearningCardListProps {
  learnings: Learning[];
}

function formatDate(date: Date): string {
  const months = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${day} de ${month}`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins}m`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)}s`;
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)}m`;
  return `há ${Math.floor(diffDays / 365)}a`;
}

export default function LearningCardList({ learnings }: LearningCardListProps) {
  return (
    <div className="space-y-3">
      {learnings.map((learning) => (
        <div
          key={learning.id}
          className="group card-hover rounded-md border border-border bg-card p-4 dark:border-mid-blue dark:bg-primary-blue"
        >
          {/* Title */}
          <h3 className="font-heading text-lg font-semibold text-foreground dark:text-parchment line-clamp-2">
            {learning.title}
          </h3>

          {/* Content Preview */}
          <p className="mt-2 text-sm text-muted-foreground dark:text-muted truncate-lines">
            {learning.content}
          </p>

          {/* Tags */}
          {learning.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {learning.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded px-2 py-1 text-xs font-medium bg-input text-muted-foreground dark:bg-mid-blue dark:text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
            <span>Criado {formatDate(new Date(learning.createdAt))}</span>
            <span>·</span>
            <span>Atualizado {formatRelativeTime(new Date(learning.updatedAt))}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
