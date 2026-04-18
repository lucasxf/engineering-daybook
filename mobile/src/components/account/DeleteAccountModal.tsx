import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { deleteAccountApi } from '@/lib/userApi';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';

export interface DeleteAccountModalProps {
  visible: boolean;
  userHandle: string;
  onCancel: () => void;
  onDeleted: () => void;
}

export function DeleteAccountModal({
  visible,
  userHandle,
  onCancel,
  onDeleted,
}: DeleteAccountModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { colors, spacing, radii } = theme;

  const [typedHandle, setTypedHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setTypedHandle('');
      setLoading(false);
      setApiError(null);
    }
  }, [visible]);

  // Android hardware back button — treat as Cancel
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCancel();
      return true;
    });
    return () => subscription.remove();
    // handleCancel is stable via useCallback below, but we intentionally omit it from
    // deps because adding it would create a circular reference with the subscription closure.
    // The cancel logic only reads stable props (onCancel) — safe to omit.
  }, [visible]); // intentional omission of handleCancel — see comment above

  const handleCancel = useCallback(() => {
    setTypedHandle('');
    setLoading(false);
    setApiError(null);
    onCancel();
  }, [onCancel]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      await deleteAccountApi();
      onDeleted();
    } catch {
      setApiError(t('profile.deleteAccount.error'));
      setLoading(false);
    }
  }, [onDeleted, t]);

  const mismatch = typedHandle.length > 0 && typedHandle !== userHandle;
  const isConfirmDisabled = typedHandle !== userHandle || loading;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.lg,
      borderTopRightRadius: radii.lg,
      padding: spacing.lg,
      gap: spacing.md,
    },
    warning: {
      borderLeftWidth: 3,
      borderLeftColor: colors.error,
      backgroundColor: colors.errorBackground ?? '#FFF0F0',
      padding: spacing.md,
      borderRadius: radii.sm,
    },
    buttonRow: {
      gap: spacing.sm,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text variant="subheading">{t('profile.deleteAccount.modalTitle')}</Text>

          <Text variant="body">{t('profile.deleteAccount.modalDescription')}</Text>

          <View style={styles.warning}>
            <Text variant="bodySm" color={colors.error}>
              {t('profile.deleteAccount.modalWarning')}
            </Text>
          </View>

          <TextInput
            label={t('profile.deleteAccount.confirmLabel')}
            placeholder={t('profile.deleteAccount.confirmPlaceholder')}
            value={typedHandle}
            onChangeText={setTypedHandle}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            accessibilityLabel={t('profile.deleteAccount.confirmLabel')}
          />

          {mismatch && (
            <Text
              variant="caption"
              color={colors.error}
              accessibilityLiveRegion="polite"
            >
              {t('profile.deleteAccount.confirmMismatch')}
            </Text>
          )}

          {apiError !== null && (
            <Text
              variant="caption"
              color={colors.error}
              accessibilityLiveRegion="polite"
            >
              {apiError}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <Button
              label={loading ? t('profile.deleteAccount.deleting') : t('profile.deleteAccount.confirm')}
              variant="danger"
              fullWidth
              onPress={handleConfirm}
              disabled={isConfirmDisabled}
              loading={loading}
              accessibilityState={{ disabled: isConfirmDisabled, busy: loading }}
            />

            <Button
              label={t('profile.deleteAccount.cancel')}
              variant="secondary"
              fullWidth
              onPress={handleCancel}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
