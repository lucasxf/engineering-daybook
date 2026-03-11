import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/contexts/I18nContext';
import { followLearner, unfollowLearner } from '@/lib/learnerApi';
import type { RelationshipStatus } from '@/lib/learnerApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FollowButtonProps {
  handle: string;
  relationshipStatus: RelationshipStatus;
  onRelationshipChange?: (newStatus: RelationshipStatus) => void;
}

// ---------------------------------------------------------------------------
// Helpers (exported for unit-testing the pure mapping logic)
// ---------------------------------------------------------------------------

export interface ButtonConfig {
  label: string;
  variant: 'primary' | 'secondary';
  nextStatus: RelationshipStatus;
  apiAction: 'follow' | 'unfollow';
}

export function getButtonConfig(
  status: RelationshipStatus,
  labels: {
    follow: string;
    following: string;
    followBack: string;
    colleague: string;
  }
): ButtonConfig {
  switch (status) {
    case 'NONE':
      return { label: labels.follow, variant: 'primary', nextStatus: 'FOLLOWING', apiAction: 'follow' };
    case 'FOLLOWING':
      return { label: labels.following, variant: 'secondary', nextStatus: 'NONE', apiAction: 'unfollow' };
    case 'FOLLOWED_BY':
      return { label: labels.followBack, variant: 'primary', nextStatus: 'COLLEAGUE', apiAction: 'follow' };
    case 'COLLEAGUE':
      return { label: labels.colleague, variant: 'secondary', nextStatus: 'FOLLOWED_BY', apiAction: 'unfollow' };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FollowButton({ handle, relationshipStatus, onRelationshipChange }: FollowButtonProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = {
    follow: t('learners.social.follow'),
    following: t('learners.social.following'),
    followBack: t('learners.social.followBack'),
    colleague: t('learners.social.colleague'),
  };

  const config = getButtonConfig(relationshipStatus, labels);

  async function handlePress() {
    setError(null);
    setLoading(true);
    try {
      if (config.apiAction === 'follow') {
        await followLearner(handle);
      } else {
        await unfollowLearner(handle);
      }
      onRelationshipChange?.(config.nextStatus);
    } catch {
      setError(t('learners.social.unexpectedError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Button
        label={config.label}
        variant={config.variant}
        loading={loading}
        disabled={loading}
        onPress={handlePress}
      />
      {error !== null && (
        <Text variant="caption" color="red">
          {error}
        </Text>
      )}
    </View>
  );
}
