'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { FollowButton } from '@/components/FollowButton';
import type { LearnerSearchResult } from '@/lib/learnerApi';

interface LearnerResultCardProps {
  learner: LearnerSearchResult;
  onFollowChanged?: () => void;
}

/**
 * Card component for a single learner search result.
 *
 * Shows: avatar, display name, handle, bio snippet, and a Follow/Unfollow button.
 * No follower/following counts (anti-vanity rule).
 */
export function LearnerResultCard({ learner, onFollowChanged }: LearnerResultCardProps) {
  const params = useParams<{ locale: string }>();

  const displayName = learner.displayName || `@${learner.handle}`;
  const profileHref = `/${params.locale}/learners/${learner.handle}` as never;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <Link href={profileHref} aria-label={`View ${displayName}'s profile`}>
        <Avatar
          avatarUrl={learner.avatarUrl}
          displayName={displayName}
          handle={learner.handle}
          size={48}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={profileHref}
              className="block font-semibold text-slate-900 hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-400"
            >
              {displayName}
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{learner.handle}</p>
          </div>

          <FollowButton
            handle={learner.handle}
            relationshipStatus={learner.relationship ?? 'NONE'}
            onRelationshipChange={onFollowChanged ? () => onFollowChanged() : undefined}
          />
        </div>

        {learner.bio && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {learner.bio}
          </p>
        )}
      </div>
    </div>
  );
}
