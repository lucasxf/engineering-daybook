"use client";

import { BookOpen, SearchX, AlertTriangle } from "lucide-react";

/* ——— Empty: nenhum aprendizado salvo ——— */
export function TagFeedEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--color-tag-count)" }}
        aria-hidden="true"
      >
        <BookOpen
          className="h-6 w-6"
          style={{ color: "var(--color-tab-inactive)" }}
        />
      </div>
      <h2
        className="mb-2 font-heading text-xl font-semibold"
        style={{ color: "var(--color-tag-header-text)" }}
      >
        Você ainda não salvou nenhum aprendizado
      </h2>
      <p
        className="mb-6 max-w-xs text-sm leading-relaxed text-pretty"
        style={{ color: "var(--color-nudge-text)" }}
      >
        Registre o que você aprendeu hoje — uma descoberta, uma nota, um insight.
      </p>
      <a
        href="#"
        className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        }}
      >
        Salvar seu primeiro aprendizado
      </a>
    </div>
  );
}

/* ——— Empty: busca sem resultados ——— */
export function TagFeedNoResults({ keyword }: { keyword: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--color-tag-count)" }}
        aria-hidden="true"
      >
        <SearchX
          className="h-6 w-6"
          style={{ color: "var(--color-tab-inactive)" }}
        />
      </div>
      <h2
        className="mb-1 font-heading text-xl font-semibold text-balance"
        style={{ color: "var(--color-tag-header-text)" }}
      >
        Nenhum aprendizado encontrado para{" "}
        <span style={{ color: "var(--color-tab-active)" }}>
          &ldquo;{keyword}&rdquo;
        </span>
      </h2>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--color-nudge-text)" }}
      >
        Tente outra palavra-chave ou limpe a busca.
      </p>
    </div>
  );
}

/* ——— Error: falha ao carregar ——— */
export function TagFeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--color-tag-count)" }}
        aria-hidden="true"
      >
        <AlertTriangle
          className="h-6 w-6"
          style={{ color: "var(--color-nudge-link)" }}
        />
      </div>
      <h2
        className="mb-1 font-heading text-xl font-semibold"
        style={{ color: "var(--color-tag-header-text)" }}
      >
        Algo deu errado
      </h2>
      <p
        className="mb-4 text-sm"
        style={{ color: "var(--color-nudge-text)" }}
      >
        Não foi possível carregar. Tente novamente.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] hover:opacity-80"
        style={{
          borderColor: "var(--color-card-border)",
          color: "var(--color-foreground)",
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
