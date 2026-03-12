"use client";

import { useState } from "react";
import { EditLearningScreen } from "@/components/edit-learning-screen";

export default function Home() {
  const [leftTheme, setLeftTheme] = useState<"dark" | "light">("dark");
  const [rightTheme, setRightTheme] = useState<"dark" | "light">("light");

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0f1a] font-sans">
      {/* ——— Rótulo de preview ——— */}
      <div className="flex items-center justify-center gap-3 py-4">
        <span className="font-wordmark text-sm font-bold text-white/80 tracking-tight">
          learn<span className="font-bold">imo</span>
        </span>
        <span className="text-xs text-white/40">— design preview · Editar Aprendizado</span>
      </div>

      {/* ——— Previews lado a lado ——— */}
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
            <EditLearningScreen
              theme={leftTheme}
              onToggle={() => setLeftTheme((t) => (t === "dark" ? "light" : "dark"))}
            />
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
            <EditLearningScreen
              theme={rightTheme}
              onToggle={() => setRightTheme((t) => (t === "dark" ? "light" : "dark"))}
            />
          </div>
        </div>
      </div>

      {/* ——— Faixa de estados ——— */}
      <StateShowcase />
    </div>
  );
}

function StateShowcase() {
  return (
    <div className="border-t border-white/10 px-4 py-6 md:px-8">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-white/30">
        Estados da tela
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {[
          { label: "Padrão", desc: "Formulário pré-preenchido, botão ativo" },
          { label: "Editando", desc: "Contador de caracteres atualiza ao digitar" },
          { label: "Salvando", desc: "Spinner + campos desabilitados" },
          { label: "Erro de validação", desc: "Conteúdo vazio ou excede limite" },
          { label: "Salvo com sucesso", desc: "Toast verde confirma a atualização" },
          { label: "Erro ao salvar", desc: "Toast vermelho, form permanece editável" },
          { label: "403 / 404", desc: "Tela de erro com link para Meus Aprendizados" },
        ].map(({ label, desc }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <p className="text-xs font-semibold text-white/70">{label}</p>
            <p className="mt-0.5 text-xs text-white/30">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
