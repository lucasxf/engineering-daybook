import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import type { AppTabsParamList } from '@/navigation/AppTabs';
import { useI18n } from '@/contexts/I18nContext';
import { pokApi, type PokVisibility } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import type { PokFormData } from '@/lib/validations';
import { Text } from '@/components/ui/Text';
import { VisibilityPicker } from '@/components/ui/VisibilityPicker';
import { LearningForm } from '@/components/feed/LearningForm';

export function LearningNewScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const nav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<PokVisibility>(
    user?.defaultPokVisibility ?? 'PRIVATE'
  );

  async function handleSubmit(data: PokFormData) {
    setServerError(null);
    try {
      await pokApi.create({
        title: data.title || null,
        content: data.content,
        visibility,
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

      {/* Visibility picker */}
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
        <Text variant="label" style={{ marginBottom: theme.spacing.xs }}>{t('learnings.visibility.pickerLabel')}</Text>
        <VisibilityPicker
          value={visibility}
          onChange={setVisibility}
          showPublicWarning
        />
      </View>

      <LearningForm
        onSubmit={handleSubmit}
        onCancel={() => nav.navigate('Feed')}
        submitLabel={t('learnings.new.submitButton')}
        serverError={serverError}
      />
    </SafeAreaView>
  );
}
