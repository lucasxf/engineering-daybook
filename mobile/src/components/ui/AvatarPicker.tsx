import React from 'react';
import { Text, View, Pressable, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from './Avatar';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export interface AvatarPickerProps {
  avatarUrl?: string;
  displayName: string;
  handle: string;
  size?: number;
  uploading: boolean;
  onUpload: (uri: string, type: string, fileName: string) => void;
  onRemove: () => void;
}

/**
 * Renders a tappable Avatar that opens the device media library.
 * When an avatarUrl is present, also renders a "Remove photo" option.
 *
 * The component is pure — it receives onUpload/onRemove callbacks
 * and does not own async state.
 */
export function AvatarPicker({
  avatarUrl,
  displayName,
  handle,
  size = 80,
  uploading,
  onUpload,
  onRemove,
}: AvatarPickerProps) {
  async function handlePress() {
    if (uploading) return;

    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (canAskAgain === false) {
        // System will not show the prompt again — direct user to Settings
        Alert.alert('Photo library access denied', 'Enable photo access in Settings to change your avatar.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
        ]);
      } else {
        Alert.alert('Permission denied', 'Photo library access denied');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as ImagePicker.MediaType,
      allowsEditing: true,
      quality: 0.9,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset) return;

    if (asset.fileSize !== undefined && asset.fileSize > MAX_FILE_SIZE) {
      Alert.alert('File too large', 'Please choose an image smaller than 2 MB.');
      return;
    }

    onUpload(asset.uri, asset.mimeType ?? 'image/jpeg', asset.fileName ?? 'avatar.jpg');
  }

  function handleRemove() {
    Alert.alert('Remove photo', 'Remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        disabled={uploading}
        accessibilityLabel="Change profile photo"
        accessibilityRole="button"
      >
        <Avatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          handle={handle}
          size={size}
        />
        {uploading && (
          <View style={[styles.overlay, { width: size, height: size, borderRadius: size / 2 }]}>
            <ActivityIndicator size="small" color="#ffffff" testID="avatar-uploading-indicator" />
          </View>
        )}
      </Pressable>

      {avatarUrl ? (
        <Pressable
          onPress={handleRemove}
          accessibilityLabel="Remove profile photo"
          accessibilityRole="button"
          testID="remove-photo-button"
        >
          {/* Text is intentionally imported from react-native via the mock */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
          <RemoveLabel />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Renders the destructive "Remove photo" label. */
function RemoveLabel() {
  return <Text style={styles.removeText}>Remove photo</Text>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
});
