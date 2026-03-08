'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Empty state shown when the discovery feed has no items.
 * Provides a CTA to the Discover page.
 */
export function FeedEmptyState() {
  const t = useTranslations('feed');
  const params = useParams<{ locale: string }>();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl" aria-hidden="true">📭</div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
        {t('empty.title')}
      </h2>
      <p className="mb-6 max-w-sm text-slate-500 dark:text-slate-400">
        {t('empty.description')}
      </p>
      <Link
        href={`/${params.locale}/discover` as never}
        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        {t('empty.discoverCta')}
      </Link>
    </div>
  );
}
