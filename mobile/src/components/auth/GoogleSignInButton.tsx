import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GoogleSignInButtonProps {
  onPress: () => Promise<void>;
  loading?: boolean;
  /** true = hide entirely (no client ID configured, FR9) */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
}: GoogleSignInButtonProps): React.ReactElement | null {
  const { theme } = useTheme();
  const { t } = useI18n();

  // FR9: when disabled (no client ID), render nothing
  if (disabled) return null;

  const { colors, spacing } = theme;

  const styles = StyleSheet.create({
    container: {
      marginTop: spacing.md,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerTextWrap: {
      marginHorizontal: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      {/* Horizontal divider with centred "Or continue with" label */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerTextWrap}>
          <Text variant="bodySm" color={colors.textSecondary}>
            {t('auth.login.orContinueWith')}
          </Text>
        </View>
        <View style={styles.dividerLine} />
      </View>

      {/* Google sign-in button */}
      <Button
        label={t('auth.login.googleButton')}
        variant="secondary"
        onPress={onPress}
        loading={loading}
        disabled={loading}
        accessibilityLabel={t('auth.login.googleButton')}
        accessibilityState={{ disabled: loading, busy: loading }}
      />
    </View>
  );
}
