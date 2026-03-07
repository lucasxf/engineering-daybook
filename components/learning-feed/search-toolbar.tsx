"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import type { SortOption } from "@/lib/types";

const sortOptions: SelectOption[] = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "recentlyUpdated", label: "Atualizados recentemente" },
  { value: "firstCreated", label: "Criados primeiro" },
];

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isSearching?: boolean;
}

export function SearchToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  isSearching = false,
}: SearchToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Search input */}
      <div className="relative flex-1">
        <label htmlFor="search-learnings" className="sr-only">
          Pesquisar aprendizados
        </label>
        {isSearching ? (
          <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--muted-foreground)]" />
        ) : (
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        )}
        <Input
          id="search-learnings"
          type="search"
          placeholder="Pesquisar seus aprendizados..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          aria-label="Pesquisar aprendizados"
        />
      </div>

      {/* Sort dropdown */}
      <Select
        options={sortOptions}
        value={sortBy}
        onChange={(value) => onSortChange(value as SortOption)}
        aria-label="Ordenar por"
        className="w-full sm:w-52"
      />
    </div>
  );
}
