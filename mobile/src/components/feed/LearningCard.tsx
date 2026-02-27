import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Pok } from '@/lib/pokApi';
import { PressableCard } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

interface Props {
  pok: Pok;
  onPress: (pok: Pok) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function LearningCard({ pok, onPress }: Props) {
  const { theme } = useTheme();
  const { spacing, colors } = theme;

  const preview = pok.content.length > 200
    ? pok.content.slice(0, 200).trimEnd() + '…'
    : pok.content;

  return (
    <PressableCard
      onPress={() => onPress(pok)}
      accessibilityRole="button"
      accessibilityLabel={pok.title ?? preview}
      style={{ gap: spacing.xs }}
    >
      {pok.title && (
        <Text variant="label" numberOfLines={2}>
          {pok.title}
        </Text>
      )}

      <Text variant="body" numberOfLines={4} style={{ lineHeight: 22 }}>
        {preview}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
        <Text variant="caption">{formatDate(pok.createdAt)}</Text>

        {pok.tags.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1, marginLeft: spacing.sm }}>
            {pok.tags.slice(0, 3).map((tag) => (
              <View
                key={tag.id}
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: theme.radii.full,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                }}
              >
                <Text variant="caption">{tag.name}</Text>
              </View>
            ))}
            {pok.tags.length > 3 && (
              <Text variant="caption" color={colors.textSecondary}>+{pok.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </PressableCard>
  );
}
