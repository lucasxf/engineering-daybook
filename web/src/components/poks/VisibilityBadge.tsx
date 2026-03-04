'use client';

import { useTranslations } from 'next-intl';

export type Visibility = 'PRIVATE' | 'PUBLIC';

interface VisibilityBadgeProps {
  visibility: Visibility;
}

/**
 * Displays a compact badge indicating whether a learning is private or public.
 */
export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const t = useTranslations('poks.visibility');

  if (visibility === 'PUBLIC') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
        aria-label={t('public')}
      >
        <span aria-hidden="true">🌐</span>
        {t('public')}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
      aria-label={t('private')}
    >
      <span aria-hidden="true">🔒</span>
      {t('private')}
    </span>
  );
}
