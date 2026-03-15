import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AppTheme } from '@/theme/tokens';

type TextVariant = 'body' | 'bodySm' | 'label' | 'caption' | 'heading' | 'subheading' | 'title';

interface Props extends TextProps {
  variant?: TextVariant;
  color?: string;
}

function getVariantStyle(variant: TextVariant, theme: AppTheme) {
  const { typography, colors } = theme;
  switch (variant) {
    case 'title':
      // fontWeight omitted — Sora_600SemiBold has the weight baked in; a conflicting value triggers Android font synthesis
      return { fontSize: typography.sizes.xxxl, fontFamily: typography.fontFamily.heading, color: colors.textPrimary };
    case 'heading':
      return { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, fontFamily: typography.fontFamily.heading, color: colors.textPrimary };
    case 'subheading':
      // fontWeight omitted — Sora_600SemiBold has the weight baked in; a conflicting value triggers Android font synthesis
      return { fontSize: typography.sizes.lg, fontFamily: typography.fontFamily.heading, color: colors.textPrimary };
    case 'label':
      return { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, fontFamily: typography.fontFamily.bodyMedium, color: colors.textPrimary };
    case 'bodySm':
      return { fontSize: typography.sizes.sm, fontWeight: typography.weights.regular, fontFamily: typography.fontFamily.body, color: colors.textSecondary };
    case 'caption':
      return { fontSize: typography.sizes.xs, fontWeight: typography.weights.regular, fontFamily: typography.fontFamily.body, color: colors.textSecondary };
    default: // 'body'
      return { fontSize: typography.sizes.md, fontWeight: typography.weights.regular, fontFamily: typography.fontFamily.body, color: colors.textPrimary };
  }
}

export function Text({ variant = 'body', color, style, ...rest }: Props) {
  const { theme } = useTheme();
  const variantStyle = getVariantStyle(variant, theme);
  return (
    <RNText
      style={[variantStyle, color ? { color } : undefined, style]}
      {...rest}
    />
  );
}
