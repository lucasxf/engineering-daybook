'use client';

import { Book } from 'lucide-react';

interface EmptyStateProps {
  onNewLearning: () => void;
}

export default function EmptyState({ onNewLearning }: EmptyStateProps) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/30 p-8 text-center dark:border-mid-blue">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/10 dark:bg-mid-blue/20">
        <Book className="h-8 w-8 text-muted dark:text-mid-blue" />
      </div>

      <h2 className="text-xl font-heading font-semibold text-foreground dark:text-parchment">
        Sua jornada de conhecimento começa aqui
      </h2>

      <p className="mt-2 text-sm text-muted-foreground dark:text-muted">
        Salve seu primeiro aprendizado para começar a construir seu diário pessoal.
      </p>

      <button
        onClick={onNewLearning}
        className="mt-6 rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent/90 active:scale-95 dark:shadow-lg"
      >
        Salvar Primeiro Aprendizado
      </button>
    </div>
  );
}
