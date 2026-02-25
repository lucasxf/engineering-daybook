'use client';

import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { SortOption } from '@/components/poks/SortDropdown';

/** The default sort is omitted from URLs to keep them clean. */
const DEFAULT_SORT: SortOption = { sortBy: 'createdAt', sortDirection: 'DESC' };

type ActiveView = 'feed' | 'tags' | 'timeline';

/**
 * Persistent tab bar for switching between Feed, Tags, and Timeline views.
 *
 * Carries the current `keyword` and sort state across view transitions so
 * the user never loses their search or sort preference.
 *
 * Accessibility: role="tablist" container, role="tab" + aria-selected on each
 * link, keyboard-operable via native focus order.
 */
export function ViewSwitcher() {
  const t = useTranslations('poks.views');
  const params = useParams<{ locale: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine active view from pathname and search params
  const isTimeline = pathname.includes('/timeline');
  const isTagsView = !isTimeline && searchParams.get('view') === 'tags';
  const activeView: ActiveView = isTimeline ? 'timeline' : isTagsView ? 'tags' : 'feed';

  // Extract shared state to carry across view switches
  const keyword = searchParams.get('keyword') || '';
  const sortBy = searchParams.get('sortBy') as SortOption['sortBy'] | null;
  const sortDirection = searchParams.get('sortDirection') as SortOption['sortDirection'] | null;

  /** Build a query string preserving keyword and non-default sort. */
  function buildParams(extraParams?: Record<string, string>): string {
    const p = new URLSearchParams();

    if (keyword) p.set('keyword', keyword);

    // Carry sort only when it differs from the default
    const effectiveSortBy = sortBy ?? DEFAULT_SORT.sortBy;
    const effectiveSortDir = sortDirection ?? DEFAULT_SORT.sortDirection;
    if (
      effectiveSortBy !== DEFAULT_SORT.sortBy ||
      effectiveSortDir !== DEFAULT_SORT.sortDirection
    ) {
      p.set('sortBy', effectiveSortBy);
      p.set('sortDirection', effectiveSortDir);
    }

    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        p.set(k, v);
      }
    }

    const qs = p.toString();
    return qs ? `?${qs}` : '';
  }

  const locale = params.locale;
  const basePath = `/${locale}/poks`;

  const feedHref = `${basePath}${buildParams()}`;
  const tagsHref = `${basePath}${buildParams({ view: 'tags' })}`;
  const timelineHref = `${basePath}/timeline${buildParams()}`;

  const tabClass = (view: ActiveView) =>
    [
      'px-4 py-2 text-sm font-medium transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
      activeView === view
        ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
    ].join(' ');

  return (
    <div role="tablist" className="flex border-b border-gray-200 dark:border-gray-700">
      <Link
        href={feedHref}
        role="tab"
        aria-selected={activeView === 'feed'}
        className={tabClass('feed')}
      >
        {t('feed')}
      </Link>
      <Link
        href={tagsHref}
        role="tab"
        aria-selected={activeView === 'tags'}
        className={tabClass('tags')}
      >
        {t('tags')}
      </Link>
      <Link
        href={timelineHref}
        role="tab"
        aria-selected={activeView === 'timeline'}
        className={tabClass('timeline')}
      >
        {t('timeline')}
      </Link>
    </div>
  );
}
