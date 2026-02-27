import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { loginApi } from '@/lib/auth';
import { ApiRequestError } from '@/lib/api';
import { loginSchema, LoginFormData } from '@/lib/validations';
import type { AuthStackParamList } from '@/navigation/AuthStack';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Text } from '@/components/ui/Text';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { setUser } = useAuth();
  const nav = useNavigation<Nav>();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      const user = await loginApi(data);
      setUser(user);
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setServerError(e.status === 401 ? t('auth.errors.loginFailed') : e.message);
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
            <Text variant="title">{t('auth.login.title')}</Text>
            <Text variant="bodySm">{t('auth.login.subtitle')}</Text>
          </View>

          <ErrorMessage message={serverError} />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.login.emailLabel')}
                placeholder={t('auth.login.emailPlaceholder')}
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.login.passwordLabel')}
                secureTextEntry
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password ? t(errors.password.message as string) : undefined}
              />
            )}
          />

          <Button
            label={t('auth.login.submitButton')}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            fullWidth
          />

          <Button
            label={t('auth.login.forgotPassword')}
            variant="ghost"
            onPress={() => nav.navigate('ForgotPassword')}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs }}>
            <Text variant="bodySm">{t('auth.login.noAccount')}</Text>
            <Text
              variant="bodySm"
              color={theme.colors.primary}
              onPress={() => nav.navigate('Register')}
            >
              {t('auth.login.signUp')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
