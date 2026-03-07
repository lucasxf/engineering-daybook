"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="status"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--secondary)]/20">
        <BookOpen className="h-10 w-10 text-[var(--secondary)]" strokeWidth={1.5} />
      </div>

      <h2 className="mb-2 font-heading text-xl font-semibold text-[var(--foreground)]">
        Sua jornada de conhecimento começa aqui
      </h2>

      <p className="mb-6 max-w-md text-[var(--muted)]">
        Salve seu primeiro aprendizado para começar.
      </p>

      <Button>
        <Plus className="h-4 w-4" />
        Salvar Aprendizado
      </Button>
    </div>
  );
}
