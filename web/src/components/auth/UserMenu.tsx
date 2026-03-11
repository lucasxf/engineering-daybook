'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

/**
 * User menu shown in the header when authenticated.
 * Displays @handle and a logout button.
 */
export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push(`/${params.locale}/login` as never);
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/${params.locale}/learners/${user.handle}`}
        className="flex items-center gap-2 rounded-md px-1 hover:opacity-80 transition-opacity"
        aria-label={`View ${user.displayName ?? user.handle}'s profile`}
      >
        <Avatar
          avatarUrl={user.avatarUrl}
          displayName={user.displayName ?? user.handle}
          handle={user.handle}
          size={28}
        />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          @{user.handle}
        </span>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        {t('logOut')}
      </Button>
    </div>
  );
}
