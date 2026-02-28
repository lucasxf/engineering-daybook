import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

interface Props {
  message?: string | null;
  style?: ViewStyle;
}

export function ErrorMessage({ message, style }: Props) {
  const { theme } = useTheme();
  if (!message) return null;
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.errorBackground,
          borderRadius: theme.radii.md,
          padding: theme.spacing.sm,
        },
        style,
      ]}
    >
      <Text variant="bodySm" color={theme.colors.error}>
        {message}
      </Text>
    </View>
  );
}
