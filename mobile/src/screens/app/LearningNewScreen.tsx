import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import type { AppStackParamList } from '@/navigation/AppStack';
import type { AppTabsParamList } from '@/navigation/AppTabs';
import { useI18n } from '@/contexts/I18nContext';
import { pokApi, type PokVisibility } from '@/lib/pokApi';
import { tagApi, type Tag } from '@/lib/tagApi';
import { ApiRequestError } from '@/lib/api';
import type { PokFormData } from '@/lib/validations';
import { Text } from '@/components/ui/Text';
import { VisibilityPicker } from '@/components/ui/VisibilityPicker';
import { LearningForm } from '@/components/feed/LearningForm';
import { TagPickerModal } from '@/components/tags/TagPickerModal';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabsParamList, 'NewLearning'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export function LearningNewScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<PokVisibility>(
    user?.defaultPokVisibility ?? 'PRIVATE'
  );
  // [TSA-P02] Incrementing this key remounts LearningForm with clean defaults after each save.
  // Unsaved drafts survive tab switches — only a successful save triggers the reset.
  const [formKey, setFormKey] = useState(0);

  // Tag draft management
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [tagListLoading, setTagListLoading] = useState(false);
  const [tagActionLoading, setTagActionLoading] = useState(false);

  // Prefetch tag list on mount so the modal opens instantly
  useEffect(() => {
    setTagListLoading(true);
    tagApi.list()
      .then(setAllTags)
      .catch(() => {})
      .finally(() => setTagListLoading(false));
  }, []);

  function handleSelectTag(tag: Tag) {
    setSelectedTags((prev) => [...prev, tag]);
    setTagModalVisible(false);
  }

  async function handleCreateTag(name: string) {
    if (!name.trim()) return;
    setTagActionLoading(true);
    try {
      const newTag = await tagApi.create({ name });
      setSelectedTags((prev) => [...prev, newTag]);
      setTagModalVisible(false);
    } catch {
      Alert.alert(t('learnings.detail.tagCreateError'));
    } finally {
      setTagActionLoading(false);
    }
  }

  function handleRemoveSelectedTag(tagId: string) {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tagId));
  }

  async function handleSubmit(data: PokFormData) {
    setServerError(null);
    try {
      const pok = await pokApi.create({
        title: data.title || null,
        content: data.content,
        visibility,
        tagIds: selectedTags.map((tag) => tag.id),
      });
      // [TSA-P02] Reset form state before navigating so the screen is clean on return.
      setFormKey((k) => k + 1);
      setVisibility(user?.defaultPokVisibility ?? 'PRIVATE');
      setSelectedTags([]);
      // Navigate to detail screen so the user can manage tags further
      nav.navigate('LearningDetail', { pokId: pok.id });
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setServerError(e.message);
      } else {
        setServerError(t('learnings.errors.saveFailed'));
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text variant="heading" style={{ padding: theme.spacing.md }}>
        {t('learnings.new.title')}
      </Text>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
        {/* [TSA-P01] Compact horizontal pill picker — ~50px vs ~280px for the full layout.
            Keeps the content TextInput reachable when the soft keyboard is open. */}
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
          <Text variant="label" style={{ marginBottom: theme.spacing.xs }}>
            {t('learnings.visibility.pickerLabel')}
          </Text>
          <VisibilityPicker
            value={visibility}
            onChange={setVisibility}
            showPublicWarning
            compact
          />
        </View>

        {/* Inline tag section — select tags before saving */}
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
          <Text variant="label" style={{ marginBottom: theme.spacing.xs }}>
            {t('learnings.detail.tags')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {selectedTags.map((tag) => (
              <View
                key={tag.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.tagPillBg,
                  borderRadius: theme.radii.full,
                  paddingLeft: theme.spacing.sm,
                  paddingRight: theme.spacing.xs,
                  paddingVertical: 2, /* canonical tag pill vertical padding (matches LearningCard) */
                  gap: theme.spacing.xs,
                }}
              >
                <Text variant="caption" color={theme.colors.tagPillText}>{tag.displayName}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t('learnings.detail.removeTagAccessibilityLabel', { tagName: tag.displayName })}
                  onPress={() => handleRemoveSelectedTag(tag.id)}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 4 }}
                >
                  <Text variant="caption" color={theme.colors.tagPillText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add tag button */}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setTagModalVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: theme.radii.full,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: theme.colors.border,
                gap: theme.spacing.xs,
              }}
            >
              <Text variant="caption" color={theme.colors.textSecondary}>+ {t('learnings.detail.addTag')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* [TSA-P02] key={formKey} forces a clean remount after each successful save.
            scrollable={false} avoids nested ScrollView — the outer ScrollView handles all scrolling. */}
        <LearningForm
          key={formKey}
          onSubmit={handleSubmit}
          onCancel={() => nav.navigate('Feed')}
          submitLabel={t('learnings.new.submitButton')}
          serverError={serverError}
          scrollable={false}
        />
      </ScrollView>

      <TagPickerModal
        visible={tagModalVisible}
        selectedTagIds={selectedTags.map((tag) => tag.tagId)}
        onClose={() => setTagModalVisible(false)}
        onSelect={handleSelectTag}
        onCreate={handleCreateTag}
        allTags={allTags}
        listLoading={tagListLoading}
        actionLoading={tagActionLoading}
      />
    </SafeAreaView>
  );
}
