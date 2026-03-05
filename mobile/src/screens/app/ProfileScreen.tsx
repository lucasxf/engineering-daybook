import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { updateUserSettings } from '@/lib/userApi';
import type { ProfileVisibility, PokVisibility } from '@/lib/auth';
import type { Locale } from '@/i18n/i18n';

type ColorSchemeOverride = 'light' | 'dark' | 'system';

export function ProfileScreen() {
  const { theme, override, setOverride } = useTheme();
  const { t, locale, setAppLocale } = useI18n();
  const { user, logout } = useAuth();

  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    user?.profileVisibility ?? 'PRIVATE'
  );
  const [defaultPokVisibility, setDefaultPokVisibility] = useState<PokVisibility>(
    user?.defaultPokVisibility ?? 'PRIVATE'
  );

  async function handleProfileVisibilityChange(value: ProfileVisibility) {
    setProfileVisibility(value);
    try {
      await updateUserSettings({ profileVisibility: value });
    } catch {
      setProfileVisibility(user?.profileVisibility ?? 'PRIVATE');
      Alert.alert(t('profile.privacy.saveError'));
    }
  }

  async function handleDefaultPokVisibilityChange(value: PokVisibility) {
    setDefaultPokVisibility(value);
    try {
      await updateUserSettings({ defaultPokVisibility: value });
    } catch {
      setDefaultPokVisibility(user?.defaultPokVisibility ?? 'PRIVATE');
      Alert.alert(t('profile.privacy.saveError'));
    }
  }

  const privacyOptions: Array<{ value: ProfileVisibility; label: string }> = [
    { value: 'PRIVATE', label: t('profile.privacy.private') },
    { value: 'PUBLIC', label: t('profile.privacy.public') },
  ];

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
    { value: 'en', label: t('profile.languageOptions.en') },
    { value: 'pt-BR', label: t('profile.languageOptions.ptBR') },
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

        {/* Privacy */}
        <Card style={{ gap: theme.spacing.sm }}>
          <Text variant="label">{t('profile.privacy.heading')}</Text>

          <Text variant="bodySm">{t('profile.privacy.profileVisibility')}</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            {privacyOptions.map((opt) => (
              <Button
                key={opt.value}
                label={opt.label}
                variant={profileVisibility === opt.value ? 'primary' : 'secondary'}
                onPress={() => handleProfileVisibilityChange(opt.value)}
                style={{ flex: 1 }}
              />
            ))}
          </View>

          <Text variant="bodySm">{t('profile.privacy.defaultPokVisibility')}</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            {privacyOptions.map((opt) => (
              <Button
                key={opt.value}
                label={opt.label}
                variant={defaultPokVisibility === opt.value ? 'primary' : 'secondary'}
                onPress={() => handleDefaultPokVisibilityChange(opt.value)}
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
