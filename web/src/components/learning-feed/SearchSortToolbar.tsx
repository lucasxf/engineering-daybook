'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchSortToolbarProps {
  keyword: string;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
  onSearch: (query: string) => void;
  onSort: (sortBy: string, sortDirection: 'ASC' | 'DESC') => void;
  onClearSearch: () => void;
  isSearching: boolean;
}

const SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Mais Recentes' },
  { value: 'createdAt:ASC', label: 'Mais Antigos' },
  { value: 'updatedAt:DESC', label: 'Recentemente Atualizados' },
  { value: 'updatedAt:ASC', label: 'Atualizados Primeiro' },
];

export default function SearchSortToolbar({
  keyword,
  sortBy,
  sortDirection,
  onSearch,
  onSort,
  onClearSearch,
  isSearching,
}: SearchSortToolbarProps) {
  const [searchInput, setSearchInput] = useState(keyword);
  const [debouncedSearch, setDebouncedSearch] = useState(keyword);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      if (searchInput !== keyword) {
        onSearch(searchInput);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, keyword, onSearch]);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const [newSortBy, newSortDirection] = value.split(':') as [string, 'ASC' | 'DESC'];
      onSort(newSortBy, newSortDirection);
    },
    [onSort]
  );

  const currentSortValue = `${sortBy}:${sortDirection}`;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted dark:text-mid-blue" />
          ) : (
            <Search className="h-4 w-4 text-muted dark:text-muted-foreground" />
          )}
        </div>
        <input
          type="text"
          placeholder="Pesquisar seus aprendizados..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none dark:border-mid-blue dark:bg-deep-navy dark:text-parchment dark:focus:border-ember-cta"
          aria-label="Pesquisar aprendizados"
        />
      </div>

      {/* Sort Dropdown */}
      <select
        value={currentSortValue}
        onChange={handleSortChange}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none dark:border-mid-blue dark:bg-deep-navy dark:text-parchment dark:focus:border-ember-cta"
        aria-label="Ordenar aprendizados"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Clear Search Button */}
      {keyword && (
        <button
          onClick={onClearSearch}
          className="rounded-md border border-accent bg-transparent px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 dark:border-ember-cta dark:text-ember-cta dark:hover:bg-ember-cta/10"
        >
          Limpar
        </button>
      )}
    </div>
  );
}
