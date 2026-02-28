import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/AppStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { pokApi, type Pok } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import type { PokFormData } from '@/lib/validations';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LearningForm } from '@/components/feed/LearningForm';

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

  const loadPok = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pokApi.getById(pokId);
      setPok(data);
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
        <LearningForm
          defaultValues={{ title: pok.title ?? '', content: pok.content }}
          onSubmit={handleUpdate}
          onCancel={() => { setEditing(false); setServerError(null); }}
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
        <Text variant="body" style={{ lineHeight: 24 }}>{pok.content}</Text>

        {pok.tags.length > 0 && (
          <View style={{ gap: theme.spacing.xs }}>
            <Text variant="label">{t('learnings.detail.tags')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {pok.tags.map((tag) => (
                <View
                  key={tag.id}
                  style={{
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: theme.radii.full,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.xs,
                  }}
                >
                  <Text variant="bodySm">{tag.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <Button
            label={t('learnings.detail.editButton')}
            variant="secondary"
            onPress={() => setEditing(true)}
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
    </SafeAreaView>
  );
}
