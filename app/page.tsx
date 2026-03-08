"use client";

import { useState } from "react";
import { RegisterForm } from "@/components/register-form";
import { Wordmark } from "@/components/wordmark";
import { UtilityBar } from "@/components/utility-bar";

type Locale = "en" | "pt-BR";
type SimulateError = "email" | "handle" | null;

// ── Single Register Screen ────────────────────────────────────────────────────

function RegisterScreen({
  theme,
  locale,
  onLocaleChange,
  simulateError,
  forceSubmitting,
}: {
  theme: "dark" | "light";
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  simulateError: SimulateError;
  forceSubmitting: boolean;
}) {
  const [isDark, setIsDark] = useState(theme === "dark");

  return (
    <div
      className={`${isDark ? "dark" : ""} relative flex flex-col min-h-full`}
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="flex flex-col min-h-full px-4 pt-4 pb-8">
        {/* Utility bar */}
        <div className="mb-6">
          <UtilityBar
            locale={locale}
            onLocaleChange={onLocaleChange}
            isDark={isDark}
            onThemeToggle={() => setIsDark((v) => !v)}
          />
        </div>

        {/* Wordmark */}
        <div className="flex justify-center mb-6">
          <Wordmark />
        </div>

        {/* Form card */}
        <div className="flex flex-1 items-start justify-center">
          <RegisterForm
            locale={locale}
            simulateError={simulateError}
            forceSubmitting={forceSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

// ── Preview Controls ──────────────────────────────────────────────────────────

function ControlPanel({
  locale,
  onLocaleChange,
  simulateError,
  onSimulateError,
  forceSubmitting,
  onForceSubmitting,
}: {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  simulateError: SimulateError;
  onSimulateError: (e: SimulateError) => void;
  forceSubmitting: boolean;
  onForceSubmitting: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 bg-[#0F1B2D] border-b border-[#2B4A78]">
      <span className="text-xs font-medium text-[#8899AA] uppercase tracking-widest">
        Preview Controls
      </span>

      {/* Locale */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-[#8899AA]">Locale:</span>
        {(["en", "pt-BR"] as Locale[]).map((l) => (
          <button
            key={l}
            onClick={() => onLocaleChange(l)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              locale === l
                ? "bg-[#D4854A] text-white"
                : "bg-[#2B4A78] text-[#F5F0E8] hover:bg-[#3A5A88]"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Server error simulation */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-[#8899AA]">Server error:</span>
        {([null, "email", "handle"] as SimulateError[]).map((e) => (
          <button
            key={String(e)}
            onClick={() => onSimulateError(e)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              simulateError === e
                ? "bg-[#D4854A] text-white"
                : "bg-[#2B4A78] text-[#F5F0E8] hover:bg-[#3A5A88]"
            }`}
          >
            {e === null ? "none" : e}
          </button>
        ))}
      </div>

      {/* Submitting */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-[#8899AA]">Submitting:</span>
        <button
          onClick={() => onForceSubmitting(!forceSubmitting)}
          className={`px-2 py-0.5 rounded text-xs transition-colors ${
            forceSubmitting
              ? "bg-[#D4854A] text-white"
              : "bg-[#2B4A78] text-[#F5F0E8] hover:bg-[#3A5A88]"
          }`}
        >
          {forceSubmitting ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Page() {
  const [locale, setLocale] = useState<Locale>("pt-BR");
  const [simulateError, setSimulateError] = useState<SimulateError>(null);
  const [forceSubmitting, setForceSubmitting] = useState(false);

  return (
    <main className="min-h-screen bg-[#080F1A]">
      {/* Controls */}
      <ControlPanel
        locale={locale}
        onLocaleChange={setLocale}
        simulateError={simulateError}
        onSimulateError={setSimulateError}
        forceSubmitting={forceSubmitting}
        onForceSubmitting={setForceSubmitting}
      />

      {/* Side-by-side preview */}
      <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-49px)]">
        {/* Dark mode */}
        <div className="flex-1 relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 text-[10px] uppercase tracking-widest text-[#4A607A] font-medium select-none pointer-events-none">
            Dark mode
          </div>
          <div className="dark min-h-full" style={{ backgroundColor: "#0F1B2D" }}>
            <div className="flex flex-col min-h-[calc(100vh-49px)] px-4 pt-10 pb-8">
              <div className="mb-6 flex justify-end pr-1">
                <div
                  className="flex items-center rounded-md overflow-hidden text-xs font-medium"
                  style={{ backgroundColor: "#2B4A78" }}
                >
                  <div
                    className={`px-2.5 py-1.5 ${locale === "en" ? "bg-[#D4854A] text-white" : "text-[#F5F0E8]"}`}
                  >
                    EN
                  </div>
                  <div
                    className={`px-2.5 py-1.5 ${locale === "pt-BR" ? "bg-[#D4854A] text-white" : "text-[#F5F0E8]"}`}
                  >
                    PT-BR
                  </div>
                </div>
              </div>
              <div className="flex justify-center mb-6">
                <span className="font-wordmark text-2xl tracking-tight">
                  <span className="font-normal text-[#F5F0E8]">learn</span>
                  <span className="font-bold text-[#D4854A]">imo</span>
                </span>
              </div>
              <div className="flex flex-1 items-start justify-center">
                <RegisterForm
                  locale={locale}
                  simulateError={simulateError}
                  forceSubmitting={forceSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-[#1A2A3A]" />
        <div className="lg:hidden h-px bg-[#1A2A3A]" />

        {/* Light mode */}
        <div className="flex-1 relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 text-[10px] uppercase tracking-widest text-[#8B6A4A] font-medium select-none pointer-events-none">
            Light mode
          </div>
          <div className="min-h-full" style={{ backgroundColor: "#F5F0E8" }}>
            <div className="flex flex-col min-h-[calc(100vh-49px)] px-4 pt-10 pb-8">
              <div className="mb-6 flex justify-end pr-1">
                <div
                  className="flex items-center rounded-md overflow-hidden text-xs font-medium"
                  style={{ backgroundColor: "#E8E4DF" }}
                >
                  <div
                    className={`px-2.5 py-1.5 ${locale === "en" ? "bg-[#D4854A] text-white" : "text-[#1A1A2E]"}`}
                  >
                    EN
                  </div>
                  <div
                    className={`px-2.5 py-1.5 ${locale === "pt-BR" ? "bg-[#D4854A] text-white" : "text-[#1A1A2E]"}`}
                  >
                    PT-BR
                  </div>
                </div>
              </div>
              <div className="flex justify-center mb-6">
                <span className="font-wordmark text-2xl tracking-tight">
                  <span className="font-normal text-[#1A1A2E]">learn</span>
                  <span className="font-bold text-[#D4854A]">imo</span>
                </span>
              </div>
              <div className="flex flex-1 items-start justify-center">
                {/* Light mode wrapper — override CSS vars inline for isolation */}
                <LightModeForm
                  locale={locale}
                  simulateError={simulateError}
                  forceSubmitting={forceSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Light mode isolated wrapper ───────────────────────────────────────────────

function LightModeForm({
  locale,
  simulateError,
  forceSubmitting,
}: {
  locale: Locale;
  simulateError: SimulateError;
  forceSubmitting: boolean;
}) {
  return (
    <div
      className="w-full"
      style={
        {
          "--bg-page": "#F5F0E8",
          "--bg-card": "#FFFFFF",
          "--border-card": "#E8E4DF",
          "--text-heading": "#1A1A2E",
          "--text-muted": "#666666",
          "--text-label": "#1A1A2E",
          "--input-bg": "#FFFFFF",
          "--input-border": "#CCCCCC",
          "--input-focus": "#D4854A",
          "--input-placeholder": "#AAAAAA",
          "--handle-prefix": "#999999",
          "--strength-track": "#E8E4DF",
          "--error-text": "#C53030",
          "--error-banner-bg": "#FFF5F5",
          "--error-banner-border": "#FC8181",
          "--error-banner-text": "#C53030",
          "--handle-available": "#276749",
          "--handle-taken": "#C53030",
          "--cta": "#D4854A",
          "--toggle-bg": "#E8E4DF",
          "--toggle-fg": "#1A1A2E",
        } as React.CSSProperties
      }
    >
      <RegisterForm
        locale={locale}
        simulateError={simulateError}
        forceSubmitting={forceSubmitting}
      />
    </div>
  );
}
