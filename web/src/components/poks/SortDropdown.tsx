'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';

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

  const selectOptions = options.map((o) => ({ value: o.key, label: o.label }));

  const handleChange = (key: string) => {
    const selected = options.find((opt) => opt.key === key);
    if (selected) onChange(selected.value);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {t('label')}:
      </span>
      <Select
        options={selectOptions}
        value={currentKey}
        onChange={handleChange}
        label={t('label')}
      />
    </div>
  );
}
