'use client';

import { type ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';

export interface SortOption {
  sortBy: 'createdAt' | 'updatedAt';
  sortDirection: 'ASC' | 'DESC';
}

interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

/**
 * Sort dropdown component for POK list.
 *
 * Three-option model (spec FR18):
 * - Newest first     (createdAt DESC) — default, omitted from URL
 * - Oldest first     (createdAt ASC)
 * - Recently updated (updatedAt DESC)
 *
 * Legacy URL params (`sortBy=updatedAt&sortDirection=DESC`) that matched the
 * old default are gracefully mapped to "Recently updated" rather than
 * discarded, avoiding broken bookmarks.
 */
export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const t = useTranslations('poks.sort');

  const options: Array<{ key: string; label: string; value: SortOption }> = [
    {
      key: 'createdAt-DESC',
      label: t('newestFirst'),
      value: { sortBy: 'createdAt', sortDirection: 'DESC' },
    },
    {
      key: 'createdAt-ASC',
      label: t('oldestFirst'),
      value: { sortBy: 'createdAt', sortDirection: 'ASC' },
    },
    {
      key: 'updatedAt-DESC',
      label: t('recentlyUpdated'),
      value: { sortBy: 'updatedAt', sortDirection: 'DESC' },
    },
  ];

  const currentKey = `${value.sortBy}-${value.sortDirection}`;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find((opt) => opt.key === e.target.value);
    if (selected) {
      onChange(selected.value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {t('label')}:
      </label>
      <select
        id="sort-select"
        value={currentKey}
        onChange={handleChange}
        aria-label={t('label')}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
