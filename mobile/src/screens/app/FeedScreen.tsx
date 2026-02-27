import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useFeedData } from '@/hooks/useFeedData';
import { useDebounce } from '@/hooks/useDebounce';
import type { Pok, SearchMode } from '@/lib/pokApi';
import type { AppTabsParamList } from '@/navigation/AppTabs';
import { LearningCard } from '@/components/feed/LearningCard';
import { Text } from '@/components/ui/Text';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type Nav = BottomTabNavigationProp<AppTabsParamList, 'Feed'>;

// Minimal inline stack navigation for detail — will be replaced with proper
// stack navigator in a future polish pass
type DetailNav = NativeStackNavigationProp<any>;

export function FeedScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<Nav>();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  const { poks, loading, refreshing, loadingMore, hasMore, error, refresh, loadMore, setParams } =
    useFeedData();

  // Apply debounced search query
  React.useEffect(() => {
    setParams({
      keyword: debouncedSearch || undefined,
      searchMode: debouncedSearch ? 'hybrid' : undefined,
      page: 0,
    });
  }, [debouncedSearch, setParams]);

  function handlePokPress(pok: Pok) {
    // Navigate to detail — AppTabs → detail screen handled by a parent stack
    // For now cast to any; will be typed when AppStack wraps AppTabs
    (nav as any).navigate('LearningDetail', { pokId: pok.id });
  }

  function renderItem({ item }: { item: Pok }) {
    return (
      <LearningCard pok={item} onPress={handlePokPress} />
    );
  }

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl }}>
        <Text variant="bodySm">{t('learnings.feed.empty')}</Text>
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
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, gap: theme.spacing.sm }}>
        <Text variant="heading">{t('learnings.feed.title')}</Text>

        {/* Search bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing.md,
        }}>
          <TextInput
            style={{
              flex: 1,
              paddingVertical: theme.spacing.sm,
              fontSize: theme.typography.sizes.md,
              color: theme.colors.textPrimary,
            }}
            placeholder={t('learnings.feed.searchPlaceholder')}
            placeholderTextColor={theme.colors.textDisabled}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {error && (
        <ErrorMessage
          message={t('learnings.errors.loadFailed')}
          style={{ marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}
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
