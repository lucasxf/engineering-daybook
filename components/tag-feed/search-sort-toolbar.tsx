"use client";

import { Search, ChevronDown } from "lucide-react";

export type SortOption = "newest" | "oldest" | "updated";

interface SearchSortToolbarProps {
  keyword: string;
  sort: SortOption;
  onKeywordChange: (v: string) => void;
  onSortChange: (v: SortOption) => void;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Mais recentes",
  oldest: "Mais antigas",
  updated: "Atualizados recentemente",
};

export function SearchSortToolbar({
  keyword,
  sort,
  onKeywordChange,
  onSortChange,
}: SearchSortToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--color-tab-inactive)" }}
          aria-hidden="true"
        />
        <input
          type="search"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Buscar aprendizados…"
          aria-label="Buscar aprendizados"
          className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:ring-1 focus:ring-[var(--color-input-focus)]"
          style={{
            backgroundColor: "var(--color-input)",
            borderColor: "var(--color-input-border)",
            color: "var(--color-foreground)",
          }}
        />
      </div>

      {/* Sort dropdown */}
      <div className="relative shrink-0">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          aria-label="Ordenar aprendizados"
          className="appearance-none rounded-lg border py-2 pl-3 pr-8 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-[var(--color-input-focus)]"
          style={{
            backgroundColor: "var(--color-input)",
            borderColor: "var(--color-input-border)",
            color: "var(--color-foreground)",
          }}
        >
          {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: "var(--color-tab-inactive)" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
