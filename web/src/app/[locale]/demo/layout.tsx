import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { locales, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

interface DemoLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DemoLayout({ children, params }: DemoLayoutProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
