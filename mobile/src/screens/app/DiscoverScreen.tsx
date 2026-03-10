import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInput } from '@/components/ui/TextInput';
import { Text } from '@/components/ui/Text';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LearnerResultCard } from '@/components/discover/LearnerResultCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useLearnerSearch } from '@/hooks/useLearnerSearch';
import type { AppStackParamList } from '@/navigation/AppStack';
import type { LearnerSearchResult, RelationshipStatus } from '@/lib/learnerApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DiscoverNavProp = NativeStackNavigationProp<AppStackParamList>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiscoverScreen() {
  const navigation = useNavigation<DiscoverNavProp>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useI18n();

  const [query, setQuery] = useState('');
  const { results: searchResults, loading, error } = useLearnerSearch(query);
  const [results, setResults] = useState<LearnerSearchResult[]>([]);

  // Sync results from hook into local state
  useEffect(() => {
    setResults(searchResults);
  }, [searchResults]);

  const currentUserHandle = user?.handle;

  // Set header title via navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: t('discover.title') });
  }, [navigation, t]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    contentContainer: {
      flex: 1,
    },
    centeredFeedback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    listContent: {
      paddingBottom: theme.spacing.lg,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.md,
    },
  });

  function handleCardPress(handle: string) {
    navigation.navigate('LearnerProfile', { handle });
  }

  function handleRelationshipChange(handle: string, newStatus: RelationshipStatus) {
    setResults(prev => prev.map(r => r.handle === handle ? { ...r, relationship: newStatus } : r));
  }

  function renderItem({ item }: ListRenderItemInfo<LearnerSearchResult>) {
    return (
      <LearnerResultCard
        result={item}
        currentUserHandle={currentUserHandle}
        onPress={handleCardPress}
        onRelationshipChange={handleRelationshipChange}
      />
    );
  }

  function renderSeparator() {
    return <View style={styles.separator} />;
  }

  function keyExtractor(item: LearnerSearchResult) {
    return item.handle;
  }

  // ---------------------------------------------------------------------------
  // Content area
  // ---------------------------------------------------------------------------

  function renderContent() {
    if (query.length < 2) {
      return (
        <View style={styles.centeredFeedback}>
          <Text variant="body" color="muted">
            {t('discover.minCharsPrompt')}
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.centeredFeedback}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error != null) {
      return (
        <View style={styles.centeredFeedback}>
          <ErrorMessage message={t('discover.loadError')} />
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View style={styles.centeredFeedback}>
          <Text variant="body" color="muted">
            {t('discover.noResults')}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('discover.searchPlaceholder')}
            accessibilityLabel={t('discover.searchPlaceholder')}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.contentContainer}>{renderContent()}</View>
      </View>
    </SafeAreaView>
  );
}
