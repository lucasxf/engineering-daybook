import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
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
import { pokApi, type Pok, type PokVisibility } from '@/lib/pokApi';
import { tagApi, type Tag } from '@/lib/tagApi';
import { ApiRequestError } from '@/lib/api';
import type { PokFormData } from '@/lib/validations';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LearningForm } from '@/components/feed/LearningForm';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

type RouteProps = RouteProp<AppStackParamList, 'LearningDetail'>;

export function LearningDetailScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProps>();
  const { pokId } = route.params;

  const [pok, setPok] = useState<Pok | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editVisibility, setEditVisibility] = useState<PokVisibility>('PRIVATE');

  // Tag management
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [tagActionLoading, setTagActionLoading] = useState(false);

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

  async function openTagModal() {
    try {
      const tags = await tagApi.list();
      setAllTags(tags);
    } catch {
      setAllTags([]);
    }
    setTagModalVisible(true);
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
      setTagModalVisible(false);
    } catch {
      Alert.alert(t('learnings.detail.tagAddError'));
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

        {pok.visibility === 'PRIVATE' && (
          <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, gap: theme.spacing.xs }}>
            <Text variant="label">{t('learnings.visibility.pickerLabel')}</Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: editVisibility === 'PRIVATE' }}
                onPress={() => setEditVisibility('PRIVATE')}
                style={{
                  flex: 1,
                  padding: theme.spacing.sm,
                  borderRadius: theme.radii.md,
                  borderWidth: 1,
                  borderColor: editVisibility === 'PRIVATE' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: editVisibility === 'PRIVATE' ? theme.colors.surfaceAlt : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text variant="bodySm">🔒 {t('learnings.visibility.private')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: editVisibility === 'PUBLIC' }}
                onPress={() => setEditVisibility('PUBLIC')}
                style={{
                  flex: 1,
                  padding: theme.spacing.sm,
                  borderRadius: theme.radii.md,
                  borderWidth: 1,
                  borderColor: editVisibility === 'PUBLIC' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: editVisibility === 'PUBLIC' ? theme.colors.surfaceAlt : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text variant="bodySm">🌐 {t('learnings.visibility.public')}</Text>
              </TouchableOpacity>
            </View>
            {editVisibility === 'PUBLIC' && (
              <Text variant="bodySm" style={{ color: theme.colors.warning }}>
                {t('learnings.visibility.publicWarning')}
              </Text>
            )}
          </View>
        )}

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        {pok.title && <Text variant="heading">{pok.title}</Text>}
        <MarkdownContent content={pok.content} />

        {/* Visibility badge */}
        <Text variant="bodySm" style={{ color: theme.colors.textSecondary }}>
          {pok.visibility === 'PUBLIC'
            ? `🌐 ${t('learnings.visibility.public')}`
            : `🔒 ${t('learnings.visibility.private')}`}
        </Text>

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
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radii.full,
                  paddingLeft: theme.spacing.md,
                  paddingRight: theme.spacing.xs,
                  paddingVertical: theme.spacing.xs,
                  gap: theme.spacing.xs,
                }}
              >
                <Text variant="bodySm">{tag.displayName}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Remove tag ${tag.displayName}`}
                  onPress={() => handleRemoveTag(tag)}
                  disabled={tagActionLoading}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 4 }}
                >
                  <Text variant="bodySm" color={theme.colors.textSecondary}>✕</Text>
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
              <Text variant="bodySm" color={theme.colors.textSecondary}>+ {t('learnings.detail.addTag')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
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
        </View>
      </ScrollView>

      {/* Tag picker modal */}
      <Modal
        visible={tagModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTagModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setTagModalVisible(false)}
        >
          <View style={{ flex: 1 }} />
          <TouchableOpacity activeOpacity={1}>
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

              {tagActionLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ paddingVertical: theme.spacing.lg }} />
              ) : availableTags.length === 0 ? (
                <Text
                  variant="bodySm"
                  color={theme.colors.textSecondary}
                  style={{ padding: theme.spacing.md, textAlign: 'center' }}
                >
                  {t('learnings.detail.noTagsAvailable')}
                </Text>
              ) : (
                <FlatList
                  data={availableTags}
                  keyExtractor={(item) => item.tagId}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleAddTag(item)}
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm + 2,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                      }}
                    >
                      <Text variant="bodySm">{item.displayName}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              <View style={{ height: theme.spacing.xl }} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
