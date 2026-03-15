import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: Props) {
  const { theme } = useTheme();
  const { colors, spacing, radii } = theme;

  const isDisabled = disabled || loading;

  function getBackgroundColor() {
    if (isDisabled) return colors.disabledBg;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'danger': return colors.error;
      case 'secondary': return colors.surfaceAlt;
      case 'ghost': return 'transparent';
    }
  }

  function getLabelColor() {
    if (isDisabled) return colors.disabledText;
    switch (variant) {
      case 'primary':
      case 'danger': return colors.textInverse;
      case 'secondary': return colors.textPrimary;
      case 'ghost': return colors.primary;
    }
  }

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: radii.md,
          paddingVertical: 10, // optical balance between spacing.sm (8) and spacing.md (16)

          paddingHorizontal: spacing.md,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          opacity: pressed && !isDisabled ? 0.8 : 1,
          flexDirection: 'row' as const,
          gap: spacing.sm,
          ...(variant === 'secondary' ? { borderWidth: 1, borderColor: colors.border } : {}),
          ...(fullWidth ? { width: '100%' as const } : {}),
        },
        style,
      ]}
      {...rest}
    >
      {loading && <ActivityIndicator size="small" color={getLabelColor()} />}
      <Text variant="label" color={getLabelColor()}>
        {label}
      </Text>
    </Pressable>
  );
}
