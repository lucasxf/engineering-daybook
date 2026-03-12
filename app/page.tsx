"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { TimelineScreen } from "@/components/timeline/TimelineScreen";
import type { TimelineState } from "@/components/timeline/types";

/* ——— Theme toggle ——— */
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
      className="rounded-md p-1.5 text-white/50 hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
    >
      {theme === "dark" ? (
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}

/* ——— Preview pane (dark or light) ——— */
function PreviewPane({
  label,
  theme,
  demoState,
  onToggle,
  dotColor,
}: {
  label: string;
  theme: "dark" | "light";
  demoState: TimelineState;
  onToggle: () => void;
  dotColor: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            {label}
          </span>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggle} />
      </div>

      {/* Viewport frame */}
      <div
        className={[
          theme === "dark" ? "dark" : "",
          "flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl",
          "min-h-[640px] flex flex-col",
        ].join(" ")}
      >
        <TimelineScreen demoState={demoState} />
      </div>
    </div>
  );
}

/* ——— State selector strip ——— */
const STATES: { id: TimelineState; label: string; desc: string }[] = [
  { id: "populated", label: "Populado", desc: "3–4 grupos de meses com 2–4 cards cada" },
  { id: "single-month", label: "Mês único", desc: "Apenas um grupo; sem divisor acima" },
  { id: "loading", label: "Carregando", desc: "Skeleton pulse — toolbar visível" },
  { id: "empty", label: "Vazio", desc: "Sem aprendizados; CTA de criação" },
  { id: "no-results", label: "Sem resultados", desc: "Busca sem matches; mensagem de feedback" },
  { id: "error", label: "Erro", desc: "Falha ao carregar; botão de retry" },
];

/* ——— Root ——— */
export default function Home() {
  const [leftTheme, setLeftTheme] = useState<"dark" | "light">("dark");
  const [rightTheme, setRightTheme] = useState<"dark" | "light">("light");
  const [demoState, setDemoState] = useState<TimelineState>("populated");

  return (
    <div className="flex min-h-screen flex-col bg-[#080d14] font-sans">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 pt-6 pb-2">
        <p className="font-wordmark text-sm font-bold text-white/80 tracking-tight">
          learn<span className="font-bold">imo</span>
        </p>
        <p className="text-xs text-white/30">
          design preview · Linha do Tempo
        </p>
      </div>

      {/* State selector */}
      <div className="px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {STATES.map((s) => (
            <button
              key={s.id}
              onClick={() => setDemoState(s.id)}
              className={[
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                demoState === s.id
                  ? "bg-[#D4854A] text-white"
                  : "bg-white/8 text-white/50 hover:text-white/80 hover:bg-white/12",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-white/25">
          {STATES.find((s) => s.id === demoState)?.desc}
        </p>
      </div>

      {/* Side-by-side previews */}
      <div className="flex flex-1 flex-col gap-6 p-4 md:flex-row md:gap-4 md:p-6">
        <PreviewPane
          label="Dark"
          theme={leftTheme}
          demoState={demoState}
          onToggle={() => setLeftTheme((t) => (t === "dark" ? "light" : "dark"))}
          dotColor="#2B4A78"
        />
        <PreviewPane
          label="Light"
          theme={rightTheme}
          demoState={demoState}
          onToggle={() => setRightTheme((t) => (t === "dark" ? "light" : "dark"))}
          dotColor="#D4854A"
        />
      </div>

      {/* No-results demo note */}
      {demoState === "no-results" && (
        <p className="pb-4 text-center text-xs text-white/25">
          Dica: selecione &quot;Sem resultados&quot; e a tela já exibe o estado; ou busque um termo inexistente em qualquer estado.
        </p>
      )}
    </div>
  );
}
