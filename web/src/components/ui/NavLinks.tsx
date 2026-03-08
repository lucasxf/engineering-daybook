'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

/**
 * Primary navigation links for authenticated users.
 *
 * Renders Feed | My Learnings | Discover links with active-state highlighting.
 * Hidden when the user is not authenticated.
 */
export function NavLinks() {
  const t = useTranslations('nav');
  const params = useParams<{ locale: string }>();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const links = [
    { href: `/${params.locale}/feed`, label: t('feed') },
    { href: `/${params.locale}/poks`, label: t('myLearnings') },
    { href: `/${params.locale}/discover`, label: t('discover') },
  ];

  return (
    <nav aria-label="Primary navigation">
      <ul className="flex items-center gap-1">
        {links.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href}>
              <Link
                href={href as never}
                className={[
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
