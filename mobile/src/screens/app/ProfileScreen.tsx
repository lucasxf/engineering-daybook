import React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type ColorSchemeOverride = 'light' | 'dark' | 'system';
type Locale = 'en' | 'pt-BR';

export function ProfileScreen() {
  const { theme, override, setOverride } = useTheme();
  const { t, locale, setAppLocale } = useI18n();
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      '',
      [
        { text: t('profile.logoutConfirmCancel'), style: 'cancel' },
        {
          text: t('profile.logoutConfirmOk'),
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  }

  const themeOptions: Array<{ value: ColorSchemeOverride; label: string }> = [
    { value: 'system', label: t('profile.themeOptions.system') },
    { value: 'light', label: t('profile.themeOptions.light') },
    { value: 'dark', label: t('profile.themeOptions.dark') },
  ];

  const localeOptions: Array<{ value: Locale; label: string }> = [
    { value: 'en', label: 'English' },
    { value: 'pt-BR', label: 'Português (BR)' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <Text variant="heading">{t('profile.title')}</Text>

        {user && (
          <Card style={{ gap: theme.spacing.xs }}>
            <Text variant="label">{user.handle}</Text>
            <Text variant="bodySm">{user.email}</Text>
          </Card>
        )}

        {/* Appearance */}
        <Card style={{ gap: theme.spacing.sm }}>
          <Text variant="label">{t('profile.themeLabel')}</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            {themeOptions.map((opt) => (
              <Button
                key={opt.value}
                label={opt.label}
                variant={override === opt.value ? 'primary' : 'secondary'}
                onPress={() => setOverride(opt.value)}
                style={{ flex: 1 }}
              />
            ))}
          </View>
        </Card>

        {/* Language */}
        <Card style={{ gap: theme.spacing.sm }}>
          <Text variant="label">{t('profile.languageLabel')}</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            {localeOptions.map((opt) => (
              <Button
                key={opt.value}
                label={opt.label}
                variant={locale === opt.value ? 'primary' : 'secondary'}
                onPress={() => setAppLocale(opt.value)}
                style={{ flex: 1 }}
              />
            ))}
          </View>
        </Card>

        <Button
          label={t('profile.logoutButton')}
          variant="danger"
          onPress={handleLogout}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}
