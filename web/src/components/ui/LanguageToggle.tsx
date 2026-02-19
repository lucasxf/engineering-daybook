'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Button } from './Button';
import { type Locale } from '@/lib/i18n';

/**
 * Language toggle button for switching between EN and PT-BR.
 */
export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'pt-BR' : 'en';
    const newPathname = pathname.replace(`/${locale}`, `/${nextLocale}`);
    // Use window.location for language switching to avoid typed routes issue
    window.location.href = newPathname;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      aria-label="Toggle language"
    >
      {locale === 'en' ? 'EN' : 'PT'}
    </Button>
  );
}
