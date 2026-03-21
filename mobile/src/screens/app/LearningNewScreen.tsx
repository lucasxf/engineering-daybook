import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
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
  // [TSA-P02] Incrementing this key remounts LearningForm with clean defaults after each save.
  // Unsaved drafts survive tab switches — only a successful save triggers the reset.
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(data: PokFormData) {
    setServerError(null);
    try {
      await pokApi.create({
        title: data.title || null,
        content: data.content,
        visibility,
      });
      // [TSA-P02] Reset form state before navigating so the screen is clean on return.
      setFormKey((k) => k + 1);
      setVisibility(user?.defaultPokVisibility ?? 'PRIVATE');
      // [TSA-P03] Navigate to the personal feed so the new entry is immediately visible.
      nav.navigate('Feed', { tab: 'mine' });
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

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
        {/* [TSA-P01] Compact horizontal pill picker — ~50px vs ~280px for the full layout.
            Keeps the content TextInput reachable when the soft keyboard is open. */}
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
          <Text variant="label" style={{ marginBottom: theme.spacing.xs }}>
            {t('learnings.visibility.pickerLabel')}
          </Text>
          <VisibilityPicker
            value={visibility}
            onChange={setVisibility}
            showPublicWarning
            compact
          />
        </View>

        {/* [TSA-P02] key={formKey} forces a clean remount after each successful save */}
        <LearningForm
          key={formKey}
          onSubmit={handleSubmit}
          onCancel={() => nav.navigate('Feed')}
          submitLabel={t('learnings.new.submitButton')}
          serverError={serverError}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
