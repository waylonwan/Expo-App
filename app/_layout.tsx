import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { I18nextProvider } from 'react-i18next';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth, LanguageProvider } from '@/src/contexts';
import { initializeI18n } from '@/src/localization';
import i18n from '@/src/localization/i18n';
import { AlertProvider } from '@/src/components';

function NavigationHandler() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const lastAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    if (!navigationState?.key) return;

    // 如果正在 loading，不做任何導航
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    // 只有當 isAuthenticated 從 false 變為 true 時才跳轉
    // 這確保只有成功登入後才會導航，失敗時不會
    const wasAuthenticated = lastAuthState.current;
    const justLoggedIn = isAuthenticated && wasAuthenticated === false;

    if (justLoggedIn && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }

    // 更新上一次的認證狀態
    lastAuthState.current = isAuthenticated;
  }, [isAuthenticated, segments, navigationState?.key, isLoading]);

  return null;
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [i18nReady, setI18nReady] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    initializeI18n().then(() => setI18nReady(true));
  }, []);

  if (!fontsLoaded || !i18nReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E31837" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <LanguageProvider>
            <AlertProvider>
              <NavigationHandler />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </AlertProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutContent />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
