'use client';

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
 * Options:
 * - Newest first (updatedAt DESC)
 * - Oldest first (updatedAt ASC)
 * - Recently created (createdAt DESC)
 * - First created (createdAt ASC)
 */
export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const t = useTranslations('poks.sort');

  const options: Array<{ key: string; label: string; value: SortOption }> = [
    {
      key: 'updatedAt-DESC',
      label: t('newestFirst'),
      value: { sortBy: 'updatedAt', sortDirection: 'DESC' },
    },
    {
      key: 'updatedAt-ASC',
      label: t('oldestFirst'),
      value: { sortBy: 'updatedAt', sortDirection: 'ASC' },
    },
    {
      key: 'createdAt-DESC',
      label: t('recentlyCreated'),
      value: { sortBy: 'createdAt', sortDirection: 'DESC' },
    },
    {
      key: 'createdAt-ASC',
      label: t('firstCreated'),
      value: { sortBy: 'createdAt', sortDirection: 'ASC' },
    },
  ];

  const currentKey = `${value.sortBy}-${value.sortDirection}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find((opt) => opt.key === e.target.value);
    if (selected) {
      onChange(selected.value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('label')}:
      </label>
      <select
        id="sort-select"
        value={currentKey}
        onChange={handleChange}
        aria-label={t('label')}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
