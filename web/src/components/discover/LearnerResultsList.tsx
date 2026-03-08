'use client';

import { useTranslations } from 'next-intl';
import { LearnerResultCard } from './LearnerResultCard';
import type { LearnerSearchResult } from '@/lib/learnerApi';

interface LearnerResultsListProps {
  results: LearnerSearchResult[];
  query: string;
  onFollowChanged?: () => void;
}

/**
 * Renders the list of learner search results, or an appropriate empty state.
 */
export function LearnerResultsList({ results, query, onFollowChanged }: LearnerResultsListProps) {
  const t = useTranslations('discover');

  if (query.trim().length < 2) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {t('minCharsHint')}
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="font-medium text-slate-700 dark:text-slate-300">{t('noResults')}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('noResultsHint')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Learner search results" aria-live="polite">
      {results.map((learner) => (
        <li key={learner.handle}>
          <LearnerResultCard learner={learner} onFollowChanged={onFollowChanged} />
        </li>
      ))}
    </ul>
  );
}
