"use client";

import { BookOpen, SearchX, AlertTriangle } from "lucide-react";

/* ——— Empty: nenhum aprendizado ainda ——— */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Illustration area */}
      <div
        className="
          mb-6 flex h-24 w-24 items-center justify-center
          rounded-2xl border-2 border-dashed border-card-border bg-card
        "
        aria-hidden="true"
      >
        <BookOpen
          className="h-10 w-10 text-muted-foreground opacity-60"
          strokeWidth={1.5}
        />
      </div>

      <h2 className="mb-2 font-heading text-xl font-semibold text-balance text-foreground">
        Sua linha do tempo começa aqui
      </h2>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
        Cada coisa que você aprende fica guardada aqui, organizada por mês.
      </p>
      <button
        type="button"
        className="
          inline-flex items-center gap-2 rounded-lg px-5 py-2.5
          bg-primary text-primary-foreground text-sm font-medium
          hover:bg-primary-hover transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] focus-visible:ring-offset-2
        "
      >
        Salvar seu primeiro aprendizado
      </button>
    </div>
  );
}

/* ——— Empty: busca sem resultados ——— */
export function NoResultsState({ keyword }: { keyword: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="
          mb-6 flex h-24 w-24 items-center justify-center
          rounded-2xl border-2 border-dashed border-card-border bg-card
        "
        aria-hidden="true"
      >
        <SearchX
          className="h-10 w-10 text-muted-foreground opacity-60"
          strokeWidth={1.5}
        />
      </div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-balance text-foreground">
        Nenhum aprendizado encontrado para &ldquo;{keyword}&rdquo;
      </h2>
      <p className="text-sm text-muted-foreground">Tente outra busca</p>
    </div>
  );
}

/* ——— Error state ——— */
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <AlertTriangle
        className="mb-3 h-8 w-8 text-muted-foreground opacity-60"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="mb-3 text-sm text-muted-foreground">
        Não foi possível carregar. Tente novamente.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="
            rounded-md border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground
            hover:border-[var(--color-primary)] hover:text-foreground transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]
          "
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
