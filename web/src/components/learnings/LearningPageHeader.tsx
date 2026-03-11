'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

interface LearningPageHeaderProps {
  locale: string;
}

/**
 * Page header for the Create Learning screen.
 * Includes page title and back navigation link to the feed.
 */
export function LearningPageHeader({ locale }: LearningPageHeaderProps) {
  const t = useTranslations('learnings.create');

  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex-1">
        <h1 className="font-heading text-3xl font-600 text-foreground text-balance">
          {t('pageHeader')}
        </h1>
      </div>
      <Link
        href={`/${locale}/poks`}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Back to feed"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back to feed</span>
      </Link>
    </div>
  );
}
