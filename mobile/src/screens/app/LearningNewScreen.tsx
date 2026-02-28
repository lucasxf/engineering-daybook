import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/contexts/ThemeContext';
import type { AppTabsParamList } from '@/navigation/AppTabs';
import { useI18n } from '@/contexts/I18nContext';
import { pokApi } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import type { PokFormData } from '@/lib/validations';
import { Text } from '@/components/ui/Text';
import { LearningForm } from '@/components/feed/LearningForm';

export function LearningNewScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: PokFormData) {
    setServerError(null);
    try {
      await pokApi.create({
        title: data.title || null,
        content: data.content,
      });
      // Navigate back to feed after creation
      nav.navigate('Feed');
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setServerError(e.message);
      } else {
        setServerError(t('learnings.errors.saveFailed'));
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text variant="heading" style={{ padding: theme.spacing.md }}>
        {t('learnings.new.title')}
      </Text>
      <LearningForm
        onSubmit={handleSubmit}
        onCancel={() => nav.navigate('Feed')}
        submitLabel={t('learnings.new.submitButton')}
        serverError={serverError}
      />
    </SafeAreaView>
  );
}
