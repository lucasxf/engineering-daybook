import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/AppStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { ReLearningModal } from '@/components/relearnings/ReLearningModal';
import { TagPickerModal } from '@/components/tags/TagPickerModal';
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

const TAG_COLLAPSE_LIMIT = 3;

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
  const [tagListLoading, setTagListLoading] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);

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

  // Prefetch tag list after POK loads (once, cached in allTags state)
  useEffect(() => {
    if (!pok || allTags.length > 0) return;
    setTagListLoading(true);
    tagApi.list()
      .then(setAllTags)
      .catch(() => {})
      .finally(() => setTagListLoading(false));
  }, [pok]);

  async function refreshTagList() {
    try {
      const tags = await tagApi.list();
      setAllTags(tags);
    } catch {
      // best effort
    }
  }

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
  }

  function openTagModal() {
    setTagModalVisible(true);
    if (allTags.length > 0) return; // already cached from prefetch
    setTagListLoading(true);
    tagApi.list()
      .then(setAllTags)
      .catch(() => {
        Alert.alert(
          t('learnings.detail.tagListLoadErrorTitle'),
          t('learnings.detail.tagListLoadErrorMessage'),
          [
            { text: t('common.retry'), onPress: openTagModal },
            { text: t('common.cancel'), style: 'cancel' },
          ]
        );
      })
      .finally(() => setTagListLoading(false));
  }

  async function handleAddTag(tag: Tag) {
    if (!pok) return;
    setTagActionLoading(true);
    try {
      await tagApi.assign(pok.id, tag.id);
      setPok((prev) => prev
        ? { ...prev, tags: [...prev.tags, tag] }
        : prev
      );
      closeTagModal();
    } catch {
      Alert.alert(t('learnings.detail.tagAddError'));
      loadPok(); // reconcile UI with server truth
    } finally {
      setTagActionLoading(false);
    }
  }

  async function handleCreateTag(name: string) {
    if (!pok || !name.trim()) return;
    setTagActionLoading(true);
    try {
      // Step 1: create — show a create-specific error if this fails
      const newTag = await tagApi.create({ name }).catch(() => {
        Alert.alert(t('learnings.detail.tagCreateError'));
        return null;
      });
      if (!newTag) return;
      // Step 2: assign — tag now exists; show an assign-specific error if this fails
      await tagApi.assign(pok.id, newTag.id);
      setPok((prev) => prev
        ? { ...prev, tags: [...prev.tags, newTag] }
        : prev
      );
      closeTagModal();
      refreshTagList(); // update pokCount in background
    } catch {
      Alert.alert(t('learnings.detail.tagAddError'));
      loadPok(); // reconcile UI with server truth
    } finally {
      setTagActionLoading(false);
    }
  }

  async function handleRemoveTag(tag: Tag) {
    if (!pok) return;
    setTagActionLoading(true);
    try {
      await tagApi.remove(pok.id, tag.id);
      setPok((prev) => prev
        ? { ...prev, tags: prev.tags.filter((existing) => existing.id !== tag.id) }
        : prev
      );
      refreshTagList(); // update pokCount in background
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
          {(() => {
            const sortedTags = [...pok.tags].sort((a, b) => (b.pokCount ?? 0) - (a.pokCount ?? 0));
            const visibleTags = tagsExpanded ? sortedTags : sortedTags.slice(0, TAG_COLLAPSE_LIMIT);
            const hasOverflow = sortedTags.length > TAG_COLLAPSE_LIMIT;
            return (
              <>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                  {visibleTags.map((tag) => (
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

                {/* Collapse / expand toggle */}
                {hasOverflow && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => setTagsExpanded(prev => !prev)}
                  >
                    <Text variant="caption" color={theme.colors.primary}>
                      {tagsExpanded
                        ? t('learnings.detail.showLessTags')
                        : t('learnings.detail.showAllTags', { count: String(sortedTags.length) })}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            );
          })()}
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
      <TagPickerModal
        visible={tagModalVisible}
        selectedTagIds={pok.tags.map((tag) => tag.tagId)}
        onClose={closeTagModal}
        onSelect={handleAddTag}
        onCreate={handleCreateTag}
        allTags={allTags}
        listLoading={tagListLoading}
        actionLoading={tagActionLoading}
      />
    </SafeAreaView>
  );
}
