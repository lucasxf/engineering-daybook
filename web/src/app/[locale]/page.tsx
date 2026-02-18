import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
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
      <Button size="lg">{t('getStarted')}</Button>
    </div>
  );
}
