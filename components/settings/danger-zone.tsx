"use client";

import { Trash2 } from "lucide-react";

interface DangerZoneProps {
  lang: "en" | "pt";
}

const t = {
  en: {
    delete: "Delete account",
    deleteDesc: "Permanently delete your account and all your data. This action cannot be undone.",
  },
  pt: {
    delete: "Excluir conta",
    deleteDesc: "Exclua permanentemente sua conta e todos os seus dados. Esta ação não pode ser desfeita.",
  },
};

export function DangerZone({ lang }: DangerZoneProps) {
  const tx = t[lang];

  return (
    <section aria-label={lang === "pt" ? "Zona de perigo" : "Danger zone"}>
      <div className="h-px w-full bg-card-border" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4 py-5">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground leading-relaxed text-pretty max-w-sm">
            {tx.deleteDesc}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#C0392B]/30 bg-transparent px-4 py-2 text-sm font-medium text-[#C0392B]/70 transition-colors duration-150 hover:border-[#C0392B] hover:text-[#C0392B] hover:bg-[#C0392B]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B]"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {tx.delete}
        </button>
      </div>
    </section>
  );
}
