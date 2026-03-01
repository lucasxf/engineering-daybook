'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Auth-aware logo link. Navigates authenticated users to their feed,
 * guests to the home page (login form).
 */
export function LogoLink() {
  const params = useParams<{ locale: string }>();
  const { isAuthenticated } = useAuth();

  const href = isAuthenticated
    ? `/${params.locale}/poks`
    : `/${params.locale}`;

  return (
    <Link
      href={href as never}
      className="text-xl font-bold text-primary-600 transition-opacity hover:opacity-80 dark:text-primary-400"
    >
      learnimo
    </Link>
  );
}
