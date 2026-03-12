"use client";

import { Search, ChevronDown } from "lucide-react";
import type { SortOption } from "./types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigas" },
  { value: "updated", label: "Atualizados recentemente" },
];

interface SearchSortToolbarProps {
  keyword: string;
  sortBy: SortOption;
  onKeywordChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
}

export function SearchSortToolbar({
  keyword,
  sortBy,
  onKeywordChange,
  onSortChange,
}: SearchSortToolbarProps) {
  return (
    <div className="flex gap-2 px-5 py-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Buscar aprendizados"
          placeholder="Buscar aprendizados…"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="
            w-full rounded-lg border py-2 pl-9 pr-3.5 text-sm
            bg-input border-input-border text-foreground
            placeholder:text-muted-foreground
            transition-colors
            focus:outline-none focus:border-[var(--color-input-focus)] focus:ring-1 focus:ring-[var(--color-input-focus)]
          "
        />
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          aria-label="Ordenar aprendizados"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="
            appearance-none cursor-pointer rounded-lg border py-2 pl-3 pr-8 text-sm
            bg-input border-input-border text-foreground
            transition-colors
            focus:outline-none focus:border-[var(--color-input-focus)] focus:ring-1 focus:ring-[var(--color-input-focus)]
          "
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
