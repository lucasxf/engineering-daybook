'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { RegisterFormV2 } from '@/components/auth/RegisterFormV2';

/* ─────────────────────────────────────────────────────────────────────────────
   CSS Custom Properties for theming
   
   These are injected inline to allow side-by-side dark/light rendering
   without relying on :root or .dark class toggling.
────────────────────────────────────────────────────────────────────────────── */

const lightThemeVars = {
  '--background': '#F5F0E8',
  '--foreground': '#1A1A2E',
  '--muted': '#666666',
  '--primary': '#D4854A',
  '--primary-foreground': '#FFFFFF',
  '--secondary': '#F5F0E8',
  '--secondary-foreground': '#1A1A2E',
  '--input-bg': '#FFFFFF',
  '--input-border': '#CCC',
  '--input-text': '#1A1A2E',
  '--input-placeholder': '#AAAAAA',
  '--ring': '#D4854A',
  '--error': '#C53030',
  '--warning': '#DD6B20',
  '--success': '#276749',
  '--card-bg': '#FFFFFF',
  '--card-border': '#E8E4DF',
} as React.CSSProperties;

const darkThemeVars = {
  '--background': '#0F1B2D',
  '--foreground': '#F5F0E8',
  '--muted': '#8899AA',
  '--primary': '#D4854A',
  '--primary-foreground': '#FFFFFF',
  '--secondary': '#1A365D',
  '--secondary-foreground': '#F5F0E8',
  '--input-bg': '#0F1B2D',
  '--input-border': '#2B4A78',
  '--input-text': '#F5F0E8',
  '--input-placeholder': '#4A607A',
  '--ring': '#D4854A',
  '--error': '#FC8181',
  '--warning': '#DD6B20',
  '--success': '#68D391',
  '--card-bg': '#1A365D',
  '--card-border': '#2B4A78',
} as React.CSSProperties;

/* ─────────────────────────────────────────────────────────────────────────────
   Wordmark Component
────────────────────────────────────────────────────────────────────────────── */
function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className} style={{ fontWeight: 700, letterSpacing: '-0.025em' }}>
      learnimo
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Register Screen Wrapper
────────────────────────────────────────────────────────────────────────────── */
interface RegisterScreenProps {
  theme: 'light' | 'dark';
  locale: string;
  forceSubmitting?: boolean;
  serverErrorOverride?: string | null;
  handleAvailability?: { isChecking: boolean; isAvailable: boolean | null };
}

function RegisterScreen({
  theme,
  locale,
  forceSubmitting,
  serverErrorOverride,
  handleAvailability,
}: RegisterScreenProps) {
  const t = useTranslations('auth');
  const themeVars = theme === 'dark' ? darkThemeVars : lightThemeVars;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        ...themeVars,
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      {/* Utility Bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark className="text-xl" />
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('registerTitle')}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t('registerSubtitle')}
            </p>
          </div>

          {/* Form */}
          <RegisterFormV2
            locale={locale}
            forceSubmitting={forceSubmitting}
            serverErrorOverride={serverErrorOverride}
            handleAvailability={handleAvailability}
            onSubmit={async () => {
              // Demo: just wait
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }}
          />
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Demo Control Panel
────────────────────────────────────────────────────────────────────────────── */
interface ControlPanelProps {
  locale: string;
  onLocaleChange: (locale: string) => void;
  serverError: string | null;
  onServerErrorChange: (error: string | null) => void;
  forceSubmitting: boolean;
  onForceSubmittingChange: (value: boolean) => void;
  handleAvailability: { isChecking: boolean; isAvailable: boolean | null };
  onHandleAvailabilityChange: (value: { isChecking: boolean; isAvailable: boolean | null }) => void;
}

function ControlPanel({
  locale,
  onLocaleChange,
  serverError,
  onServerErrorChange,
  forceSubmitting,
  onForceSubmittingChange,
  handleAvailability,
  onHandleAvailabilityChange,
}: ControlPanelProps) {
  return (
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6">
        {/* Locale Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Locale:</span>
          <select
            value={locale}
            onChange={(e) => onLocaleChange(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="en">English</option>
            <option value="pt-BR">Portugues (BR)</option>
          </select>
        </div>

        {/* Server Error Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Server Error:</span>
          <select
            value={serverError ?? 'none'}
            onChange={(e) => onServerErrorChange(e.target.value === 'none' ? null : e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="none">None</option>
            <option value="Email is already in use">Email already registered</option>
            <option value="Handle is already taken">Handle already taken</option>
            <option value="An unexpected error occurred">Unexpected error</option>
          </select>
        </div>

        {/* Handle Availability */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Handle:</span>
          <select
            value={
              handleAvailability.isChecking
                ? 'checking'
                : handleAvailability.isAvailable === true
                  ? 'available'
                  : handleAvailability.isAvailable === false
                    ? 'taken'
                    : 'idle'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'checking') {
                onHandleAvailabilityChange({ isChecking: true, isAvailable: null });
              } else if (val === 'available') {
                onHandleAvailabilityChange({ isChecking: false, isAvailable: true });
              } else if (val === 'taken') {
                onHandleAvailabilityChange({ isChecking: false, isAvailable: false });
              } else {
                onHandleAvailabilityChange({ isChecking: false, isAvailable: null });
              }
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="idle">Idle</option>
            <option value="checking">Checking...</option>
            <option value="available">Available</option>
            <option value="taken">Taken</option>
          </select>
        </div>

        {/* Force Submitting */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={forceSubmitting}
            onChange={(e) => onForceSubmittingChange(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Force Submitting
          </span>
        </label>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Demo Page
────────────────────────────────────────────────────────────────────────────── */
export default function RegisterDemoPage() {
  const params = useParams<{ locale: string }>();
  const [locale, setLocale] = useState(params.locale || 'en');
  const [serverError, setServerError] = useState<string | null>(null);
  const [forceSubmitting, setForceSubmitting] = useState(false);
  const [handleAvailability, setHandleAvailability] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
  }>({ isChecking: false, isAvailable: null });

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-900">
      {/* Control Panel */}
      <ControlPanel
        locale={locale}
        onLocaleChange={setLocale}
        serverError={serverError}
        onServerErrorChange={setServerError}
        forceSubmitting={forceSubmitting}
        onForceSubmittingChange={setForceSubmitting}
        handleAvailability={handleAvailability}
        onHandleAvailabilityChange={setHandleAvailability}
      />

      {/* Side-by-Side Preview */}
      <div className="flex flex-1">
        {/* Light Theme */}
        <div className="w-1/2 overflow-auto border-r border-slate-300 dark:border-slate-700">
          <RegisterScreen
            theme="light"
            locale={locale}
            forceSubmitting={forceSubmitting}
            serverErrorOverride={serverError}
            handleAvailability={handleAvailability}
          />
        </div>

        {/* Dark Theme */}
        <div className="w-1/2 overflow-auto">
          <RegisterScreen
            theme="dark"
            locale={locale}
            forceSubmitting={forceSubmitting}
            serverErrorOverride={serverError}
            handleAvailability={handleAvailability}
          />
        </div>
      </div>
    </div>
  );
}
