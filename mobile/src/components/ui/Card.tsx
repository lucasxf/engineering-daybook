import React from 'react';
import { Pressable, PressableProps, View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps extends ViewProps {
  style?: ViewStyle;
}

export function Card({ style, children, ...rest }: CardProps) {
  const { theme } = useTheme();
  const { colors, spacing, radii } = theme;
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

interface PressableCardProps extends Omit<PressableProps, 'style'> {
  style?: ViewStyle;
}

export function PressableCard({ style, children, ...rest }: PressableCardProps) {
  const { theme } = useTheme();
  const { colors, spacing, radii } = theme;
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
