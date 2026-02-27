import React, { forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const TextInput = forwardRef<RNTextInput, Props>(
  ({ label, error, containerStyle, style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, spacing, radii, typography } = theme;

    return (
      <View style={[{ gap: spacing.xs }, containerStyle]}>
        {label && (
          <Text variant="label">{label}</Text>
        )}
        <RNTextInput
          ref={ref}
          style={[
            {
              borderWidth: 1,
              borderColor: error ? colors.error : colors.border,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm + 2,
              fontSize: typography.sizes.md,
              color: colors.textPrimary,
              backgroundColor: colors.surface,
            },
            style,
          ]}
          placeholderTextColor={colors.textDisabled}
          accessibilityLabel={label}
          {...rest}
        />
        {error && (
          <Text variant="caption" color={colors.error}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';
