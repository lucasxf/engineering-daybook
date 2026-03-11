import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useSocialFeedData } from '@/hooks/useSocialFeedData';
import type { FeedItem } from '@/lib/learnerApi';
import type { Pok } from '@/lib/pokApi';
import type { AppStackParamList } from '@/navigation/AppStack';
import { LearningCard } from '@/components/feed/LearningCard';
import { Text } from '@/components/ui/Text';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type AppNav = NativeStackNavigationProp<AppStackParamList>;

export function FeedScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<AppNav>();

  const { items, loading, refreshing, loadingMore, hasMore, error, refresh, loadMore } =
    useSocialFeedData();

  function handlePokPress(pok: Pok) {
    nav.navigate('LearningDetail', { pokId: pok.id });
  }

  function renderItem({ item }: { item: FeedItem }) {
    if (item.type === 'shared') {
      const originalPok = item.originalPok;
      if (!originalPok) return null;

      const authorHandle = item.originalAuthorHandle ?? item.sharedByHandle;
      const authorName = item.originalAuthorDisplayName ?? `@${authorHandle}`;

      return (
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        }}>
          {/* Re-learning header */}
          <View style={{
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            backgroundColor: theme.colors.surfaceAlt,
            flexDirection: 'row',
            gap: theme.spacing.xs,
          }}>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t('learnings.socialFeed.relearning')} @{item.sharedByHandle}
            </Text>
          </View>
          <LearningCard
            pok={{ ...originalPok, tags: originalPok.tags ?? [], pendingSuggestions: originalPok.pendingSuggestions ?? [] }}
            onPress={handlePokPress}
          />
          <View style={{
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.xs,
          }}>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t('learnings.socialFeed.by')} {authorName}
            </Text>
          </View>
        </View>
      );
    }

    // Owned feed item
    const authorHandle = item.authorHandle ?? '';
    const authorName = item.authorDisplayName ?? `@${authorHandle}`;

    return (
      <View>
        {authorHandle ? (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.xs,
            paddingBottom: theme.spacing.xs,
            gap: theme.spacing.xs,
          }}>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {authorName}
            </Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              @{authorHandle}
            </Text>
          </View>
        ) : null}
        <LearningCard pok={item} onPress={handlePokPress} />
      </View>
    );
  }

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl }}>
        <Text variant="bodySm">{t('learnings.socialFeed.empty')}</Text>
        <Text variant="caption" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}>
          {t('learnings.socialFeed.emptyHint')}
        </Text>
      </View>
    );
  }

  function renderFooter() {
    if (!loadingMore) return null;
    return (
      <ActivityIndicator
        size="small"
        color={theme.colors.primary}
        style={{ paddingVertical: theme.spacing.md }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
        <Text variant="heading">{t('learnings.socialFeed.title')}</Text>
      </View>

      {error && (
        <ErrorMessage
          message={t('learnings.socialFeed.loadError')}
          style={{ marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}
        />
      )}

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onRefresh={refresh}
          refreshing={refreshing}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{
            padding: theme.spacing.md,
            gap: theme.spacing.sm,
            flexGrow: 1,
          }}
        />
      )}
    </SafeAreaView>
  );
}
