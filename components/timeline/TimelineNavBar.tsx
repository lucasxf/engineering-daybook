"use client";

import { LearnimoWordmark } from "@/components/learnimo-wordmark";
import { User } from "lucide-react";

export function TimelineNavBar() {
  return (
    <header
      className="
        sticky top-0 z-10 flex items-center justify-between
        border-b px-5 py-3.5
        bg-background border-card-border
      "
      style={{ borderBottomColor: "var(--color-card-border)" }}
    >
      <a
        href="#"
        aria-label="learnimo — ir para o início"
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
      >
        <LearnimoWordmark className="text-lg" />
      </a>

      {/* Avatar placeholder */}
      <button
        type="button"
        aria-label="Menu do usuário"
        className="
          flex h-8 w-8 items-center justify-center rounded-full
          bg-card border border-card-border
          text-muted-foreground
          hover:border-[var(--color-primary)] hover:text-foreground
          transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]
        "
      >
        <User className="h-4 w-4" aria-hidden="true" />
      </button>
    </header>
  );
}
