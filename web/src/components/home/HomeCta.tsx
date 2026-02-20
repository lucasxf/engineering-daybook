'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

interface HomeCtaProps {
  locale: string;
}

/**
 * Auth-aware home page call-to-action button.
 * Authenticated users go to their learnings; guests go to register.
 */
export function HomeCta({ locale }: HomeCtaProps) {
  const t = useTranslations('home');
  const { isAuthenticated, isLoading } = useAuth();

  const href = !isLoading && isAuthenticated ? `/${locale}/poks` : `/${locale}/register`;
  const label = !isLoading && isAuthenticated ? t('viewLearnings') : t('getStarted');

  return (
    <Link
      href={href as never}
      className="inline-flex h-12 items-center justify-center rounded-md bg-primary-600 px-6 text-lg font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {label}
    </Link>
  );
}
