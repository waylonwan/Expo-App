import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { I18nextProvider } from 'react-i18next';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, LanguageProvider } from '@/src/contexts';
import { initializeI18n } from '@/src/localization';
import i18n from '@/src/localization/i18n';
import { AlertProvider } from '@/src/components';

function NavigationHandler() {
  // 導航邏輯已移至各個頁面自行處理
  // 登入成功後由 login.tsx 負責導航
  // 這裡不再做自動導航，避免競態條件導致的意外跳轉
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
