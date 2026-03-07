"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="status"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-10 w-10 text-red-500" strokeWidth={1.5} />
      </div>

      <h2 className="mb-2 font-heading text-xl font-semibold text-[var(--foreground)]">
        Falha ao carregar seus aprendizados
      </h2>

      <p className="mb-6 max-w-md text-[var(--muted)]">
        Ocorreu um erro ao buscar seus aprendizados. Por favor, tente novamente.
      </p>

      <Button onClick={onRetry}>Tentar novamente</Button>
    </div>
  );
}
