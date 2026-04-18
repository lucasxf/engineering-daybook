import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { locales, type Locale } from '@/lib/i18n';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { LogoLink } from '@/components/ui/LogoLink';
import { NavLinks } from '@/components/ui/NavLinks';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const ft = await getTranslations({ locale, namespace: 'footer' });

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <h1><LogoLink /></h1>
              <NavLinks />
            </div>
            <div className="flex items-center gap-2">
              <UserMenu />
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-border bg-background py-6">
          <div className="container mx-auto flex justify-center gap-6 px-4 text-sm text-slate-500 dark:text-slate-400">
            <Link href={`/${locale}/privacy` as never} className="hover:text-slate-700 dark:hover:text-slate-200">
              {ft('privacy')}
            </Link>
            <Link href={`/${locale}/support` as never} className="hover:text-slate-700 dark:hover:text-slate-200">
              {ft('support')}
            </Link>
          </div>
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}
