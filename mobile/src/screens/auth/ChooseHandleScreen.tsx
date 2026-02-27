import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { completeGoogleSignupApi } from '@/lib/auth';
import { ApiRequestError } from '@/lib/api';
import { chooseHandleSchema, ChooseHandleFormData } from '@/lib/validations';
import type { AuthStackParamList } from '@/navigation/AuthStack';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Text } from '@/components/ui/Text';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type RouteProps = RouteProp<AuthStackParamList, 'ChooseHandle'>;

export function ChooseHandleScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { setUser } = useAuth();
  const route = useRoute<RouteProps>();
  const { tempToken } = route.params;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChooseHandleFormData>({
    resolver: zodResolver(chooseHandleSchema),
    defaultValues: { handle: '', displayName: '' },
  });

  async function onSubmit(data: ChooseHandleFormData) {
    setServerError(null);
    try {
      const user = await completeGoogleSignupApi({
        tempToken,
        handle: data.handle,
        displayName: data.displayName,
      });
      setUser(user);
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setServerError(e.message);
      } else {
        setServerError(t('common.error'));
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: theme.spacing.xs }}>
            <Text variant="title">{t('auth.chooseHandle.title')}</Text>
            <Text variant="bodySm">{t('auth.chooseHandle.subtitle')}</Text>
          </View>

          <ErrorMessage message={serverError} />

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.chooseHandle.displayNameLabel')}
                placeholder={t('auth.chooseHandle.displayNamePlaceholder')}
                autoComplete="name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.displayName ? t(errors.displayName.message as string) : undefined}
              />
            )}
          />

          <Controller
            control={control}
            name="handle"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.chooseHandle.handleLabel')}
                placeholder={t('auth.chooseHandle.handlePlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={(v) => onChange(v.toLowerCase())}
                onBlur={onBlur}
                error={errors.handle ? t(errors.handle.message as string) : undefined}
              />
            )}
          />

          <Button
            label={t('auth.chooseHandle.submitButton')}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
