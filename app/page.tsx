"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { ViewLearningScreen } from "@/components/view-learning/view-learning-screen";
import type { ScreenState, Learning } from "@/components/view-learning/view-learning-screen";

type Theme = "dark" | "light";

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className="rounded-md p-1.5 text-white/40 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

const STATE_LABELS: Record<ScreenState, { label: string; desc: string }> = {
  loaded: { label: "Carregado", desc: "Título, conteúdo e metadados" },
  loading: { label: "Carregando", desc: "Skeleton shimmer" },
  "not-found": { label: "404", desc: "Aprendizado não encontrado" },
  forbidden: { label: "403", desc: "Sem permissão de acesso" },
};

const SAMPLE_LEARNING: Learning = {
  id: "preview",
  title: "Como construir hábitos de aprendizado",
  content:
    "Aprender de forma consistente exige **estrutura**. Aqui estão três princípios:\n\n" +
    "1. Pequenas doses diárias valem mais que maratonas semanais\n" +
    "2. Relacione o novo conhecimento ao que você já sabe\n" +
    "3. Ensine o que aprendeu — isso solidifica o entendimento\n\n" +
    "> _\"O verdadeiro aprendizado transforma comportamento, não apenas vocabulário.\"_",
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-01-20T14:30:00Z",
  tags: ["hábitos", "produtividade", "aprendizado"],
};

export default function Home() {
  const [leftTheme, setLeftTheme] = useState<Theme>("dark");
  const [rightTheme, setRightTheme] = useState<Theme>("light");
  const [activeState, setActiveState] = useState<ScreenState>("loaded");

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0f1a] font-sans">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 py-5">
        <span className="font-wordmark text-base font-bold text-white/80 tracking-tight">
          learn<span className="font-bold">imo</span>
        </span>
        <span className="text-xs text-white/40">design preview · Ver Aprendizado</span>
      </div>

      {/* State switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-5">
        {(Object.keys(STATE_LABELS) as ScreenState[]).map((state) => (
          <button
            key={state}
            onClick={() => setActiveState(state)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeState === state
                ? "bg-[#D4854A] text-white"
                : "bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/80"
            }`}
          >
            {STATE_LABELS[state].label}
          </button>
        ))}
      </div>

      {/* Side-by-side previews */}
      <div className="flex flex-1 flex-col gap-6 p-4 md:flex-row md:gap-4 md:p-6">
        {/* Dark */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#2B4A78]" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-widest text-white/40">Dark</span>
            </div>
            <ThemeToggle
              theme={leftTheme}
              onToggle={() => setLeftTheme((t) => (t === "dark" ? "light" : "dark"))}
            />
          </div>
          <div className={`flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl${leftTheme === "dark" ? " dark" : ""}`}>
            {activeState === "loaded" ? (
              <ViewLearningScreen state="loaded" learning={SAMPLE_LEARNING} />
            ) : (
              <ViewLearningScreen state={activeState} />
            )}
          </div>
        </div>

        {/* Light */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#D4854A]" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-widest text-white/40">Light</span>
            </div>
            <ThemeToggle
              theme={rightTheme}
              onToggle={() => setRightTheme((t) => (t === "dark" ? "light" : "dark"))}
            />
          </div>
          <div className={`flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl${rightTheme === "dark" ? " dark" : ""}`}>
            {activeState === "loaded" ? (
              <ViewLearningScreen state="loaded" learning={SAMPLE_LEARNING} />
            ) : (
              <ViewLearningScreen state={activeState} />
            )}
          </div>
        </div>
      </div>

      {/* State reference strip */}
      <div className="border-t border-white/10 px-4 py-6 md:px-8">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-white/30">
          Estados da tela
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {(Object.keys(STATE_LABELS) as ScreenState[]).map((state) => (
            <button
              key={state}
              onClick={() => setActiveState(state)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                activeState === state
                  ? "border-[#D4854A]/60 bg-[#D4854A]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <p className={`text-xs font-semibold ${activeState === state ? "text-[#D4854A]" : "text-white/70"}`}>
                {STATE_LABELS[state].label}
              </p>
              <p className="mt-0.5 text-xs text-white/30">{STATE_LABELS[state].desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
