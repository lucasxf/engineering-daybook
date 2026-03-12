"use client";

import { Sun, Moon, UserCircle, ArrowLeft } from "lucide-react";
import { LearnimoWordmark } from "@/components/learnimo-wordmark";
import { EditLearningForm } from "@/components/edit-learning-form";

/* ——— Toggle de tema ——— */
function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "dark" | "light";
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={
        theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"
      }
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-input-focus)]"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

/* ——— Avatar do usuário (simulado) ——— */
function UserAvatar() {
  return (
    <button
      aria-label="Menu do usuário"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-card-border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-input-focus)] overflow-hidden"
    >
      <UserCircle className="h-7 w-7" aria-hidden="true" />
    </button>
  );
}

/* ——— Tela principal ——— */
export function EditLearningScreen({
  theme,
  onToggle,
}: {
  theme: "dark" | "light";
  onToggle: () => void;
}) {
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="flex min-h-full flex-col bg-background font-sans">
        {/* ——— Barra de navegação ——— */}
        <header className="flex items-center justify-between border-b border-card-border px-6 py-4">
          <a
            href="#"
            aria-label="learnimo — página inicial"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] rounded"
          >
            <LearnimoWordmark className="text-xl" />
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={onToggle} />
            <UserAvatar />
          </div>
        </header>

        {/* ——— Conteúdo principal ——— */}
        <main className="flex flex-1 justify-center px-4 py-10 md:py-14">
          <div className="w-full max-w-[720px]">
            {/* Botão de voltar (mobile-friendly) */}
            <a
              href="#"
              className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Voltar para o aprendizado
            </a>

            <EditLearningForm />
          </div>
        </main>

        {/* ——— Rodapé ——— */}
        <footer className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} learnimo
          </p>
        </footer>
      </div>
    </div>
  );
}
