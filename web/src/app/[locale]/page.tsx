import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { type Locale } from '@/lib/i18n';

interface HomePageProps {
  params: { locale: Locale };
}

/**
 * Home page with i18n support.
 */
export default function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);
  const t = useTranslations('home');

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
