"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      className="flex items-center justify-center gap-4"
      aria-label="Paginação"
    >
      <Button
        variant="pagination"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        aria-disabled={isFirstPage}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      <span className="text-sm text-[var(--muted)]">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="pagination"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        aria-disabled={isLastPage}
        aria-label="Próxima página"
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
