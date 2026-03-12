"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { LearnerProfileScreen } from "@/components/learner-profile/learner-profile-screen";
import type { ProfileVariant } from "@/components/learner-profile/profile-hero";

// ─── Theme toggle ─────────────────────────────────────────────────────────────

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
      aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className="rounded-md p-1.5 text-white/40 hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
    >
      {theme === "dark" ? (
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}

// ─── Single preview pane ──────────────────────────────────────────────────────

function PreviewPane({
  theme,
  variant,
  label,
  dotColor,
  onToggle,
}: {
  theme: "dark" | "light";
  variant: ProfileVariant;
  label: string;
  dotColor: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Pane header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            {label}
          </span>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggle} />
      </div>

      {/* Screen frame */}
      <div
        className={`flex-1 overflow-auto rounded-2xl border border-white/10 shadow-2xl ${
          theme === "dark" ? "dark" : ""
        }`}
        style={{ minHeight: 600 }}
      >
        <LearnerProfileScreen variant={variant} theme={theme} />
      </div>
    </div>
  );
}

// ─── State strip ──────────────────────────────────────────────────────────────

const VARIANTS: { id: ProfileVariant; label: string; desc: string }[] = [
  { id: "public-populated", label: "Público — populado", desc: "Avatar, bio, aprendizados" },
  { id: "no-avatar", label: "Sem avatar", desc: "Círculo com inicial" },
  { id: "no-bio", label: "Sem bio", desc: "Linha de bio ausente" },
  { id: "empty-learnings", label: "Sem aprendizados", desc: "Estado vazio no feed" },
  { id: "loading", label: "Carregando", desc: "Skeletons animados" },
  { id: "private", label: "Privado", desc: "Cadeado + mensagem" },
  { id: "own-profile", label: "Próprio perfil", desc: "Link de editar perfil" },
  { id: "not-found", label: "Não encontrado", desc: "Mensagem 404" },
];

function StateStrip({
  active,
  onSelect,
}: {
  active: ProfileVariant;
  onSelect: (v: ProfileVariant) => void;
}) {
  return (
    <div className="border-t border-white/10 px-4 py-5 md:px-8">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-white/30">
        Variantes de estado
      </p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {VARIANTS.map(({ id, label, desc }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={[
              "rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30",
              active === id
                ? "border-[#D4854A]/60 bg-[#D4854A]/10"
                : "border-white/10 bg-white/5 hover:bg-white/8",
            ].join(" ")}
          >
            <p
              className={`text-xs font-semibold ${
                active === id ? "text-[#D4854A]" : "text-white/70"
              }`}
            >
              {label}
            </p>
            <p className="mt-0.5 text-xs text-white/30">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [leftTheme, setLeftTheme] = useState<"dark" | "light">("dark");
  const [rightTheme, setRightTheme] = useState<"dark" | "light">("light");
  const [activeVariant, setActiveVariant] = useState<ProfileVariant>("public-populated");

  return (
    <div className="flex min-h-screen flex-col bg-[#080d16] font-sans">
      {/* Preview header */}
      <div className="flex items-center justify-center gap-3 py-4">
        <span className="font-wordmark text-sm font-bold text-white/80 tracking-tight">
          learn<span className="font-bold">imo</span>
        </span>
        <span className="text-xs text-white/40">— design preview · Perfil do Learner</span>
      </div>

      {/* Side-by-side previews */}
      <div className="flex flex-1 flex-col gap-6 px-4 pb-4 md:flex-row md:gap-4 md:px-6">
        <PreviewPane
          theme={leftTheme}
          variant={activeVariant}
          label="Dark"
          dotColor="#2B4A78"
          onToggle={() => setLeftTheme((t) => (t === "dark" ? "light" : "dark"))}
        />
        <PreviewPane
          theme={rightTheme}
          variant={activeVariant}
          label="Light"
          dotColor="#D4854A"
          onToggle={() => setRightTheme((t) => (t === "dark" ? "light" : "dark"))}
        />
      </div>

      {/* State strip */}
      <StateStrip active={activeVariant} onSelect={setActiveVariant} />
    </div>
  );
}
