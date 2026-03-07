'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Auth-aware logo link with Bricolage Grotesque wordmark.
 * "learn" in regular weight + "imo" in bold.
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
      className="font-wordmark text-xl transition-opacity hover:opacity-80 text-ink dark:text-parchment"
    >
      <span className="font-normal">learn</span>
      <span className="font-bold">imo</span>
    </Link>
  );
}
