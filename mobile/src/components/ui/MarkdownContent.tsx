import React, { useMemo } from 'react';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '@/contexts/ThemeContext';
import type { AppTheme } from '@/theme/tokens';

interface MarkdownContentProps {
  content: string;
}

function buildStyles(theme: AppTheme) {
  const { typography, colors, spacing, radii } = theme;
  return {
    body: {
      color: colors.textPrimary,
      fontSize: typography.sizes.md,
      lineHeight: typography.sizes.md * typography.lineHeights.normal,
    },
    heading1: {
      fontSize: typography.sizes.xxxl,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    heading2: {
      fontSize: typography.sizes.xxl,
      fontWeight: typography.weights.semibold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    heading3: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    strong: {
      fontWeight: typography.weights.bold,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    code_inline: {
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.xs,
      borderRadius: radii.sm,
      fontSize: typography.sizes.sm,
    },
    fence: {
      backgroundColor: colors.surfaceAlt,
      padding: spacing.sm,
      borderRadius: radii.md,
      fontSize: typography.sizes.sm,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.border,
      paddingLeft: spacing.sm,
      marginLeft: 0,
      backgroundColor: colors.surface,
    },
    link: {
      color: colors.primary,
    },
    bullet_list_icon: {
      color: colors.textSecondary,
    },
    ordered_list_icon: {
      color: colors.textSecondary,
    },
  };
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => buildStyles(theme), [theme]);
  return <Markdown style={styles}>{content}</Markdown>;
}
