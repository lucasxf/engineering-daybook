import { I18n } from 'i18n-js';
import en from './locales/en';
import ptBR from './locales/pt-BR';

export type Translations = typeof en;
export type Locale = 'en' | 'pt-BR';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'pt-BR'];
export const DEFAULT_LOCALE: Locale = 'en';

export const i18n = new I18n({ en, 'pt-BR': ptBR });

i18n.defaultLocale = DEFAULT_LOCALE;
i18n.locale = DEFAULT_LOCALE;
i18n.enableFallback = true;

export function setLocale(locale: Locale): void {
  i18n.locale = locale;
}

export function resolveLocale(deviceLocale: string): Locale {
  // Exact match (e.g. "pt-BR")
  if (SUPPORTED_LOCALES.includes(deviceLocale as Locale)) {
    return deviceLocale as Locale;
  }
  // Language-only match (e.g. "pt" → "pt-BR")
  const lang = deviceLocale.split('-')[0];
  const match = SUPPORTED_LOCALES.find((l) => l.startsWith(lang));
  return match ?? DEFAULT_LOCALE;
}
