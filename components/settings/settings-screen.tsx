"use client";

import { LearnimoWordmark } from "@/components/learnimo-wordmark";
import { AvatarSection } from "@/components/settings/avatar-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { PrivacySection } from "@/components/settings/privacy-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { LanguageSection } from "@/components/settings/language-section";
import { DangerZone } from "@/components/settings/danger-zone";
import { Sun, Moon } from "lucide-react";

type Lang = "en" | "pt";

interface SettingsScreenProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  lang: Lang;
}

const pageTitle = { en: "Settings", pt: "Configurações" };
const pageSubtitle = {
  en: "Manage your profile and preferences",
  pt: "Gerencie seu perfil e preferências",
};

export function SettingsScreen({ theme, onToggleTheme, lang }: SettingsScreenProps) {
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-full bg-background font-sans">
        {/* App header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-card-border bg-background/80 px-6 py-4 backdrop-blur-sm">
          <a
            href="#"
            aria-label="learnimo — página inicial"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] rounded"
          >
            <LearnimoWordmark className="text-xl" />
          </a>

          <div className="flex items-center gap-3">
            {/* Avatar + handle */}
            <a
              href="#"
              className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
              aria-label="Perfil do usuário @lucas"
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white select-none"
                style={{ backgroundColor: "#2B4A78" }}
                aria-hidden="true"
              >
                L
              </div>
              <span className="hidden text-sm font-medium text-muted-foreground sm:block">
                @lucas
              </span>
            </a>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card-border/30 hover:text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto w-full max-w-[680px] px-4 py-8 sm:px-6">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-semibold text-foreground text-balance">
              {pageTitle[lang]}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {pageSubtitle[lang]}
            </p>
          </div>

          {/* Settings sections */}
          <div className="flex flex-col gap-4">
            <AvatarSection
              displayName="Lucas"
              avatarUrl={null}
              lang={lang}
            />
            <ProfileSection
              initialDisplayName="Lucas"
              initialBio="Aprendendo sobre sistemas distribuídos e TypeScript."
              lang={lang}
            />
            <PrivacySection
              initialVisibility="public"
              lang={lang}
            />
            <AppearanceSection
              key={theme}
              initialTheme={theme}
              lang={lang}
            />
            <LanguageSection
              initialLang={lang}
              lang={lang}
            />
            <DangerZone lang={lang} />
          </div>
        </main>
      </div>
    </div>
  );
}
