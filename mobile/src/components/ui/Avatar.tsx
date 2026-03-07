import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

// Deterministic background colors derived from handle hash
const INITIALS_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#f43f5e', // rose-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
];

function colorForHandle(handle: string): string {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = (hash * 31 + handle.charCodeAt(i)) | 0;
  }
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

interface AvatarProps {
  /** URL of the avatar image. When absent, shows an initials placeholder. */
  avatarUrl?: string | null;
  /** The user's display name — first letter used as the initials placeholder. */
  displayName: string;
  /** The user's handle — used to derive the placeholder background color. */
  handle: string;
  /** Diameter in points. Defaults to 40. */
  size?: number;
}

/**
 * Displays a circular avatar image, or an initials placeholder when no image URL is set.
 *
 * The placeholder background color is deterministically derived from the user's handle
 * so the same user always gets the same color across sessions and devices.
 */
export function Avatar({ avatarUrl, displayName, handle, size = 40 }: AvatarProps) {
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';
  const fontSize = Math.max(10, Math.round(size * 0.4));
  const borderRadius = size / 2;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        accessibilityLabel={`${displayName}'s avatar`}
        style={[styles.image, { width: size, height: size, borderRadius }]}
      />
    );
  }

  const bgColor = colorForHandle(handle);
  return (
    <View
      accessible
      accessibilityLabel={`${displayName}'s avatar`}
      style={[styles.placeholder, { width: size, height: size, borderRadius, backgroundColor: bgColor }]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
