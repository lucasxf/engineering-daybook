'use client';

import { Plus } from 'lucide-react';

interface PageHeaderProps {
  totalCount: number;
  onNewLearning: () => void;
}

export default function PageHeader({ totalCount, onNewLearning }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-heading font-semibold text-foreground dark:text-parchment">
          Meus Aprendizados
        </h1>
        <p className="mt-1 text-sm text-muted dark:text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'aprendizado' : 'aprendizados'}
        </p>
      </div>

      <button
        onClick={onNewLearning}
        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent/90 active:scale-95 dark:shadow-lg dark:hover:shadow-xl"
      >
        <Plus className="h-4 w-4" />
        <span>Novo Aprendizado</span>
      </button>
    </div>
  );
}
