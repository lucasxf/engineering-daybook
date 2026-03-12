"use client";

import { Sun, Moon, User } from "lucide-react";
import { LearnimoWordmark } from "@/components/learnimo-wordmark";

interface LearnimoNavProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export function LearnimoNav({ theme, onToggle }: LearnimoNavProps) {
  return (
    <header
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{
        backgroundColor: "var(--color-nav-bg)",
        borderColor: "var(--color-nav-border)",
      }}
    >
      <a
        href="#"
        aria-label="learnimo — ir para o início"
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
      >
        <LearnimoWordmark className="text-xl" />
      </a>

      <div className="flex items-center gap-2">
        {/* Avatar / user menu */}
        <button
          type="button"
          aria-label="Menu do usuário"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-card border border-card-border text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
        >
          <User className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Theme toggle */}
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
      </div>
    </header>
  );
}
