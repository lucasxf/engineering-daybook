'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
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
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        @{user.handle}
      </span>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        {t('logOut')}
      </Button>
    </div>
  );
}
