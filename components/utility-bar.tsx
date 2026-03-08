"use client";

import { Moon, Sun } from "lucide-react";

interface UtilityBarProps {
  locale: "en" | "pt-BR";
  onLocaleChange: (locale: "en" | "pt-BR") => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function UtilityBar({
  locale,
  onLocaleChange,
  isDark,
  onThemeToggle,
}: UtilityBarProps) {
  return (
    <div className="flex items-center justify-end gap-2 w-full">
      {/* Language toggle */}
      <div
        className="flex items-center rounded-md overflow-hidden text-xs font-medium"
        style={{ backgroundColor: "var(--toggle-bg)" }}
        role="group"
        aria-label="Idioma"
      >
        <button
          type="button"
          onClick={() => onLocaleChange("en")}
          className={`px-2.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4854A] ${
            locale === "en"
              ? "bg-[#D4854A] text-white"
              : "text-toggle hover:opacity-80"
          }`}
          aria-pressed={locale === "en"}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => onLocaleChange("pt-BR")}
          className={`px-2.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4854A] ${
            locale === "pt-BR"
              ? "bg-[#D4854A] text-white"
              : "text-toggle hover:opacity-80"
          }`}
          aria-pressed={locale === "pt-BR"}
        >
          PT-BR
        </button>
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={onThemeToggle}
        aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
        className="p-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4854A]"
        style={{ backgroundColor: "var(--toggle-bg)", color: "var(--toggle-fg)" }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
