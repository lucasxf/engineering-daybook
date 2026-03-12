"use client";

import { Pencil, Trash2 } from "lucide-react";
import { LearningMarkdown } from "./learning-markdown";

interface Learning {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface LearningContentProps {
  learning: Learning;
  onDeleteClick: () => void;
}

function formatDatePtBr(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LearningContent({ learning, onDeleteClick }: LearningContentProps) {
  const hasTitle = learning.title.trim().length > 0;
  const derivedTitle = learning.content.slice(0, 60).replace(/[#*`_]/g, "").trim();
  const displayTitle = hasTitle ? learning.title : derivedTitle;

  return (
    <article>
      {/* Page header row */}
      <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1
          className={`font-heading text-2xl font-semibold leading-tight text-balance sm:text-3xl ${
            hasTitle ? "text-foreground" : "text-muted-foreground italic"
          }`}
        >
          {displayTitle}
          {!hasTitle && <span className="sr-only"> (derivado do conteúdo)</span>}
        </h1>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="#"
            aria-label="Editar este aprendizado"
            className="edit-btn inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Editar
          </a>
          <button
            onClick={onDeleteClick}
            aria-label="Excluir este aprendizado"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E53E3E] px-3 py-1.5 text-sm font-medium text-[#E53E3E] transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E53E3E]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Excluir
          </button>
        </div>
      </div>

      {/* Metadata row */}
      <div className="mb-6 flex flex-wrap gap-x-1.5 gap-y-1 text-xs text-muted-foreground font-sans">
        <span suppressHydrationWarning>
          Salvo em{" "}
          <time dateTime={learning.createdAt}>{formatDatePtBr(learning.createdAt)}</time>
        </span>
        <span aria-hidden="true">·</span>
        <span suppressHydrationWarning>
          Atualizado em{" "}
          <time dateTime={learning.updatedAt}>{formatDatePtBr(learning.updatedAt)}</time>
        </span>
      </div>

      {/* Content card */}
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm sm:p-8">
        <LearningMarkdown content={learning.content} />

        {/* Tags */}
        {learning.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2" aria-label="Tags do aprendizado">
            {learning.tags.map((tag) => (
              <span
                key={tag}
                className="tag-pill rounded-full px-3 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
