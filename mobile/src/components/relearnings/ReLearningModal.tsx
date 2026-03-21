import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import type { PokVisibility } from '@/lib/pokApi';
import { shareLearning } from '@/lib/learnerApi';
import type { PokShare } from '@/lib/learnerApi';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { VisibilityPicker } from '@/components/ui/VisibilityPicker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReLearningModalProps {
  visible: boolean;
  originalPokId: string;
  originalTitle: string | null;
  originalContentPreview: string;
  originalVisibility: PokVisibility;
  onSuccess: (share: PokShare) => void;
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VISIBILITY_ORDER: PokVisibility[] = [
  'PRIVATE',
  'COLLEAGUES_ONLY',
  'FOLLOWERS_ONLY',
  'PUBLIC',
];

/**
 * Returns visibility tiers that are ABOVE the given max tier.
 * These will be passed as disabledValues to VisibilityPicker.
 */
function visibilityOptionsAbove(max: PokVisibility): PokVisibility[] {
  const maxIdx = VISIBILITY_ORDER.indexOf(max);
  return VISIBILITY_ORDER.slice(maxIdx + 1);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReLearningModal({
  visible,
  originalPokId,
  originalTitle,
  originalContentPreview,
  originalVisibility,
  onSuccess,
  onDismiss,
}: ReLearningModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<PokVisibility>(originalVisibility);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error (and note) when modal reopens so stale state doesn't persist
  // across open/close cycles (modal stays mounted in LearningDetailScreen).
  useEffect(() => {
    if (visible) {
      setError(null);
      setNote('');
    }
  }, [visible]);

  const MAX_NOTE_LENGTH = 500;
  const disabledVisibilities = visibilityOptionsAbove(originalVisibility);

  const preview = originalTitle
    ? originalTitle
    : originalContentPreview.slice(0, 120);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const share = await shareLearning(originalPokId, {
        note: note || null,
        visibility,
      });
      onSuccess(share);
    } catch (err) {
      if ((err as { status?: number })?.status === 409) {
        setError(t('relearnings.modal.errorDuplicate'));
      } else {
        setError(t('relearnings.modal.errorGeneric'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
        activeOpacity={1}
        onPress={onDismiss}
      >
        {/* Empty flex spacer to push content to bottom */}
        <View style={{ flex: 1 }} />

        {/* Stop touch propagation so tapping panel doesn't dismiss */}
        <View onStartShouldSetResponder={() => true}>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.xl,
            }}
          >
            {/* Header row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.md,
              }}
            >
              <Text
                variant="subheading"
                accessibilityRole="header"
              >
                {t('relearnings.modal.title')}
              </Text>
              <TouchableOpacity
                onPress={onDismiss}
                accessibilityRole="button"
                accessibilityLabel={t('relearnings.modal.close')}
              >
                <Text variant="bodyLg">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Original preview section */}
              <View style={{ marginBottom: theme.spacing.md }}>
                <Text
                  variant="label"
                  style={{ marginBottom: theme.spacing.xs }}
                >
                  {t('relearnings.modal.originalPreview')}
                </Text>
                <View
                  style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: theme.radii.md,
                    padding: theme.spacing.sm,
                  }}
                >
                  <Text variant="bodySm" color={theme.colors.textSecondary}>
                    {preview}
                  </Text>
                </View>
              </View>

              {/* Note section */}
              <View style={{ marginBottom: theme.spacing.md }}>
                <Text
                  variant="label"
                  style={{ marginBottom: theme.spacing.xs }}
                >
                  {t('relearnings.modal.noteLabel')}
                </Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder={t('relearnings.modal.notePlaceholder')}
                  multiline
                  maxLength={MAX_NOTE_LENGTH}
                  accessibilityLabel={t('relearnings.modal.noteLabel')}
                  style={{ minHeight: 80 }}
                />
                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ marginTop: theme.spacing.xs, textAlign: 'right' }}
                  accessibilityLabel={t('relearnings.modal.charCounterLabel', {
                    current: note.length,
                    max: MAX_NOTE_LENGTH,
                  })}
                >
                  {t('relearnings.modal.charCounter', {
                    current: note.length,
                    max: MAX_NOTE_LENGTH,
                  })}
                </Text>
              </View>

              {/* Visibility section */}
              <View style={{ marginBottom: theme.spacing.lg }}>
                <Text
                  variant="label"
                  style={{ marginBottom: theme.spacing.sm }}
                >
                  {t('relearnings.modal.visibilityLabel')}
                </Text>
                <VisibilityPicker
                  value={visibility}
                  onChange={setVisibility}
                  disabledValues={disabledVisibilities}
                />
              </View>

              {/* Error message */}
              {error && (
                <ErrorMessage
                  message={error}
                  style={{ marginBottom: theme.spacing.md }}
                />
              )}

              {/* Action row */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: theme.spacing.sm,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Button
                    label={t('relearnings.modal.cancel')}
                    variant="secondary"
                    onPress={onDismiss}
                    disabled={submitting}
                    accessibilityLabel={t('relearnings.modal.cancel')}
                    accessibilityRole="button"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={t('relearnings.modal.confirm')}
                    variant="primary"
                    onPress={handleSubmit}
                    loading={submitting}
                    disabled={submitting}
                    accessibilityLabel={t('relearnings.modal.confirm')}
                    accessibilityRole="button"
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
