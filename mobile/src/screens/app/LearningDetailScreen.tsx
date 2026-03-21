import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/AppStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { ReLearningModal } from '@/components/relearnings/ReLearningModal';
import { pokApi, type Pok, type PokVisibility } from '@/lib/pokApi';
import { tagApi, type Tag } from '@/lib/tagApi';
import { ApiRequestError } from '@/lib/api';
import type { PokFormData } from '@/lib/validations';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LearningForm } from '@/components/feed/LearningForm';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { VisibilityPicker, VisibilityBadge, getDisabledValues } from '@/components/ui/VisibilityPicker';

type RouteProps = RouteProp<AppStackParamList, 'LearningDetail'>;

export function LearningDetailScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProps>();
  const { pokId } = route.params;

  const [pok, setPok] = useState<Pok | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editVisibility, setEditVisibility] = useState<PokVisibility>('PRIVATE');

  const [reLearningModalVisible, setReLearningModalVisible] = useState(false);
  const [hasRelearned, setHasRelearned] = useState(false);

  // Tag management
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [tagActionLoading, setTagActionLoading] = useState(false);
  const [tagQuery, setTagQuery] = useState('');

  const loadPok = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pokApi.getById(pokId);
      setPok(data);
      setEditVisibility(data.visibility);
    } catch {
      setError(t('learnings.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [pokId, t]);

  useEffect(() => { loadPok(); }, [loadPok]);

  async function handleUpdate(data: PokFormData) {
    if (!pok) return;
    setServerError(null);
    try {
      const updated = await pokApi.update(pok.id, {
        title: data.title || null,
        content: data.content,
        visibility: editVisibility,
      });
      setPok(updated);
      setEditing(false);
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setServerError(e.message);
      } else {
        setServerError(t('learnings.errors.saveFailed'));
      }
    }
  }

  function handleDelete() {
    Alert.alert(
      t('learnings.detail.deleteConfirmTitle'),
      t('learnings.detail.deleteConfirmMessage'),
      [
        { text: t('learnings.detail.deleteConfirmCancel'), style: 'cancel' },
        {
          text: t('learnings.detail.deleteConfirmOk'),
          style: 'destructive',
          onPress: async () => {
            try {
              await pokApi.delete(pokId);
              nav.goBack();
            } catch {
              setError(t('learnings.errors.deleteFailed'));
            }
          },
        },
      ]
    );
  }

  const canRelearn = !!(
    pok &&
    pok.visibility === 'PUBLIC' &&
    user?.userId &&
    pok.userId !== user.userId
  );

  function handleRelearn() {
    setReLearningModalVisible(true);
  }

  function handleRelearnSuccess(_share: import('@/lib/learnerApi').PokShare) {
    setReLearningModalVisible(false);
    setHasRelearned(true);
  }

  function closeTagModal() {
    setTagModalVisible(false);
    setTagQuery('');
  }

  async function openTagModal() {
    try {
      const tags = await tagApi.list();
      setAllTags(tags);
      setTagModalVisible(true);
    } catch {
      Alert.alert(
        t('learnings.detail.tagListLoadErrorTitle'),
        t('learnings.detail.tagListLoadErrorMessage'),
        [
          { text: t('common.retry'), onPress: openTagModal },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  }

  async function handleAddTag(tag: Tag) {
    if (!pok) return;
    setTagActionLoading(true);
    try {
      await tagApi.assign(pok.id, tag.tagId);
      setPok((prev) => prev
        ? { ...prev, tags: [...prev.tags, tag] }
        : prev
      );
      closeTagModal();
    } catch {
      Alert.alert(t('learnings.detail.tagAddError'));
    } finally {
      setTagActionLoading(false);
    }
  }

  async function handleCreateTag() {
    if (!pok || !tagQuery.trim()) return;
    setTagActionLoading(true);
    try {
      const newTag = await tagApi.create({ name: tagQuery });
      await tagApi.assign(pok.id, newTag.tagId);
      setPok((prev) => prev
        ? { ...prev, tags: [...prev.tags, newTag] }
        : prev
      );
      closeTagModal();
    } catch {
      Alert.alert(t('learnings.detail.tagCreateError'));
    } finally {
      setTagActionLoading(false);
    }
  }

  async function handleRemoveTag(tag: Tag) {
    if (!pok) return;
    setTagActionLoading(true);
    try {
      await tagApi.remove(pok.id, tag.tagId);
      setPok((prev) => prev
        ? { ...prev, tags: prev.tags.filter((existing) => existing.tagId !== tag.tagId) }
        : prev
      );
    } catch {
      Alert.alert(t('learnings.detail.tagRemoveError'));
    } finally {
      setTagActionLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && !pok) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md }}>
        <ErrorMessage message={error} />
        <Button label={t('common.retry')} onPress={loadPok} style={{ marginTop: theme.spacing.md }} />
      </SafeAreaView>
    );
  }

  if (!pok) return null;

  if (editing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Text variant="heading" style={{ padding: theme.spacing.md }}>
          {t('learnings.edit.title')}
        </Text>

        {/* Visibility picker (edit mode) */}
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
          <Text variant="label" style={{ marginBottom: theme.spacing.xs }}>{t('learnings.visibility.pickerLabel')}</Text>
          {pok.visibility === 'PUBLIC' ? (
            <Text variant="bodySm" style={{ color: theme.colors.textSecondary }}>
              🔒 {t('learnings.visibility.lockedPublic')}
            </Text>
          ) : (
            <VisibilityPicker
              value={editVisibility}
              onChange={setEditVisibility}
              disabledValues={getDisabledValues(pok.visibility)}
              showPublicWarning
            />
          )}
        </View>

        <LearningForm
          defaultValues={{ title: pok.title ?? '', content: pok.content }}
          onSubmit={handleUpdate}
          onCancel={() => { setEditing(false); setEditVisibility(pok.visibility); setServerError(null); }}
          submitLabel={t('learnings.edit.submitButton')}
          serverError={serverError}
        />
      </SafeAreaView>
    );
  }

  const assignedTagIds = new Set(pok.tags.map((t) => t.tagId));
  const availableTags = allTags.filter((tag) => !assignedTagIds.has(tag.tagId));
  const filteredTags = tagQuery
    ? availableTags.filter((tag) =>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        {pok.title && <Text variant="heading">{pok.title}</Text>}
        <MarkdownContent content={pok.content} />

        {/* Visibility badge */}
        <VisibilityBadge visibility={pok.visibility} />

        {/* Tags section */}
        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="label">{t('learnings.detail.tags')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {pok.tags.map((tag) => (
              <View
                key={tag.tagId}
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
                  onPress={() => handleRemoveTag(tag)}
                  disabled={tagActionLoading}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 4 }}
                >
                  <Text variant="caption" color={theme.colors.tagPillText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add tag button */}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={openTagModal}
              disabled={tagActionLoading}
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

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          {canRelearn ? (
            <Button
              label={hasRelearned ? t('relearnings.relearned') : t('relearnings.relearn')}
              variant="secondary"
              onPress={handleRelearn}
              disabled={hasRelearned}
              accessibilityRole="button"
              accessibilityLabel={hasRelearned ? t('relearnings.relearned') : t('relearnings.relearn')}
              style={{ flex: 1 }}
            />
          ) : (
            <>
              <Button
                label={t('learnings.detail.editButton')}
                variant="secondary"
                onPress={() => { setEditing(true); setEditVisibility(pok.visibility); }}
                style={{ flex: 1 }}
              />
              <Button
                label={t('learnings.detail.deleteButton')}
                variant="danger"
                onPress={handleDelete}
                style={{ flex: 1 }}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Re-learning modal */}
      {canRelearn && pok && (
        <ReLearningModal
          visible={reLearningModalVisible}
          originalPokId={pok.id}
          originalTitle={pok.title}
          originalContentPreview={pok.content}
          originalVisibility={pok.visibility}
          onSuccess={handleRelearnSuccess}
          onDismiss={() => setReLearningModalVisible(false)}
        />
      )}

      {/* Tag picker modal */}
      <Modal
        visible={tagModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeTagModal}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={closeTagModal}
        >
          <View style={{ flex: 1 }} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View onStartShouldSetResponder={() => true}>
              <View style={{
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: theme.radii.lg,
                borderTopRightRadius: theme.radii.lg,
                paddingTop: theme.spacing.md,
                maxHeight: 400,
              }}>
                <Text variant="label" style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
                  {t('learnings.detail.addTagTitle')}
                </Text>

                <RNTextInput
                  value={tagQuery}
                  onChangeText={(text) => setTagQuery(text.replace(/\s+/g, '-'))}
                  placeholder={t('learnings.detail.tagSearchPlaceholder')}
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    marginHorizontal: theme.spacing.md,
                    marginBottom: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    backgroundColor: theme.colors.inputBg,
                    borderWidth: 1,
                    borderColor: theme.colors.inputBorder,
                    borderRadius: theme.radii.sm,
                    color: theme.colors.text,
                    fontFamily: 'DMSans_400Regular',
                  }}
                />

                {tagActionLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} style={{ paddingVertical: theme.spacing.lg }} />
                ) : filteredTags.length === 0 && !showCreateRow ? (
                  <Text
                    variant="bodySm"
                    color={theme.colors.textSecondary}
                    style={{ padding: theme.spacing.md, textAlign: 'center' }}
                  >
                    {t('learnings.detail.noTagsAvailable')}
                  </Text>
                ) : (
                  <FlatList
                    data={filteredTags}
                    keyExtractor={(item) => item.tagId}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleAddTag(item)}
                        style={{
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: 10, /* sm(8) + 2: modal row vertical padding */
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.border,
                        }}
                      >
                        <Text variant="bodySm">{item.displayName}</Text>
                      </TouchableOpacity>
                    )}
                    ListFooterComponent={showCreateRow ? (
                      <TouchableOpacity
                        onPress={handleCreateTag}
                        style={{
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: 10, /* sm(8) + 2: modal row vertical padding */
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.border,
                        }}
                      >
                        <Text variant="bodySm" color={theme.colors.primary}>
                          {t('learnings.detail.tagCreateNew', { name: tagQuery })}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  />
                )}

                <View style={{ height: theme.spacing.xl }} />
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
