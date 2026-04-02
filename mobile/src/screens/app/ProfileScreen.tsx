import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { VisibilityPicker } from '@/components/ui/VisibilityPicker';
import { deleteAvatar, updateUserSettings, uploadAvatar } from '@/lib/userApi';
import type { PokVisibility } from '@/lib/pokApi';
import type { ProfileVisibility } from '@/lib/auth';
import { TextInput } from '@/components/ui/TextInput';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import type { Locale } from '@/i18n/i18n';

type ColorSchemeOverride = 'light' | 'dark' | 'system';

export function ProfileScreen() {
  const { theme, override, setOverride } = useTheme();
  const { t, locale, setAppLocale } = useI18n();
  const { user, logout, updateUser } = useAuth();

  // ---------------------------------------------------------------------------
  // Identity editing state
  // ---------------------------------------------------------------------------

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [bioSaving, setBioSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Sync local state when AuthContext user updates (e.g. after updateUser call from another screen)
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setBio(user.bio ?? '');
      setProfileVisibility(user.profileVisibility ?? 'PRIVATE');
      setDefaultPokVisibility(user.defaultPokVisibility ?? 'PRIVATE');
    }
  }, [user]);

  // ---------------------------------------------------------------------------
  // Theme / locale auto-save state
  // ---------------------------------------------------------------------------

  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSavingLocale, setIsSavingLocale] = useState(false);
  const [themeSaveStatus, setThemeSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [localeSaveStatus, setLocaleSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const isSavingSettings = isSavingTheme || isSavingLocale;

  // ---------------------------------------------------------------------------
  // Privacy / visibility state
  // ---------------------------------------------------------------------------

  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    user?.profileVisibility ?? 'PRIVATE'
  );
  const [defaultPokVisibility, setDefaultPokVisibility] = useState<PokVisibility>(
    user?.defaultPokVisibility ?? 'PRIVATE'
  );

  // ---------------------------------------------------------------------------
  // Identity handlers
  // ---------------------------------------------------------------------------

  const handleDisplayNameSave = useCallback(async () => {
    setDisplayNameSaving(true);
    try {
      await updateUserSettings({ displayName });
      updateUser({ displayName });
    } catch {
      setDisplayName(user?.displayName ?? '');
      Alert.alert(t('profile.saveError'));
    } finally {
      setDisplayNameSaving(false);
    }
  }, [displayName, user, updateUser, t]);

  const handleBioSave = useCallback(async () => {
    setBioSaving(true);
    try {
      await updateUserSettings({ bio });
      updateUser({ bio });
    } catch {
      setBio(user?.bio ?? '');
      Alert.alert(t('profile.saveError'));
    } finally {
      setBioSaving(false);
    }
  }, [bio, user, updateUser, t]);

  const handleAvatarUpload = useCallback(async (uri: string, type: string, fileName: string) => {
    setAvatarUploading(true);
    try {
      const { avatarUrl } = await uploadAvatar(uri, type, fileName);
      updateUser({ avatarUrl });
    } catch {
      Alert.alert(t('profile.saveError'));
    } finally {
      setAvatarUploading(false);
    }
  }, [updateUser, t]);

  const handleAvatarRemove = useCallback(async () => {
    setAvatarUploading(true);
    try {
      await deleteAvatar();
      updateUser({ avatarUrl: undefined });
    } catch {
      Alert.alert(t('profile.saveError'));
    } finally {
      setAvatarUploading(false);
    }
  }, [updateUser, t]);

  // ---------------------------------------------------------------------------
  // Theme / locale handlers
  // ---------------------------------------------------------------------------

  const handleThemeChange = useCallback(async (value: ColorSchemeOverride) => {
    const prevOverride = override;
    setOverride(value);
    setIsSavingTheme(true);
    setThemeSaveStatus('idle');
    try {
      await updateUserSettings({ theme: value });
      setThemeSaveStatus('success');
      setTimeout(() => setThemeSaveStatus('idle'), 2000);
    } catch {
      setOverride(prevOverride);
      setThemeSaveStatus('error');
    } finally {
      setIsSavingTheme(false);
    }
  }, [override, setOverride]);

  const handleLocaleChange = useCallback(async (value: Locale) => {
    const prevLocale = locale;
    setAppLocale(value);
    setIsSavingLocale(true);
    setLocaleSaveStatus('idle');
    try {
      await updateUserSettings({ locale: value });
      setLocaleSaveStatus('success');
      setTimeout(() => setLocaleSaveStatus('idle'), 2000);
    } catch {
      setAppLocale(prevLocale);
      setLocaleSaveStatus('error');
    } finally {
      setIsSavingLocale(false);
    }
  }, [locale, setAppLocale]);

  // ---------------------------------------------------------------------------
  // Privacy handlers
  // ---------------------------------------------------------------------------

  async function handleProfileVisibilityChange(value: ProfileVisibility) {
    setProfileVisibility(value);
    try {
      await updateUserSettings({ profileVisibility: value });
      updateUser({ profileVisibility: value });
    } catch {
      setProfileVisibility(user?.profileVisibility ?? 'PRIVATE');
      Alert.alert(t('profile.privacy.saveError'));
    }
  }

  async function handleDefaultPokVisibilityChange(value: PokVisibility) {
    setDefaultPokVisibility(value);
    try {
      await updateUserSettings({ defaultPokVisibility: value });
      updateUser({ defaultPokVisibility: value });
    } catch {
      setDefaultPokVisibility(user?.defaultPokVisibility ?? 'PRIVATE');
      Alert.alert(t('profile.privacy.saveError'));
    }
  }

  // ---------------------------------------------------------------------------
  // Options
  // ---------------------------------------------------------------------------

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

        {/* Identity card — avatar + display name + bio */}
        {user && (
          <Card style={{ gap: theme.spacing.md, alignItems: 'center' }}>
            <AvatarPicker
              avatarUrl={user.avatarUrl}
              displayName={user.displayName ?? user.handle}
              handle={user.handle}
              size={72}
              uploading={avatarUploading}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
            />

            <Text variant="bodySm">@{user.handle}</Text>
            <Text variant="caption">{user.email}</Text>

            {/* Display name field */}
            <View style={{ width: '100%', gap: theme.spacing.xs }}>
              <Text variant="label">{t('profile.displayName')}</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('profile.displayNamePlaceholder')}
                maxLength={100}
                accessibilityLabel={t('profile.displayNamePlaceholder')}
              />
              <Button
                label={displayNameSaving ? t('profile.displayNameSaving') : t('profile.displayNameSave')}
                onPress={handleDisplayNameSave}
                disabled={displayNameSaving}
                fullWidth
                accessibilityState={{ disabled: displayNameSaving }}
                accessibilityLabel={displayNameSaving ? t('profile.displayNameSaving') : t('profile.displayNameSave')}
              />
            </View>

            {/* Bio field */}
            <View style={{ width: '100%', gap: theme.spacing.xs }}>
              <Text variant="label">{t('profile.bio')}</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder={t('profile.bioPlaceholder')}
                multiline
                maxLength={200}
                accessibilityLabel={t('profile.bioPlaceholder')}
              />
              <Text variant="caption" style={{ textAlign: 'right' }}>
                {t('profile.bioCharCount').replace('{count}', String(bio.length))}
              </Text>
              <Button
                label={bioSaving ? t('profile.bioSaving') : t('profile.bioSave')}
                onPress={handleBioSave}
                disabled={bioSaving}
                fullWidth
                accessibilityState={{ disabled: bioSaving }}
                accessibilityLabel={bioSaving ? t('profile.bioSaving') : t('profile.bioSave')}
              />
            </View>
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
                onPress={() => handleThemeChange(opt.value)}
                disabled={isSavingSettings}
                accessibilityState={{ busy: isSavingSettings }}
                style={{ flex: 1 }}
              />
            ))}
          </View>
          {themeSaveStatus !== 'idle' && (
            <Text accessibilityLiveRegion="polite" variant="caption">
              {themeSaveStatus === 'success' ? t('profile.themeSaved') : t('profile.saveError')}
            </Text>
          )}
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
                onPress={() => handleLocaleChange(opt.value)}
                disabled={isSavingSettings}
                accessibilityState={{ busy: isSavingSettings }}
                style={{ flex: 1 }}
              />
            ))}
          </View>
          {localeSaveStatus !== 'idle' && (
            <Text accessibilityLiveRegion="polite" variant="caption">
              {localeSaveStatus === 'success' ? t('profile.localeSaved') : t('profile.saveError')}
            </Text>
          )}
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
          <VisibilityPicker
            value={defaultPokVisibility}
            onChange={handleDefaultPokVisibilityChange}
          />
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
