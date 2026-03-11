"use client";

import { useState, useId } from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

function validateEmail(value: string): string | null {
  if (!value.trim()) return "E-mail é obrigatório";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Formato de e-mail inválido";
  return null;
}

interface ForgotPasswordFormProps {
  loginHref?: string;
}

export function ForgotPasswordForm({ loginHref = "#" }: ForgotPasswordFormProps) {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<FormState>("idle");

  const emailError = touched ? validateEmail(email) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (validateEmail(email)) return;

    setState("loading");
    try {
      // Simula chamada ao backend — em produção usar a API real
      await new Promise((res) => setTimeout(res, 1400));
      setState("success");
    } catch {
      setState("error");
    }
  }

  // ——— Estado de confirmação ———
  if (state === "success") {
    return (
      <div
        className="flex flex-col items-center gap-5 rounded-2xl border border-confirmation-border bg-confirmation-bg p-8 text-center"
        role="status"
        aria-live="polite"
      >
        {/* Ícone envelope */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ember-stroke bg-transparent">
          <Mail
            className="h-7 w-7"
            style={{ color: "var(--color-ember-stroke)", strokeWidth: 1.5 }}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Verifique seu e-mail
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Se houver uma conta com esse e-mail, enviamos um link de redefinição.
            Verifique sua caixa de entrada (e a pasta de spam).
          </p>
        </div>

        <a
          href={loginHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors duration-150 hover:text-link-hover focus-visible:outline-none focus-visible:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Voltar para o login
        </a>
      </div>
    );
  }

  // ——— Formulário ———
  const isLoading = state === "loading";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Erro inesperado */}
      {state === "error" && (
        <div
          role="alert"
          className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
        >
          Algo deu errado. Tente novamente.
        </div>
      )}

      {/* Campo de e-mail */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={emailId}
          className="text-sm font-medium text-foreground"
        >
          E-mail
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          disabled={isLoading}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? `${emailId}-error` : undefined}
          className={[
            "w-full rounded-lg border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60",
            "bg-input transition-colors duration-150 outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            emailError
              ? "border-error focus:ring-1 focus:ring-error"
              : "border-input-border focus:border-input-focus focus:ring-1 focus:ring-[var(--color-input-focus)]",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {emailError && (
          <p
            id={`${emailId}-error`}
            role="alert"
            className="text-xs text-error"
          >
            {emailError}
          </p>
        )}
      </div>

      {/* Botão de envio */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Enviando…
          </>
        ) : (
          "Enviar link de redefinição"
        )}
      </button>

      {/* Link voltar */}
      <a
        href={loginHref}
        className="text-center text-sm text-link transition-colors duration-150 hover:text-link-hover focus-visible:outline-none focus-visible:underline"
      >
        Voltar para o login
      </a>
    </form>
  );
}
