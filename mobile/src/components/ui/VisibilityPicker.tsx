import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { PokVisibility } from '@/lib/pokApi';
import { Text } from './Text';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// ---------------------------------------------------------------------------
// Option definitions
// ---------------------------------------------------------------------------

const VISIBILITY_OPTIONS: Array<{
  value: PokVisibility;
  iconName: IoniconName;
  labelKey: string;
  descKey: string;
}> = [
  { value: 'PRIVATE',         iconName: 'lock-closed',    labelKey: 'learnings.visibility.private',       descKey: 'learnings.visibility.privateDesc' },
  { value: 'COLLEAGUES_ONLY', iconName: 'people',         labelKey: 'learnings.visibility.colleaguesOnly', descKey: 'learnings.visibility.colleaguesOnlyDesc' },
  { value: 'FOLLOWERS_ONLY',  iconName: 'people-outline', labelKey: 'learnings.visibility.followersOnly',  descKey: 'learnings.visibility.followersOnlyDesc' },
  { value: 'PUBLIC',          iconName: 'globe-outline',  labelKey: 'learnings.visibility.public',         descKey: 'learnings.visibility.publicDesc' },
];

const TIER_ORDER: PokVisibility[] = ['PRIVATE', 'COLLEAGUES_ONLY', 'FOLLOWERS_ONLY', 'PUBLIC'];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getDisabledValues(currentVisibility: PokVisibility): PokVisibility[] {
  const currentIndex = TIER_ORDER.indexOf(currentVisibility);
  return TIER_ORDER.slice(0, currentIndex);
}

// ---------------------------------------------------------------------------
// VisibilityBadge
// ---------------------------------------------------------------------------

const ICON_NAME_MAP = Object.fromEntries(
  VISIBILITY_OPTIONS.map((o) => [o.value, o.iconName])
) as Record<PokVisibility, IoniconName>;

const LABEL_KEY_MAP = Object.fromEntries(
  VISIBILITY_OPTIONS.map((o) => [o.value, o.labelKey])
) as Record<PokVisibility, string>;

interface VisibilityBadgeProps {
  visibility: PokVisibility;
}

export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <View
      accessibilityRole="text"
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}
    >
      <Ionicons name={ICON_NAME_MAP[visibility]} size={14} color={theme.colors.textSecondary} />
      <Text variant="bodySm" style={{ color: theme.colors.textSecondary }}>
        {t(LABEL_KEY_MAP[visibility])}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// VisibilityPicker
// ---------------------------------------------------------------------------

interface VisibilityPickerProps {
  value: PokVisibility;
  onChange: (value: PokVisibility) => void;
  disabledValues?: PokVisibility[];
  /** When true, show the public warning below the picker when PUBLIC is selected.
   *  Default: false. Pass true from LearningNewScreen and LearningDetailScreen. */
  showPublicWarning?: boolean;
  /** Compact horizontal pill layout — 4 emoji pills in one row + selected description below.
   *  Use on LearningNewScreen to save vertical space when the keyboard is open. */
  compact?: boolean;
}

export function VisibilityPicker({
  value,
  onChange,
  disabledValues = [],
  showPublicWarning = false,
  compact = false,
}: VisibilityPickerProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  if (compact) {
    const selectedOpt = VISIBILITY_OPTIONS.find((o) => o.value === value)!;
    return (
      <View style={{ gap: theme.spacing.xs }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
          {VISIBILITY_OPTIONS.map((opt) => {
            const isSelected = value === opt.value;
            const isDisabled = disabledValues.includes(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                accessibilityRole="button"
                accessibilityLabel={t(opt.labelKey)}
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radii.full,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.surfaceAlt : 'transparent',
                  opacity: isDisabled ? 0.4 : 1,
                }}
                onPress={isDisabled ? undefined : () => onChange(opt.value)}
              >
                <Ionicons name={opt.iconName} size={16} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            );
          })}
        </View>
        <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
          {t(selectedOpt.labelKey)}: {t(selectedOpt.descKey)}
        </Text>
        {showPublicWarning && value === 'PUBLIC' && (
          <Text variant="bodySm" style={{ color: theme.colors.warning }}>
            {t('learnings.visibility.publicWarning')}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {VISIBILITY_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        const isDisabled = disabledValues.includes(opt.value);

        const rowStyle = {
          borderRadius: theme.radii.md,
          padding: theme.spacing.sm,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          backgroundColor: isSelected ? theme.colors.surfaceAlt : 'transparent',
          borderWidth: isSelected ? 2 : 1,
          ...(isDisabled ? { opacity: 0.4 } : {}),
        };

        return (
          <TouchableOpacity
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            style={rowStyle}
            onPress={isDisabled ? undefined : () => onChange(opt.value)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Ionicons name={opt.iconName} size={18} color={theme.colors.textPrimary} />
              <View style={{ flex: 1 }}>
                <Text variant="label">{t(opt.labelKey)}</Text>
                <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                  {t(opt.descKey)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {showPublicWarning && value === 'PUBLIC' && (
        <Text variant="bodySm" style={{ color: theme.colors.warning }}>
          {t('learnings.visibility.publicWarning')}
        </Text>
      )}
    </View>
  );
}
