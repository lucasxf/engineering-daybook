'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/30 dark:bg-red-950/10">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
      </div>

      <h2 className="text-xl font-heading font-semibold text-foreground dark:text-parchment">
        Falha ao carregar seus aprendizados
      </h2>

      <p className="mt-2 text-sm text-muted-foreground dark:text-muted">
        Tente novamente em alguns momentos.
      </p>

      <button
        onClick={onRetry}
        className="mt-6 rounded-md bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-red-700 active:scale-95"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
