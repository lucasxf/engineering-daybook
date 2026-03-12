"use client";

import { useState } from "react";
import { TagFeedScreen } from "@/components/tag-feed/tag-feed-screen";

type FeedState =
  | "populated"
  | "all-untagged"
  | "single-tag"
  | "loading"
  | "empty"
  | "no-results"
  | "error";

const STATE_LABELS: { id: FeedState; label: string; desc: string }[] = [
  { id: "populated", label: "Populado", desc: "3–4 seções com etiqueta + sem etiqueta" },
  { id: "single-tag", label: "Uma etiqueta", desc: "Só React, sem seção sem etiqueta" },
  { id: "all-untagged", label: "Tudo sem etiqueta", desc: "Nudge para começar a etiquetar" },
  { id: "loading", label: "Carregando", desc: "Skeleton pulse nas seções" },
  { id: "empty", label: "Vazio", desc: "Nenhum aprendizado salvo" },
  { id: "no-results", label: "Sem resultados", desc: 'Busca sem match (keyword="xyz")' },
  { id: "error", label: "Erro", desc: "Falha ao carregar, botão retry" },
];

function PreviewPanel({
  theme,
  forcedState,
}: {
  theme: "dark" | "light";
  forcedState: FeedState;
}) {
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">(theme);

  return (
    <div className={currentTheme === "dark" ? "dark" : ""}>
      <div className="min-h-full font-sans" style={{ colorScheme: currentTheme }}>
        <TagFeedScreen
          theme={currentTheme}
          onToggle={() =>
            setCurrentTheme((t) => (t === "dark" ? "light" : "dark"))
          }
          forcedState={forcedState}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [activeState, setActiveState] = useState<FeedState>("populated");

  return (
    <div className="flex min-h-screen flex-col bg-[#080f1c] font-sans">
      {/* Preview label */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-white/5">
        <span className="font-wordmark text-sm font-bold text-white/80 tracking-tight">
          learn<span className="font-bold">imo</span>
        </span>
        <span className="text-xs text-white/40">— design preview · Tag-Grouped Feed</span>
      </div>

      {/* State selector */}
      <div className="flex flex-wrap justify-center gap-2 px-4 py-4 border-b border-white/5">
        {STATE_LABELS.map(({ id, label, desc }) => (
          <button
            key={id}
            onClick={() => setActiveState(id)}
            className="group flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4854A]"
            style={{
              borderColor:
                activeState === id ? "#D4854A" : "rgba(255,255,255,0.08)",
              backgroundColor:
                activeState === id
                  ? "rgba(212, 133, 74, 0.12)"
                  : "rgba(255,255,255,0.04)",
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: activeState === id ? "#D4854A" : "rgba(255,255,255,0.7)" }}
            >
              {label}
            </span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {desc}
            </span>
          </button>
        ))}
      </div>

      {/* Side-by-side dark + light preview */}
      <div className="flex flex-1 flex-col gap-6 p-4 md:flex-row md:gap-4 md:p-6">
        {/* Dark */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2B4A78]" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-widest text-white/40">
              Dark
            </span>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <PreviewPanel theme="dark" forcedState={activeState} />
          </div>
        </div>

        {/* Light */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#D4854A]" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-widest text-white/40">
              Light
            </span>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <PreviewPanel theme="light" forcedState={activeState} />
          </div>
        </div>
      </div>
    </div>
  );
}
