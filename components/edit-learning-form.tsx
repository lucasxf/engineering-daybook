"use client";

import { useState, useId, useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";

/* ——— Constantes ——— */
const MAX_TITLE = 200;
const MAX_CONTENT = 50_000;
const MIN_ROWS = 8;

/* ——— Tipos ——— */
type FormState = "idle" | "saving" | "success" | "error";

export interface EditLearningFormProps {
  initialTitle?: string;
  initialContent?: string;
  learningTitle?: string;
  onCancel?: () => void;
}

/* ——— Helpers ——— */
function formatCount(n: number): string {
  return n.toLocaleString("pt-BR");
}

/* ——— Componente principal ——— */
export function EditLearningForm({
  initialTitle = "Fundamentos de REST APIs",
  initialContent = `REST (Representational State Transfer) é um estilo arquitetural para sistemas distribuídos. Os princípios fundamentais incluem:\n\n1. **Stateless** — cada requisição deve conter toda a informação necessária.\n2. **Uniform Interface** — recursos são identificados por URIs e manipulados via métodos HTTP.\n3. **Cacheable** — respostas devem indicar se podem ser cacheadas.\n4. **Layered System** — o cliente não precisa saber se está falando diretamente com o servidor final.\n\nAprendi que a diferença entre PUT e PATCH é que PUT substitui o recurso inteiro, enquanto PATCH aplica uma atualização parcial. Isso é importante para APIs que trabalham com objetos grandes.`,
  learningTitle,
  onCancel,
}: EditLearningFormProps) {
  const titleId = useId();
  const contentId = useId();
  const titleErrorId = `${titleId}-error`;
  const contentErrorId = `${contentId}-error`;

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [titleTouched, setTitleTouched] = useState(false);
  const [contentTouched, setContentTouched] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");

  /* Toast */
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
    id: number;
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auto-expand textarea */
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoExpand = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoExpand();
  }, [content, autoExpand]);

  /* ——— Validações ——— */
  const titleError =
    titleTouched && title.length > MAX_TITLE
      ? "O título deve ter menos de 200 caracteres"
      : null;

  const contentError = contentTouched
    ? content.trim() === ""
      ? "O conteúdo é obrigatório"
      : content.length > MAX_CONTENT
      ? "O conteúdo deve ter menos de 50.000 caracteres"
      : null
    : null;

  const isSaveDisabled =
    formState === "saving" ||
    content.trim() === "" ||
    content.length > MAX_CONTENT ||
    title.length > MAX_TITLE;

  /* ——— Submit ——— */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTitleTouched(true);
    setContentTouched(true);

    if (
      content.trim() === "" ||
      content.length > MAX_CONTENT ||
      title.length > MAX_TITLE
    )
      return;

    setFormState("saving");
    try {
      await new Promise((res) => setTimeout(res, 1600));
      // Simulação: lança erro aleatório 1 em 5 para demo
      // if (Math.random() < 0.2) throw new Error("save failed");
      setFormState("success");
      showToast("success", "Aprendizado atualizado com sucesso");
    } catch {
      setFormState("error");
      showToast("error", "Algo deu errado. Por favor, tente novamente.");
    }
  }

  function showToast(type: "success" | "error", message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  }

  function dismissToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }

  const isSaving = formState === "saving";
  const displayTitle = learningTitle || title || "Sem título";

  return (
    <div className="relative w-full">
      {/* ——— Toast ——— */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={[
            "fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-lg",
            "border-l-4 animate-in slide-in-from-top-2 fade-in-0 duration-300",
            toast.type === "success"
              ? "border-l-[#6FCF97] bg-toast-success text-foreground"
              : "border-l-[#EB5757] bg-toast-error text-foreground",
          ].join(" ")}
        >
          <span className="flex-1 text-sm leading-relaxed">{toast.message}</span>
          <button
            onClick={dismissToast}
            aria-label="Fechar notificação"
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ——— Breadcrumb ——— */}
      <nav aria-label="Navegação estrutural" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <a
          href="#"
          className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
        >
          Meus Aprendizados
        </a>
        <span aria-hidden="true" className="select-none">/</span>
        <a
          href="#"
          className="max-w-[160px] truncate transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
        >
          {displayTitle}
        </a>
        <span aria-hidden="true" className="select-none">/</span>
        <span className="text-foreground">Editar</span>
      </nav>

      {/* ——— Cabeçalho da página ——— */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold leading-tight text-balance text-foreground">
          Editar Aprendizado
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Faça as alterações no seu aprendizado abaixo.
        </p>
      </div>

      {/* ——— Card do formulário ——— */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-card-border bg-card px-6 py-8 shadow-sm md:px-8"
      >
        <div className="flex flex-col gap-6">
          {/* Campo: Título */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={titleId}
              className="text-sm font-medium text-foreground"
            >
              Título
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                (opcional)
              </span>
            </label>
            <input
              id={titleId}
              type="text"
              placeholder="Dê um título a este aprendizado (opcional)"
              value={title}
              disabled={isSaving}
              maxLength={MAX_TITLE + 20}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              aria-invalid={!!titleError}
              aria-describedby={titleError ? titleErrorId : undefined}
              className={[
                "w-full rounded-lg border px-3.5 py-2.5 text-sm text-foreground placeholder:text-placeholder",
                "bg-input transition-colors duration-150 outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                titleError
                  ? "border-error/60 focus:ring-1 focus:ring-error/60"
                  : "border-input-border focus:border-input-focus focus:ring-1 focus:ring-[var(--color-input-focus)]",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <div className="flex items-start justify-between gap-2">
              {titleError ? (
                <p
                  id={titleErrorId}
                  role="alert"
                  className="text-xs text-error"
                >
                  {titleError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Máximo de 200 caracteres
                </p>
              )}
              {title.length > 150 && (
                <span
                  className={`shrink-0 text-xs tabular-nums ${
                    title.length > MAX_TITLE
                      ? "text-error"
                      : "text-muted-foreground"
                  }`}
                >
                  {title.length}/{MAX_TITLE}
                </span>
              )}
            </div>
          </div>

          {/* Campo: Conteúdo */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={contentId}
              className="text-sm font-medium text-foreground"
            >
              O que você aprendeu?
              <span className="ml-1.5 text-xs font-normal text-error" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              ref={textareaRef}
              id={contentId}
              placeholder="Descreva o que você aprendeu…"
              value={content}
              disabled={isSaving}
              onChange={(e) => {
                setContent(e.target.value);
                autoExpand();
              }}
              onBlur={() => setContentTouched(true)}
              aria-invalid={!!contentError}
              aria-describedby={
                contentError ? contentErrorId : `${contentId}-counter`
              }
              aria-required="true"
              rows={MIN_ROWS}
              style={{ resize: "none", overflow: "hidden" }}
              className={[
                "w-full rounded-lg border px-3.5 py-2.5 text-sm text-foreground placeholder:text-placeholder",
                "bg-input transition-colors duration-150 outline-none leading-relaxed",
                "disabled:cursor-not-allowed disabled:opacity-50",
                contentError
                  ? "border-error/60 focus:ring-1 focus:ring-error/60"
                  : "border-input-border focus:border-input-focus focus:ring-1 focus:ring-[var(--color-input-focus)]",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <div className="flex items-start justify-between gap-2">
              {contentError ? (
                <p
                  id={contentErrorId}
                  role="alert"
                  className="text-xs text-error"
                >
                  {contentError}
                </p>
              ) : (
                <span />
              )}
              <span
                id={`${contentId}-counter`}
                className={`shrink-0 text-xs tabular-nums ${
                  content.length > MAX_CONTENT
                    ? "text-error font-medium"
                    : "text-muted-foreground"
                }`}
                aria-live="polite"
                aria-atomic="true"
              >
                {formatCount(content.length)} / 50.000
              </span>
            </div>
          </div>

          {/* ——— Linha de ação ——— */}
          <div className="flex flex-col-reverse gap-3 pt-2 md:flex-row md:justify-end">
            {/* Cancelar */}
            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
              className={[
                "flex w-full items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium",
                "transition-colors duration-150 outline-none",
                "border-card-border text-muted-foreground",
                "hover:border-input-border hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "md:w-auto",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Cancelar
            </button>

            {/* Salvar */}
            <button
              type="submit"
              disabled={isSaveDisabled}
              aria-disabled={isSaveDisabled}
              className={[
                "flex w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium",
                "bg-primary text-primary-foreground transition-colors duration-150",
                "hover:bg-primary-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "md:w-auto",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Salvando…
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
