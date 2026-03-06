import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/contexts/ThemeContext';
import type { AppTabsParamList } from '@/navigation/AppTabs';
import { useI18n } from '@/contexts/I18nContext';
import { pokApi, type PokVisibility } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import type { PokFormData } from '@/lib/validations';
import { Text } from '@/components/ui/Text';
import { LearningForm } from '@/components/feed/LearningForm';

export function LearningNewScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<PokVisibility>('PRIVATE');

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
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, gap: theme.spacing.xs }}>
        <Text variant="label">{t('learnings.visibility.pickerLabel')}</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: visibility === 'PRIVATE' }}
            onPress={() => setVisibility('PRIVATE')}
            style={{
              flex: 1,
              padding: theme.spacing.sm,
              borderRadius: theme.radii.md,
              borderWidth: 1,
              borderColor: visibility === 'PRIVATE' ? theme.colors.primary : theme.colors.border,
              backgroundColor: visibility === 'PRIVATE' ? theme.colors.surfaceAlt : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text variant="bodySm">🔒 {t('learnings.visibility.private')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: visibility === 'PUBLIC' }}
            onPress={() => setVisibility('PUBLIC')}
            style={{
              flex: 1,
              padding: theme.spacing.sm,
              borderRadius: theme.radii.md,
              borderWidth: 1,
              borderColor: visibility === 'PUBLIC' ? theme.colors.primary : theme.colors.border,
              backgroundColor: visibility === 'PUBLIC' ? theme.colors.surfaceAlt : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text variant="bodySm">🌐 {t('learnings.visibility.public')}</Text>
          </TouchableOpacity>
        </View>
        {visibility === 'PUBLIC' && (
          <Text variant="bodySm" style={{ color: theme.colors.warning }}>
            {t('learnings.visibility.publicWarning')}
          </Text>
        )}
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
