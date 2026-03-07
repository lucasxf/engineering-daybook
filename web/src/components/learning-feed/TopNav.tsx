'use client';

import { useUser } from '@/contexts/AuthContext';

export default function TopNav() {
  const { user } = useUser();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm dark:border-mid-blue dark:bg-primary-blue/30">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Wordmark */}
          <div className="font-wordmark text-xl font-semibold">
            <span className="wordmark-regular text-foreground">learn</span>
            <span className="wordmark-bold text-accent">imo</span>
          </div>

          {/* User Avatar/Menu */}
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="h-9 w-9 rounded-full border border-border dark:border-mid-blue"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 dark:bg-accent/30">
                <span className="text-sm font-semibold text-accent">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
