"use client";

import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

interface NoResultsStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export function NoResultsState({
  searchQuery,
  onClearSearch,
}: NoResultsStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="status"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--secondary)]/20">
        <SearchX className="h-10 w-10 text-[var(--secondary)]" strokeWidth={1.5} />
      </div>

      <h2 className="mb-2 font-heading text-xl font-semibold text-[var(--foreground)]">
        Nenhum aprendizado encontrado para sua pesquisa
      </h2>

      <p className="mb-6 max-w-md text-[var(--muted)]">
        Nenhum resultado para &quot;{searchQuery}&quot;. Tente ajustar seus termos de busca ou
        filtros.
      </p>

      <Button variant="secondary" onClick={onClearSearch}>
        Limpar pesquisa
      </Button>
    </div>
  );
}
