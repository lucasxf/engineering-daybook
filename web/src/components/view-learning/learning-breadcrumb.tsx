import { ArrowLeft } from "lucide-react";

export function LearningBreadcrumb() {
  return (
    <nav aria-label="Navegação estrutural" className="mb-6">
      <a
        href="#"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-link)] transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] rounded"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Meus Aprendizados
      </a>
    </nav>
  );
}
