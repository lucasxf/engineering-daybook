import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { FollowButton } from '@/components/learners/FollowButton';
import { useTheme } from '@/contexts/ThemeContext';
import type { LearnerSearchResult, RelationshipStatus } from '@/lib/learnerApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LearnerResultCardProps {
  result: LearnerSearchResult;
  currentUserHandle?: string;
  onPress: (handle: string) => void;
  onRelationshipChange?: (handle: string, newStatus: RelationshipStatus) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LearnerResultCard({
  result,
  currentUserHandle,
  onPress,
  onRelationshipChange,
}: LearnerResultCardProps) {
  const { theme } = useTheme();

  const displayName = result.displayName ?? result.handle;
  const isOwnProfile = result.handle === currentUserHandle;
  const relationshipStatus = result.relationship ?? 'NONE';

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    infoColumn: {
      flex: 1,
      justifyContent: 'center',
    },
    handle: {
      marginTop: 2,
    },
    followButtonContainer: {
      flexShrink: 0,
    },
  });

  function handleCardPress() {
    onPress(result.handle);
  }

  function handleRelationshipChange(newStatus: RelationshipStatus) {
    onRelationshipChange?.(result.handle, newStatus);
  }

  return (
    <Pressable
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, @${result.handle}`}
      style={styles.card}
    >
      <Avatar
        avatarUrl={result.avatarUrl}
        displayName={displayName}
        handle={result.handle}
        size={40}
      />
      <View style={styles.infoColumn}>
        <Text variant="body" color={theme.colors.textPrimary}>
          {displayName}
        </Text>
        <Text variant="caption" color={theme.colors.textSecondary} style={styles.handle}>
          @{result.handle}
        </Text>
        {result.bio != null && result.bio.length > 0 && (
          <Text variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
            {result.bio}
          </Text>
        )}
      </View>
      {!isOwnProfile && (
        <View style={styles.followButtonContainer}>
          <FollowButton
            handle={result.handle}
            relationshipStatus={relationshipStatus}
            onRelationshipChange={handleRelationshipChange}
          />
        </View>
      )}
    </Pressable>
  );
}
