import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { brandAccents, palette } from '@/theme/tokens';

// Deterministic background colors derived from handle hash.
// All values are Library at Dusk brand colors — dark enough to contrast
// with light initials text in both light and dark modes.
const INITIALS_COLORS = [
  palette.emberCta,           // #D4854A — ember CTA
  brandAccents.primaryBlue,   // #1A365D — deep navy
  brandAccents.branchBrown,   // #8B5E3C — warm brown
  palette.midBlue,            // #2B4A78 — mid blue
  palette.error,              // #C0392B — burgundy
  brandAccents.darkLeather,   // #6B4226 — dark leather
  palette.success,            // #27AE60 — green
  palette.warning,            // #E67E22 — amber
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
  const { theme } = useTheme();
  const { colors, typography } = theme;

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
      <Text
        style={[
          styles.initial,
          {
            fontSize,
            color: colors.textInverse,
            fontWeight: typography.weights.semibold,
            fontFamily: typography.fontFamily.bodyMedium,
          },
        ]}
      >
        {initial}
      </Text>
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
  initial: {},
});
