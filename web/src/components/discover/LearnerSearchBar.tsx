'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';

interface LearnerSearchBarProps {
  value: string;
  onChange: (q: string) => void;
}

/**
 * Search input for the learner discovery page.
 * Fires onChange on every keystroke; debouncing is handled by the hook.
 */
export function LearnerSearchBar({ value, onChange }: LearnerSearchBarProps) {
  const t = useTranslations('discover');

  return (
    <div className="relative w-full">
      <label htmlFor="learner-search" className="sr-only">
        {t('searchPlaceholder')}
      </label>
      <Input
        id="learner-search"
        type="search"
        placeholder={t('searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        aria-label={t('searchPlaceholder')}
        className="w-full"
      />
    </div>
  );
}
