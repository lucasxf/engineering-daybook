'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';

export default function TopNav() {
  const { user } = useAuth();
  const params = useParams<{ locale: string }>();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm dark:border-mid-blue dark:bg-primary-blue/30">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Wordmark */}
          <Link href={`/${params.locale}/learning-feed`} className="font-wordmark text-xl font-semibold">
            <span className="wordmark-regular text-foreground">learn</span>
            <span className="wordmark-bold text-accent">imo</span>
          </Link>

          {/* User Avatar */}
          {user && (
            <Avatar
              avatarUrl={user.avatarUrl}
              displayName={user.displayName ?? user.handle}
              handle={user.handle}
              size={36}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
