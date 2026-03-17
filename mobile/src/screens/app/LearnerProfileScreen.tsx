import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLearnerProfile } from '@/hooks/useLearnerProfile';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Text } from '@/components/ui/Text';
import { LearningCard } from '@/components/feed/LearningCard';
import { FollowButton } from '@/components/learners/FollowButton';
import { ReLearningModal } from '@/components/relearnings/ReLearningModal';
import type { AppStackParamList } from '@/navigation/AppStack';
import type { RelationshipStatus, LearnerPokSummary, LearnerProfileResponse, PokShare } from '@/lib/learnerApi';
import type { Pok } from '@/lib/pokApi';

type LearnerProfileRoute = RouteProp<AppStackParamList, 'LearnerProfile'>;

type AppNav = NativeStackNavigationProp<AppStackParamList>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapToPok(learning: LearnerPokSummary, ownerHandle: string): Pok {
  return {
    ...learning,
    title: learning.title ?? null,
    userId: ownerHandle,
    visibility: learning.visibility ?? 'PUBLIC',
    deletedAt: null,
    updatedAt: learning.createdAt,
    tags: [],
    pendingSuggestions: [],
  };
}

// ---------------------------------------------------------------------------
// ProfileHeader
// ---------------------------------------------------------------------------

interface ProfileHeaderProps {
  profile: LearnerProfileResponse;
  isOwnProfile: boolean;
  relationshipStatus: RelationshipStatus | null;
  onRelationshipChange: (newStatus: RelationshipStatus) => void;
}

function ProfileHeader({ profile, isOwnProfile, relationshipStatus, onRelationshipChange }: ProfileHeaderProps) {
  const { theme } = useTheme();
  const displayName = profile.displayName ?? `@${profile.handle}`;

  return (
    <View
      style={{
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      {/* Avatar + identity row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
        }}
      >
        <Avatar
          avatarUrl={profile.avatarUrl}
          displayName={displayName}
          handle={profile.handle}
          size={64}
        />
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <Text variant="label">{displayName}</Text>
          <Text variant="bodySm" color={theme.colors.textSecondary}>
            @{profile.handle}
          </Text>
        </View>
      </View>

      {/* Bio */}
      {profile.bio ? (
        <Text variant="bodySm">{profile.bio}</Text>
      ) : null}

      {/* FollowButton — absent for own profile */}
      {!isOwnProfile ? (
        <FollowButton
          handle={profile.handle}
          relationshipStatus={relationshipStatus ?? 'NONE'}
          onRelationshipChange={onRelationshipChange}
        />
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function LearnerProfileScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const nav = useNavigation<AppNav>();
  const route = useRoute<LearnerProfileRoute>();
  const { handle } = route.params;

  const { profile, loading, error, reload } = useLearnerProfile(handle);

  // Track relationship status locally so FollowButton changes are reflected immediately
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>(
    profile?.relationshipStatus ?? 'NONE'
  );

  // Sync local state when profile loads or changes
  useEffect(() => {
    if (profile?.relationshipStatus != null) {
      setRelationshipStatus(profile.relationshipStatus);
    }
  }, [profile?.relationshipStatus]);

  // Update the native stack header title once the profile is loaded
  useEffect(() => {
    if (profile) {
      const title = profile.displayName ?? `@${profile.handle}`;
      nav.setOptions({ title });
    }
  }, [profile, nav]);

  const isOwnProfile = user?.handle === handle;

  const [reLearningTarget, setReLearningTarget] = useState<LearnerPokSummary | null>(null);
  const [reLearnedIds, setReLearnedIds] = useState<Set<string>>(new Set());

  function handleRelearnSuccess(_share: PokShare) {
    if (reLearningTarget) {
      setReLearnedIds((prev) => new Set(prev).add(reLearningTarget.id));
    }
    setReLearningTarget(null);
  }

  const isPrivateShell =
    profile?.profileVisibility === 'PRIVATE' && profile?.learnings == null;

  // ------------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------
  // Error state
  // ------------------------------------------------------------------
  if (error || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <ErrorMessage message={t('learnerProfile.loadError')} />
          <Button
            label={t('learnerProfile.retry')}
            onPress={reload}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------
  // Private shell state
  // ------------------------------------------------------------------
  if (isPrivateShell) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          relationshipStatus={relationshipStatus}
          onRelationshipChange={setRelationshipStatus}
        />
        <View
          style={{
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          <Text variant="bodySm" color={theme.colors.textSecondary}>
            {t('learnerProfile.privateProfile')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------
  // Populated state — profile with learnings list
  // ------------------------------------------------------------------
  const learnings = profile.learnings ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={learnings}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <ProfileHeader
              profile={profile}
              isOwnProfile={isOwnProfile}
              relationshipStatus={relationshipStatus}
              onRelationshipChange={setRelationshipStatus}
            />
            <View
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingTop: theme.spacing.md,
                paddingBottom: theme.spacing.sm,
              }}
            >
              <Text variant="heading">{t('learnerProfile.learnings')}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const pok = mapToPok(item, profile.handle);
          const showRelearn = !isOwnProfile && item.visibility === 'PUBLIC';
          const alreadyRelearned = reLearnedIds.has(item.id);

          return (
            <View>
              <LearningCard
                pok={pok}
                onPress={(p) => nav.navigate('LearningDetail', { pokId: p.id })}
              />
              {showRelearn && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={alreadyRelearned ? t('relearnings.relearned') : t('relearnings.relearn')}
                  disabled={alreadyRelearned}
                  onPress={() => setReLearningTarget(item)}
                  style={{
                    marginTop: theme.spacing.xs,
                    marginHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.xs,
                    alignItems: 'flex-end',
                    opacity: alreadyRelearned ? 0.5 : 1,
                  }}
                >
                  <Text variant="bodySm" color={theme.colors.primary}>
                    {alreadyRelearned ? t('relearnings.relearned') : t('relearnings.relearn')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.sm,
            }}
          >
            <Text variant="bodySm" color={theme.colors.textSecondary}>
              {t('learnerProfile.noLearnings')}
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: theme.spacing.xl,
          gap: theme.spacing.sm,
        }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
      />
      {/* Re-learning modal */}
      {reLearningTarget && !isOwnProfile && (
        <ReLearningModal
          visible={reLearningTarget !== null}
          originalPokId={reLearningTarget.id}
          originalTitle={reLearningTarget.title ?? null}
          originalContentPreview={reLearningTarget.content}
          originalVisibility={reLearningTarget.visibility ?? 'PUBLIC'}
          onSuccess={handleRelearnSuccess}
          onDismiss={() => setReLearningTarget(null)}
        />
      )}
    </SafeAreaView>
  );
}
