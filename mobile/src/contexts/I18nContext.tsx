import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as ExpoLocalization from 'expo-localization';
import { i18n, Locale, resolveLocale, setLocale } from '@/i18n/i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface I18nContextValue {
  locale: Locale;
  setAppLocale: (locale: Locale) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const I18nContext = createContext<I18nContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

function getInitialLocale(): Locale {
  const deviceLocales = ExpoLocalization.getLocales();
  const tag = deviceLocales[0]?.languageTag ?? 'en';
  return resolveLocale(tag);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string, options?: Record<string, unknown>) => i18n.t(key, options),
    // locale in deps so t() updates when language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setAppLocale: handleSetLocale, t }),
    [locale, handleSetLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
