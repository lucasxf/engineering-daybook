'use client';

import { type KeyboardEvent, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  initialValue?: string;
  placeholder?: string;
}

/**
 * Search bar component with debounced input.
 *
 * Features:
 * - Debounced search input (300ms delay)
 * - Triggers on Enter key press
 * - Triggers on search button click
 * - Auto-triggers after debounce delay
 */
export function SearchBar({ onSearch, initialValue = '', placeholder }: SearchBarProps) {
  const t = useTranslations('poks.search');
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 300);

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  const handleSearchClick = () => {
    onSearch(value);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('placeholder')}
        aria-label={t('placeholder')}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
      />
      <button
        type="button"
        onClick={handleSearchClick}
        aria-label={t('button')}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
}
