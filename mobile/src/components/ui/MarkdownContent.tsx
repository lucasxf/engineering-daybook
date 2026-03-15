import React, { useMemo } from 'react';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '@/contexts/ThemeContext';
import type { AppTheme } from '@/theme/tokens';

interface MarkdownContentProps {
  content: string;
}

export function buildStyles(theme: AppTheme) {
  const { typography, colors, spacing, radii } = theme;
  return {
    body: {
      color: colors.contentBody,
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.body,
      lineHeight: typography.sizes.md * typography.lineHeights.normal,
    },
    // fontWeight omitted from all headings — Sora_600SemiBold has the weight baked in;
    // a conflicting fontWeight triggers Android font synthesis, producing incorrect rendering.
    heading1: {
      fontSize: typography.sizes.xxxl,
      fontFamily: typography.fontFamily.heading,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    heading2: {
      fontSize: typography.sizes.xxl,
      fontFamily: typography.fontFamily.heading,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    heading3: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fontFamily.heading,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    strong: {
      // fontWeight omitted — no DMSans bold variant loaded; bodyMedium (500) provides visual emphasis
      // without triggering Android font synthesis from an unloaded weight.
      fontFamily: typography.fontFamily.bodyMedium,
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
