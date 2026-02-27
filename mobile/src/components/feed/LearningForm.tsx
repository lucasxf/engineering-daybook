import React from 'react';
import { ScrollView, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { pokSchema, PokFormData } from '@/lib/validations';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface Props {
  defaultValues?: PokFormData;
  onSubmit: (data: PokFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  serverError?: string | null;
}

export function LearningForm({ defaultValues, onSubmit, onCancel, submitLabel, serverError }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PokFormData>({
    resolver: zodResolver(pokSchema),
    mode: 'onChange',
    defaultValues: defaultValues ?? { title: '', content: '' },
  });

  const contentValue = watch('content');
  const isContentEmpty = !contentValue || contentValue.trim().length === 0;

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      <ErrorMessage message={serverError} />

      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('learnings.new.titleLabel')}
            placeholder={t('learnings.new.titlePlaceholder')}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title ? t(errors.title.message as string) : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('learnings.new.contentLabel')}
            placeholder={t('learnings.new.contentPlaceholder')}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            style={{ minHeight: 160 }}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.content ? t(errors.content.message as string) : undefined}
          />
        )}
      />

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <Button
          label={t('learnings.new.cancelButton')}
          variant="secondary"
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          label={submitLabel}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isContentEmpty}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}
