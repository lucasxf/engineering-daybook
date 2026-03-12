"use client";

import { useState } from "react";
import { Globe, Lock, Loader2, Check } from "lucide-react";
import { useEffect } from "react";

type Visibility = "public" | "private";
type SaveState = "idle" | "saving" | "saved";

interface PrivacySectionProps {
  initialVisibility?: Visibility;
  lang: "en" | "pt";
}

const t = {
  en: {
    heading: "Privacy",
    publicLabel: "Public",
    publicDesc: "Anyone can view your profile and learnings",
    privateLabel: "Private",
    privateDesc: "Only you can see your profile",
    save: "Save",
    saved: "Saved \u2713",
  },
  pt: {
    heading: "Privacidade",
    publicLabel: "Público",
    publicDesc: "Qualquer pessoa pode ver seu perfil e aprendizados",
    privateLabel: "Privado",
    privateDesc: "Só você pode ver seu perfil",
    save: "Salvar",
    saved: "Salvo \u2713",
  },
};

export function PrivacySection({ initialVisibility = "public", lang }: PrivacySectionProps) {
  const tx = t[lang];
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const isDirty = visibility !== initialVisibility;

  useEffect(() => {
    if (saveState === "saved") {
      const timer = setTimeout(() => setSaveState("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  async function handleSave() {
    if (!isDirty) return;
    setSaveState("saving");
    await new Promise((res) => setTimeout(res, 900));
    setSaveState("saved");
  }

  const options: { value: Visibility; label: string; desc: string; Icon: typeof Globe }[] = [
    { value: "public", label: tx.publicLabel, desc: tx.publicDesc, Icon: Globe },
    { value: "private", label: tx.privateLabel, desc: tx.privateDesc, Icon: Lock },
  ];

  return (
    <section
      aria-labelledby="privacy-heading"
      className="rounded-2xl border border-card-border bg-card shadow-sm overflow-hidden"
    >
      <div className="h-0.5 w-full bg-ember-stroke" aria-hidden="true" />

      <div className="px-6 py-6">
        <h2 id="privacy-heading" className="mb-5 font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {tx.heading}
        </h2>

        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">{tx.heading}</legend>

          {options.map(({ value, label, desc, Icon }) => {
            const isSelected = visibility === value;
            return (
              <label
                key={value}
                className={[
                  "flex cursor-pointer items-start gap-4 rounded-xl border px-4 py-3.5 transition-colors duration-150",
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-card-border)]/40"
                    : "border-card-border bg-card hover:bg-input-border/10",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={`privacy-visibility-${lang}`}
                  value={value}
                  checked={isSelected}
                  onChange={() => setVisibility(value)}
                  className="sr-only"
                />
                <div
                  className={[
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-primary/20 text-primary" : "bg-card-border/40 text-muted-foreground",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={[
                    "text-sm font-medium leading-5",
                    isSelected ? "text-card-foreground" : "text-card-foreground/70",
                  ].join(" ")}>
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
                {/* Selected indicator */}
                {isSelected && (
                  <div
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary"
                    aria-hidden="true"
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </label>
            );
          })}
        </fieldset>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={!isDirty || saveState === "saving" || saveState === "saved"}
            onClick={handleSave}
            className={[
              "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]",
              isDirty || saveState === "saving" || saveState === "saved"
                ? "bg-primary hover:bg-primary-hover"
                : "cursor-not-allowed bg-primary/40",
              saveState === "saved" ? "bg-primary/70" : "",
            ].join(" ")}
          >
            {saveState === "saving" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            )}
            {saveState === "saved" && (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {saveState === "saving"
              ? (lang === "pt" ? "Salvando…" : "Saving…")
              : saveState === "saved"
              ? tx.saved
              : tx.save}
          </button>
        </div>
      </div>
    </section>
  );
}
