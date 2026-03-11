"use client";

import { useState } from "react";
import { LearnimoWordmark } from "@/components/learnimo-wordmark";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Sun, Moon } from "lucide-react";

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

function ForgotPasswordScreen({ theme, onToggle }: { theme: "dark" | "light"; onToggle: () => void }) {
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="flex min-h-screen flex-col bg-background font-sans">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <a
            href="/login"
            aria-label="Ir para a página de login do learnimo"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] rounded"
          >
            <LearnimoWordmark className="text-xl" />
          </a>
          <ThemeToggle theme={theme} onToggle={onToggle} />
        </header>

        {/* Main content */}
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-[400px]">
            {/* Card */}
            <div className="rounded-2xl border border-card-border bg-card px-8 py-10 shadow-sm">
              {/* Title & subtitle */}
              <div className="mb-8 space-y-2">
                <h1 className="font-heading text-2xl font-semibold leading-tight text-balance text-card-foreground">
                  Esqueceu sua senha?
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <ForgotPasswordForm loginHref="/login" />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} learnimo
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  const [leftTheme, setLeftTheme] = useState<"dark" | "light">("dark");
  const [rightTheme, setRightTheme] = useState<"dark" | "light">("light");

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0f1a] font-sans">
      {/* Preview label */}
      <div className="flex items-center justify-center gap-3 py-4">
        <span className="font-wordmark text-sm font-bold text-white/80 tracking-tight">
          learn<span className="font-bold">imo</span>
        </span>
        <span className="text-xs text-white/40">— design preview · Esqueceu sua senha</span>
      </div>

      {/* Side-by-side previews */}
      <div className="flex flex-1 flex-col gap-6 p-4 md:flex-row md:gap-4 md:p-6">
        {/* Dark preview */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2B4A78]" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-widest text-white/40">
              Dark
            </span>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <ForgotPasswordScreen
              theme={leftTheme}
              onToggle={() => setLeftTheme((t) => (t === "dark" ? "light" : "dark"))}
            />
          </div>
        </div>

        {/* Light preview */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#D4854A]" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-widest text-white/40">
              Light
            </span>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <ForgotPasswordScreen
              theme={rightTheme}
              onToggle={() => setRightTheme((t) => (t === "dark" ? "light" : "dark"))}
            />
          </div>
        </div>
      </div>

      {/* State showcase strip */}
      <StateShowcase />
    </div>
  );
}

/* ——— Mostra os estados: default, erro, loading, confirmação ——— */
function StateShowcase() {
  return (
    <div className="border-t border-white/10 px-4 py-6 md:px-8">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-white/30">
        Estados da tela
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Padrão", desc: "Campo vazio, botão ativo" },
          { label: "Erro de validação", desc: "E-mail inválido, borda vermelha" },
          { label: "Carregando", desc: "Spinner + input desabilitado" },
          { label: "Confirmação", desc: "Painel de sucesso neutro" },
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
