'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrevious}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-input dark:border-mid-blue dark:bg-primary-blue dark:hover:enabled:bg-mid-blue/50"
        aria-disabled={!canPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Anterior</span>
      </button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted">
        <span>Página</span>
        <span className="font-semibold text-foreground dark:text-parchment">{currentPage}</span>
        <span>de</span>
        <span className="font-semibold text-foreground dark:text-parchment">{totalPages}</span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-input dark:border-mid-blue dark:bg-primary-blue dark:hover:enabled:bg-mid-blue/50"
        aria-disabled={!canNext}
      >
        <span>Próxima</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
