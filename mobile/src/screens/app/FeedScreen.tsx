import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useSocialFeedData } from '@/hooks/useSocialFeedData';
import { useFeedData } from '@/hooks/useFeedData';
import { useDebounce } from '@/hooks/useDebounce';
import type { FeedItem } from '@/lib/learnerApi';
import type { Pok } from '@/lib/pokApi';
import type { AppStackParamList } from '@/navigation/AppStack';
import { LearningCard } from '@/components/feed/LearningCard';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { TextInput } from '@/components/ui/TextInput';

type AppNav = NativeStackNavigationProp<AppStackParamList>;

// ---------------------------------------------------------------------------
// Social feed content (extracted so the hook only runs when this tab is shown)
// ---------------------------------------------------------------------------

function SocialContent({ onPokPress }: { onPokPress: (pok: Pok) => void }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<AppNav>();

  const { items, loading, refreshing, loadingMore, hasMore, error, refresh, loadMore } =
    useSocialFeedData();

  function handleAuthorPress(handle: string) {
    if (handle) {
      nav.navigate('LearnerProfile', { handle });
    }
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
          {/* Re-learning header — sharer attribution is tappable */}
          <Pressable
            onPress={() => handleAuthorPress(item.sharedByHandle)}
            accessibilityRole="button"
            accessibilityLabel={`@${item.sharedByHandle}`}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
              backgroundColor: theme.colors.surfaceAlt,
              flexDirection: 'row',
              gap: theme.spacing.xs,
            }}
          >
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t('learnings.socialFeed.relearning')} @{item.sharedByHandle}
            </Text>
          </Pressable>
          <LearningCard
            pok={{ ...originalPok, tags: originalPok.tags ?? [], pendingSuggestions: originalPok.pendingSuggestions ?? [] }}
            onPress={onPokPress}
          />
          {/* Original author attribution is tappable */}
          <Pressable
            onPress={() => handleAuthorPress(authorHandle)}
            accessibilityRole="button"
            accessibilityLabel={authorName}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingBottom: theme.spacing.xs,
            }}
          >
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t('learnings.socialFeed.by')} {authorName}
            </Text>
          </Pressable>
        </View>
      );
    }

    // Owned feed item — author attribution row is tappable
    const authorHandle = item.authorHandle ?? '';
    const authorName = item.authorDisplayName ?? `@${authorHandle}`;

    return (
      <View>
        {authorHandle ? (
          <Pressable
            onPress={() => handleAuthorPress(authorHandle)}
            accessibilityRole="button"
            accessibilityLabel={authorName}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.xs,
              paddingBottom: theme.spacing.xs,
              gap: theme.spacing.xs,
            }}
          >
            <Text variant="caption" color={theme.colors.textSecondary}>
              {authorName}
            </Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              @{authorHandle}
            </Text>
          </Pressable>
        ) : null}
        <LearningCard pok={item} onPress={onPokPress} />
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
        <Button
          label={t('learnings.socialFeed.findLearners')}
          variant="secondary"
          onPress={() => nav.navigate('Discover')}
          style={{ marginTop: theme.spacing.md }}
        />
      </View>
    );
  }

  return (
    <>
      {error && (
        <ErrorMessage
          message={t('learnings.socialFeed.loadError')}
          style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}
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
          ListFooterComponent={loadingMore ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ paddingVertical: theme.spacing.md }} />
          ) : null}
          onRefresh={refresh}
          refreshing={refreshing}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm, flexGrow: 1 }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// My Learnings content with search bar (hook only runs when this tab is shown)
// ---------------------------------------------------------------------------

function MyLearningsContent({ onPokPress }: { onPokPress: (pok: Pok) => void }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);

  const { poks, loading, refreshing, loadingMore, hasMore, error, refresh, loadMore, setParams } =
    useFeedData();

  useEffect(() => {
    setParams({ keyword: debouncedKeyword || undefined });
  }, [debouncedKeyword, setParams]);

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl }}>
        <Text variant="bodySm">{t('learnings.feed.empty')}</Text>
      </View>
    );
  }

  return (
    <>
      {/* Search bar */}
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('learnings.feed.searchPlaceholder')}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {error && (
        <ErrorMessage
          message={t('learnings.errors.loadFailed')}
          style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}
        />
      )}

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={poks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LearningCard pok={item} onPress={onPokPress} />}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={loadingMore ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ paddingVertical: theme.spacing.md }} />
          ) : null}
          onRefresh={refresh}
          refreshing={refreshing}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm, flexGrow: 1 }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// FeedScreen — tab toggle between social feed and personal feed
// ---------------------------------------------------------------------------

type TabKey = 'social' | 'mine';

export function FeedScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<AppNav>();
  const [activeTab, setActiveTab] = useState<TabKey>('social');

  function handlePokPress(pok: Pok) {
    nav.navigate('LearningDetail', { pokId: pok.id });
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'social', label: t('learnings.socialFeed.title') },
    { key: 'mine', label: t('learnings.feed.title') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Tab toggle header */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        gap: theme.spacing.sm,
        alignItems: 'center',
      }}>
        <View style={{ flex: 1, flexDirection: 'row', gap: theme.spacing.sm }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: 6, /* xs(4) + 2: pill vertical padding */
                  borderRadius: theme.radii.full,
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                }}
              >
                <Text
                  variant="bodySm"
                  style={{ fontFamily: active ? theme.typography.fontFamily.bodyMedium : theme.typography.fontFamily.body }}
                  color={active ? theme.colors.textInverse : theme.colors.textSecondary}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {activeTab === 'social' && (
          <Pressable
            onPress={() => nav.navigate('Discover')}
            accessibilityRole="button"
            accessibilityLabel={t('learnings.socialFeed.discover')}
          >
            <Text variant="label" color={theme.colors.primary}>🔍</Text>
          </Pressable>
        )}
      </View>

      {activeTab === 'social'
        ? <SocialContent onPokPress={handlePokPress} />
        : <MyLearningsContent onPokPress={handlePokPress} />
      }
    </SafeAreaView>
  );
}
