// Demo page for View Learning screen validation
// This file is NOT meant to be committed

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ViewLearningScreen } from "@/components/view-learning/view-learning-screen";

type DemoState = "loaded" | "loading" | "error-404" | "error-403" | "deleting" | "deleted";

export default function ViewLearningDemoPage() {
  const [activeState, setActiveState] = useState<DemoState>("loaded");
  const t = useTranslations("poks.view");

  const DEMO_STATES: { key: DemoState; label: string }[] = [
    { key: "loaded", label: "Carregado" },
    { key: "loading", label: "Carregando" },
    { key: "error-404", label: "Erro 404" },
    { key: "error-403", label: "Erro 403" },
    { key: "deleting", label: "Excluindo" },
    { key: "deleted", label: "Excluído" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Controls */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Estado:</span>
          <div className="flex gap-2">
            {DEMO_STATES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveState(key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeState === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actual Screen */}
      <ViewLearningScreen initialState={activeState} />
    </div>
  );
}
