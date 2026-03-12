"use client";

import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type ThemeOption = "light" | "dark" | "system";

interface AppearanceSectionProps {
  initialTheme?: ThemeOption;
  lang: "en" | "pt";
}

const t = {
  en: {
    heading: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  pt: {
    heading: "Aparência",
    light: "Claro",
    dark: "Escuro",
    system: "Sistema",
  },
};

export function AppearanceSection({ initialTheme = "dark", lang }: AppearanceSectionProps) {
  const tx = t[lang];
  const [theme, setTheme] = useState<ThemeOption>(initialTheme);

  const options: { value: ThemeOption; label: string; Icon: typeof Sun }[] = [
    { value: "light", label: tx.light, Icon: Sun },
    { value: "dark", label: tx.dark, Icon: Moon },
    { value: "system", label: tx.system, Icon: Monitor },
  ];

  return (
    <section
      aria-labelledby="appearance-heading"
      className="rounded-2xl border border-card-border bg-card shadow-sm overflow-hidden"
    >
      <div className="h-0.5 w-full bg-ember-stroke" aria-hidden="true" />

      <div className="px-6 py-6">
        <h2 id="appearance-heading" className="mb-5 font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {tx.heading}
        </h2>

        <fieldset>
          <legend className="sr-only">{tx.heading}</legend>
          <div
            className="inline-flex rounded-xl border border-card-border bg-background overflow-hidden p-1 gap-1"
            role="group"
          >
            {options.map(({ value, label, Icon }) => {
              const isActive = theme === value;
              return (
                <label key={value} className="relative">
                  <input
                    type="radio"
                    name={`theme-toggle-${lang}`}
                    value={value}
                    checked={isActive}
                    onChange={() => setTheme(value)}
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
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
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
