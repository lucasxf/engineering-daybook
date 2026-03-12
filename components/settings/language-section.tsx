"use client";

import { useState } from "react";

type LangOption = "en" | "pt";

interface LanguageSectionProps {
  initialLang?: LangOption;
  lang: "en" | "pt";
}

const t = {
  en: {
    heading: "Language",
    english: "English",
    portuguese: "Português",
  },
  pt: {
    heading: "Idioma",
    english: "English",
    portuguese: "Português",
  },
};

export function LanguageSection({ initialLang = "pt", lang }: LanguageSectionProps) {
  const tx = t[lang];
  const [selected, setSelected] = useState<LangOption>(initialLang);

  const options: { value: LangOption; label: string; flag: string }[] = [
    { value: "en", label: tx.english, flag: "🇺🇸" },
    { value: "pt", label: tx.portuguese, flag: "🇧🇷" },
  ];

  return (
    <section
      aria-labelledby="language-heading"
      className="rounded-2xl border border-card-border bg-card shadow-sm overflow-hidden"
    >
      <div className="h-0.5 w-full bg-ember-stroke" aria-hidden="true" />

      <div className="px-6 py-6">
        <h2 id="language-heading" className="mb-5 font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {tx.heading}
        </h2>

        <fieldset>
          <legend className="sr-only">{tx.heading}</legend>
          <div
            className="inline-flex rounded-xl border border-card-border bg-background overflow-hidden p-1 gap-1"
            role="group"
          >
            {options.map(({ value, label, flag }) => {
              const isActive = selected === value;
              return (
                <label key={value} className="relative">
                  <input
                    type="radio"
                    name={`language-toggle-${lang}`}
                    value={value}
                    checked={isActive}
                    onChange={() => setSelected(value)}
                    className="sr-only"
                  />
                  <span
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 select-none",
                      "focus-within:ring-2 focus-within:ring-[var(--color-input-focus)]",
                      isActive
                        ? "border border-[var(--color-primary)] bg-card-border/40 text-card-foreground"
                        : "border border-transparent text-muted-foreground hover:text-card-foreground hover:bg-card-border/20",
                    ].join(" ")}
                  >
                    <span aria-hidden="true">{flag}</span>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
