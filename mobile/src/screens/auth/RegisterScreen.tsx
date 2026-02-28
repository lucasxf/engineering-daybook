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
import { registerApi } from '@/lib/auth';
import { ApiRequestError } from '@/lib/api';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import type { AuthStackParamList } from '@/navigation/AuthStack';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Text } from '@/components/ui/Text';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { setUser } = useAuth();
  const nav = useNavigation<Nav>();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', displayName: '', handle: '' },
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    try {
      const user = await registerApi({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        handle: data.handle,
      });
      setUser(user);
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setServerError(e.message);
      } else {
        setServerError(t('auth.errors.registerFailed'));
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
            <Text variant="title">{t('auth.register.title')}</Text>
            <Text variant="bodySm">{t('auth.register.subtitle')}</Text>
          </View>

          <ErrorMessage message={serverError} />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.register.emailLabel')}
                placeholder={t('auth.register.emailPlaceholder')}
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
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.register.displayNameLabel')}
                placeholder={t('auth.register.displayNamePlaceholder')}
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
                label={t('auth.register.handleLabel')}
                placeholder={t('auth.register.handlePlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={(v) => onChange(v.toLowerCase())}
                onBlur={onBlur}
                error={errors.handle ? t(errors.handle.message as string) : undefined}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.register.passwordLabel')}
                secureTextEntry
                autoComplete="new-password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password ? t(errors.password.message as string) : undefined}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.register.confirmPasswordLabel')}
                secureTextEntry
                autoComplete="new-password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword ? t(errors.confirmPassword.message as string) : undefined}
              />
            )}
          />

          <Button
            label={t('auth.register.submitButton')}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            fullWidth
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs }}>
            <Text variant="bodySm">{t('auth.register.haveAccount')}</Text>
            <Text
              variant="bodySm"
              color={theme.colors.primary}
              onPress={() => nav.navigate('Login')}
            >
              {t('auth.register.signIn')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
