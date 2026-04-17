import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import type { Tag } from '@/lib/tagApi';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';

export type TagPickerModalProps = {
  visible: boolean;
  /** Global tag IDs (Tag.tagId) already attached — excluded from available list. */
  selectedTagIds: string[];
  onClose: () => void;
  onSelect: (tag: Tag) => void;
  onCreate: (name: string) => void;
  allTags: Tag[];
  /** True while the tag list is being fetched for the first time. */
  listLoading?: boolean;
  /** True while a select/create action is in progress. */
  actionLoading?: boolean;
};

export function TagPickerModal({
  visible,
  selectedTagIds,
  onClose,
  onSelect,
  onCreate,
  allTags,
  listLoading = false,
  actionLoading = false,
}: TagPickerModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [tagQuery, setTagQuery] = useState('');

  useEffect(() => {
    if (!visible) setTagQuery('');
  }, [visible]);

  const assignedIds = new Set(selectedTagIds);
  const availableTags = allTags.filter((tag) => !assignedIds.has(tag.tagId));
  const filteredTags = tagQuery
    ? availableTags.filter(
        (tag) =>
          tag.displayName.toLowerCase().includes(tagQuery.toLowerCase()) ||
          tag.name.toLowerCase().includes(tagQuery.toLowerCase())
      )
    : availableTags;
  const showCreateRow =
    tagQuery.length > 0 &&
    !allTags.some(
      (tag) =>
        tag.name.toLowerCase() === tagQuery.toLowerCase() ||
        tag.displayName.toLowerCase() === tagQuery.toLowerCase()
    );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{ flex: 1 }} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View onStartShouldSetResponder={() => true}>
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: theme.radii.lg,
                borderTopRightRadius: theme.radii.lg,
                paddingTop: theme.spacing.md,
                maxHeight: 400,
              }}
            >
              <Text
                variant="label"
                style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}
              >
                {t('learnings.detail.addTagTitle')}
              </Text>

              <TextInput
                value={tagQuery}
                onChangeText={(text) => {
                  const normalized = text
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  setTagQuery(normalized);
                }}
                placeholder={t('learnings.detail.tagSearchPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={{
                  marginHorizontal: theme.spacing.md,
                  marginBottom: theme.spacing.sm,
                }}
                style={{
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radii.sm,
                }}
              />

              {actionLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ paddingVertical: theme.spacing.lg }}
                />
              ) : listLoading && allTags.length === 0 ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ paddingVertical: theme.spacing.lg }}
                />
              ) : filteredTags.length === 0 && !showCreateRow ? (
                <Text
                  variant="bodySm"
                  color={theme.colors.textSecondary}
                  style={{ padding: theme.spacing.md, textAlign: 'center' }}
                >
                  {allTags.length === 0
                    ? t('learnings.detail.noTagsAvailable')
                    : t('learnings.detail.noMoreTagsToAdd')}
                </Text>
              ) : (
                <FlatList
                  data={filteredTags}
                  keyExtractor={(item) => item.tagId}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => onSelect(item)}
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                      }}
                    >
                      <Text variant="bodySm">{item.displayName}</Text>
                    </TouchableOpacity>
                  )}
                  ListFooterComponent={
                    showCreateRow ? (
                      <TouchableOpacity
                        onPress={() => onCreate(tagQuery)}
                        style={{
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.border,
                        }}
                      >
                        <Text variant="bodySm" color={theme.colors.primary}>
                          {t('learnings.detail.tagCreateNew', { name: tagQuery })}
                        </Text>
                      </TouchableOpacity>
                    ) : null
                  }
                />
              )}

              <View style={{ height: theme.spacing.xl }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}
