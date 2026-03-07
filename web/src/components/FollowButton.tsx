'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { followLearner, unfollowLearner, type RelationshipStatus } from '@/lib/learnerApi';
import { Button } from '@/components/ui/Button';

interface FollowButtonProps {
  handle: string;
  relationshipStatus: RelationshipStatus;
  onRelationshipChange?: (newStatus: RelationshipStatus) => void;
}

/**
 * Follow/unfollow button that reflects the current relationship status.
 *
 * - NONE → "Follow"
 * - FOLLOWING → "Following" (click to unfollow)
 * - FOLLOWED_BY → "Follow back"
 * - COLLEAGUE → "Colleague" (click to unfollow)
 */
export function FollowButton({ handle, relationshipStatus, onRelationshipChange }: FollowButtonProps) {
  const t = useTranslations('learners');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFollowing = relationshipStatus === 'FOLLOWING' || relationshipStatus === 'COLLEAGUE';

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      if (isFollowing) {
        await unfollowLearner(handle);
        // After unfollow: if was COLLEAGUE, the other person still follows us → FOLLOWED_BY
        onRelationshipChange?.(relationshipStatus === 'COLLEAGUE' ? 'FOLLOWED_BY' : 'NONE');
      } else {
        await followLearner(handle);
        // After follow: if they were already following us → COLLEAGUE, otherwise FOLLOWING
        onRelationshipChange?.(relationshipStatus === 'FOLLOWED_BY' ? 'COLLEAGUE' : 'FOLLOWING');
      }
    } catch {
      setError(t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  }

  const label = isFollowing
    ? (relationshipStatus === 'COLLEAGUE' ? t('social.colleague') : t('social.following'))
    : (relationshipStatus === 'FOLLOWED_BY' ? t('social.followBack') : t('social.follow'));

  return (
    <>
      <Button
        variant={isFollowing ? 'secondary' : 'primary'}
        size="sm"
        disabled={loading}
        onClick={handleClick}
        aria-label={isFollowing
          ? t('social.unfollow', { handle })
          : (relationshipStatus === 'FOLLOWED_BY' ? t('social.followBack') : t('social.follow'))}
      >
        {label}
      </Button>
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
