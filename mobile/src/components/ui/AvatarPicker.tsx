import React from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { Avatar } from './Avatar';
import { Text } from './Text';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

interface AvatarPickerProps {
  avatarUrl?: string | null;
  displayName: string;
  handle: string;
  size?: number;
  uploading: boolean;
  onUpload: (uri: string, type: string, fileName: string) => void;
  onRemove: () => void;
}

/**
 * Pressable avatar area with image library picker and "Remove photo" action.
 * The component handles UX (permission request, type/size validation, confirmation
 * dialog) but does NOT call uploadAvatar / deleteAvatar directly — those are
 * owned by the caller via onUpload / onRemove callbacks.
 */
export function AvatarPicker({
  avatarUrl,
  displayName,
  handle,
  size = 72,
  uploading,
  onUpload,
  onRemove,
}: AvatarPickerProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  async function handlePickImage() {
    // On Android 13+, launchImageLibraryAsync uses the system Photo Picker which
    // requires no permissions. Only request on iOS where the photo library
    // permission dialog is still required.
    if (Platform.OS === 'ios') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('profile.avatarPermissionDenied'));
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as ImagePicker.MediaType,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    const mimeType = asset.mimeType ?? 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      Alert.alert(t('profile.avatarUnsupportedType'));
      return;
    }

    if (asset.fileSize !== undefined && asset.fileSize !== null && asset.fileSize > MAX_FILE_SIZE_BYTES) {
      Alert.alert(t('profile.avatarTooLarge'));
      return;
    }

    onUpload(asset.uri, mimeType, asset.fileName ?? 'avatar.jpg');
  }

  function handleRemove() {
    Alert.alert(
      t('profile.removeAvatarConfirmTitle'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.removeAvatarConfirmOk'),
          style: 'destructive',
          onPress: onRemove,
        },
      ]
    );
  }

  return (
    <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
      <Pressable
        onPress={handlePickImage}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel={t('profile.changeAvatar')}
        style={{ position: 'relative' }}
      >
        <Avatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          handle={handle}
          size={size}
        />
        {uploading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: size / 2,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          >
            <ActivityIndicator color={theme.colors.textInverse} />
          </View>
        )}
      </Pressable>

      <Text
        variant="caption"
        style={{ color: theme.colors.primary }}
        onPress={uploading ? undefined : handlePickImage}
      >
        {t('profile.changeAvatar')}
      </Text>

      {avatarUrl ? (
        <Text
          variant="caption"
          style={{ color: theme.colors.error }}
          onPress={uploading ? undefined : handleRemove}
        >
          {t('profile.removeAvatar')}
        </Text>
      ) : null}
    </View>
  );
}
