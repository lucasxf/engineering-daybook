import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'pt-BR'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale;
  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
