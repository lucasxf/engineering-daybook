'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface NoSearchResultsProps {
  onClearSearch: () => void;
}

/**
 * Empty state component displayed when search returns no results.
 * Uses Library at Dusk design system tokens.
 *
 * Features:
 * - Informative message with hint
 * - Clear search button to reset filters
 * - i18n support
 */
export function NoSearchResults({ onClearSearch }: NoSearchResultsProps) {
  const t = useTranslations('poks.search');

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      {/* Icon */}
      <svg
        className="mb-4 h-16 w-16 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Message */}
      <h3 className="mb-2 font-heading text-lg font-medium text-foreground">
        {t('noResults')}
      </h3>

      {/* Hint */}
      <p className="mb-6 text-sm text-muted-foreground">
        {t('noResultsSemanticHint')}
      </p>

      {/* Clear button */}
      <Button onClick={onClearSearch} variant="secondary">
        {t('clearButton')}
      </Button>
    </div>
  );
}
