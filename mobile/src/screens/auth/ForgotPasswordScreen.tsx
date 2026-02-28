import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { requestPasswordResetApi } from '@/lib/auth';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations';
import type { AuthStackParamList } from '@/navigation/AuthStack';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Text } from '@/components/ui/Text';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<Nav>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await requestPasswordResetApi(data.email);
      setSuccessMessage(t('auth.forgotPassword.successMessage'));
    } catch {
      setServerError(t('common.error'));
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
            <Text variant="title">{t('auth.forgotPassword.title')}</Text>
            <Text variant="bodySm">{t('auth.forgotPassword.subtitle')}</Text>
          </View>

          <ErrorMessage message={serverError} />

          {successMessage && (
            <View style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.radii.md }}>
              <Text variant="bodySm" color={theme.colors.success}>{successMessage}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.forgotPassword.emailLabel')}
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email ? t(errors.email.message as string) : undefined}
              />
            )}
          />

          <Button
            label={t('auth.forgotPassword.submitButton')}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            fullWidth
          />

          <Button
            label={t('auth.forgotPassword.backToLogin')}
            variant="ghost"
            onPress={() => nav.navigate('Login')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
