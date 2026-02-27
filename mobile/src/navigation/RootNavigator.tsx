import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';

function LoadingScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

export function RootNavigator() {
  const { status } = useAuth();
  const { theme } = useTheme();

  const navTheme = {
    dark: theme.scheme === 'dark',
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
  };

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Suspense fallback={<LoadingScreen />}>
        {status === 'authenticated' ? <AppTabs /> : <AuthStack />}
      </Suspense>
    </NavigationContainer>
  );
}
