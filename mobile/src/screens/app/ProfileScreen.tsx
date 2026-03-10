import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { updateUserSettings, uploadAvatar, deleteAvatar } from '@/lib/userApi';
import type { ProfileVisibility, PokVisibility } from '@/lib/auth';
import type { Locale } from '@/i18n/i18n';

type ColorSchemeOverride = 'light' | 'dark' | 'system';

export function ProfileScreen() {
  const { theme, override, setOverride } = useTheme();
  const { t, locale, setAppLocale } = useI18n();
  const { user, logout, updateUser } = useAuth();

  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    user?.profileVisibility ?? 'PRIVATE'
  );
  const [defaultPokVisibility, setDefaultPokVisibility] = useState<PokVisibility>(
    user?.defaultPokVisibility ?? 'PRIVATE'
  );

  // Display name editing state
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [displayNameSaving, setDisplayNameSaving] = useState(false);

  // Bio editing state
  const [bio, setBio] = useState(user?.bio ?? '');
  const [bioSaving, setBioSaving] = useState(false);

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Sync local state when user object changes (e.g. after external update)
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

  async function handleDisplayNameSave() {
    const prev = user?.displayName ?? '';
    setDisplayNameSaving(true);
    try {
      await updateUserSettings({ displayName });
      updateUser({ displayName });
    } catch {
      setDisplayName(prev);
      Alert.alert(t('profile.saveError'));
    } finally {
      setDisplayNameSaving(false);
    }
  }

  async function handleBioSave() {
    const prev = user?.bio ?? '';
    setBioSaving(true);
    try {
      await updateUserSettings({ bio });
      updateUser({ bio });
    } catch {
      setBio(prev);
      Alert.alert(t('profile.saveError'));
    } finally {
      setBioSaving(false);
    }
  }

  async function handleAvatarUpload(uri: string, type: string, fileName: string) {
    setAvatarUploading(true);
    try {
      const { avatarUrl } = await uploadAvatar(uri, type, fileName);
      updateUser({ avatarUrl });
    } catch {
      Alert.alert(t('profile.saveError'));
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarUploading(true);
    try {
      await deleteAvatar();
      updateUser({ avatarUrl: undefined });
    } catch {
      Alert.alert(t('profile.saveError'));
    } finally {
      setAvatarUploading(false);
    }
  }

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
          <Card style={{ gap: theme.spacing.sm }}>
            {/* Avatar + identity header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <AvatarPicker
                avatarUrl={user.avatarUrl ?? undefined}
                displayName={user.displayName ?? user.handle}
                handle={user.handle}
                size={56}
                uploading={avatarUploading}
                onUpload={handleAvatarUpload}
                onRemove={handleAvatarRemove}
              />
              <View style={{ flex: 1 }}>
                <Text variant="bodySm">@{user.handle}</Text>
                <Text variant="caption">{user.email}</Text>
              </View>
            </View>

            {/* Display name editing */}
            <View style={{ gap: theme.spacing.xs }}>
              <Text variant="label">{t('profile.displayNameLabel') || 'Display name'}</Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'center' }}>
                <TextInput
                  testID="display-name-input"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={t('profile.displayNamePlaceholder')}
                  maxLength={100}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 8,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surface,
                  }}
                  editable={!displayNameSaving}
                />
                <Button
                  testID="display-name-save-button"
                  label={displayNameSaving ? t('profile.displayNameSaving') : t('profile.displayNameSave')}
                  variant="primary"
                  onPress={handleDisplayNameSave}
                  disabled={displayNameSaving}
                  loading={displayNameSaving}
                />
              </View>
            </View>

            {/* Bio editing */}
            <View style={{ gap: theme.spacing.xs }}>
              <Text variant="label">{t('profile.bioLabel') || 'Bio'}</Text>
              <TextInput
                testID="bio-input"
                value={bio}
                onChangeText={setBio}
                placeholder={t('profile.bioPlaceholder')}
                maxLength={200}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 8,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surface,
                  minHeight: 72,
                  textAlignVertical: 'top',
                }}
                editable={!bioSaving}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="caption" testID="bio-char-count">
                  {t('profile.bioCharCount', { count: bio.length })}
                </Text>
                <Button
                  testID="bio-save-button"
                  label={bioSaving ? t('profile.bioSaving') : t('profile.bioSave')}
                  variant="primary"
                  onPress={handleBioSave}
                  disabled={bioSaving}
                  loading={bioSaving}
                />
              </View>
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
