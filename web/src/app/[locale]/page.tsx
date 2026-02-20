import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { type Locale } from '@/lib/i18n';

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * Home page with i18n support.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="mb-4 text-4xl font-bold">{t('welcome')}</h2>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
        {t('description')}
      </p>
      <Link
        href={`/${locale}/register`}
        className="inline-flex h-12 items-center justify-center rounded-md bg-primary-600 px-6 text-lg font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {t('getStarted')}
      </Link>
    </div>
  );
}
