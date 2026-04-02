import React, { useCallback, useEffect } from 'react';
import ErrorBoundary from 'react-native-error-boundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { Sora_600SemiBold } from '@expo-google-fonts/sora';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { I18nProvider, useI18n } from '@/contexts/I18nContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import type { Locale } from '@/i18n/i18n';

void SplashScreen.preventAutoHideAsync().catch(() => {});

type ColorSchemeOverride = 'light' | 'dark' | 'system';

const VALID_THEMES: ColorSchemeOverride[] = ['light', 'dark', 'system'];

function AppContent() {
  const { theme, setOverride } = useTheme();
  const { setAppLocale } = useI18n();

  const handleSettingsRestored = useCallback(
    (savedTheme: string | null, savedLocale: string | null) => {
      if (savedTheme && (VALID_THEMES as string[]).includes(savedTheme)) {
        setOverride(savedTheme as ColorSchemeOverride);
      }
      if (savedLocale) {
        const locale: Locale = savedLocale.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
        setAppLocale(locale);
      }
    },
    [setOverride, setAppLocale],
  );

  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <AuthProvider onSettingsRestored={handleSettingsRestored}>
        <RootNavigator />
      </AuthProvider>
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    Sora_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <I18nProvider>
              <AppContent />
            </I18nProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
