"use client";

import { ArrowLeft, BookOpen, ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface LearningErrorProps {
  type: "not-found" | "forbidden";
}

export function LearningError({ type }: LearningErrorProps) {
  const t = useTranslations("poks.errors");

  const config = {
    "not-found": {
      Icon: BookOpen,
      statusLabel: "404",
      titleKey: "notFound",
      bodyKey: "notFound",
    },
    forbidden: {
      Icon: ShieldOff,
      statusLabel: "403",
      titleKey: "forbidden",
      bodyKey: "forbidden",
    },
  } as const;

  const { Icon, statusLabel, titleKey, bodyKey } = config[type];
  const title = t(titleKey);
  const body = t(bodyKey);
  const cta = t("common.appName"); // fallback, ideally we'd have a specific key

  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-card-border bg-card shadow-sm">
        <Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      </div>

      <p className="mb-1 font-mono text-xs font-semibold tracking-widest text-muted-foreground opacity-60">
        {statusLabel}
      </p>
      <h1 className="mb-2 font-heading text-xl font-semibold text-foreground">
        {title}
      </h1>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>

      <a
        href="#"
        className="inline-flex items-center gap-2 rounded-lg border border-[#2B4A78] px-4 py-2 text-sm font-medium text-[#8B9EC2] transition-colors hover:bg-[#2B4A78]/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </a>
    </div>
  );
}
