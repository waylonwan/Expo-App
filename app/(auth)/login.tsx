import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { Button, Input } from '@/src/components';
import { useAuth } from '@/src/contexts';
import { AuthPresenter, AuthViewCallbacks } from '@/src/presenters';
import { Member } from '@/src/models';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const callbacks: AuthViewCallbacks = {
    showLoading: () => setIsLoading(true),
    hideLoading: () => setIsLoading(false),
    showError: (message: string) => {
      setError(t(message) || message);
      Alert.alert(t('common.error'), t(message) || message);
    },
    onLoginSuccess: (member: Member) => {
      router.replace('/(tabs)');
    },
    onRegisterSuccess: () => {},
    onLogoutSuccess: () => {},
  };

  const handleLogin = useCallback(async () => {
    setError('');
    
    if (!phone.trim()) {
      setError(t('auth.invalidPhone'));
      return;
    }
    if (!password.trim()) {
      setError(t('auth.invalidPassword'));
      return;
    }

    setIsLoading(true);
    const result = await login(phone.trim(), password);
    
    // 先關閉 loading，等待 React 更新後再導航
    setIsLoading(false);

    if (result.success) {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } else {
      const errorMessage = result.error || t('auth.loginFailed');
      console.log('[LoginScreen] 登入失敗，錯誤訊息:', errorMessage);
      setError(errorMessage);
      Alert.alert(t('common.error'), errorMessage);
    }
  }, [phone, password, login, t]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/baleno-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <ThemedText style={styles.subtitle}>{t('auth.login')}</ThemedText>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.phone')}
            value={phone}
            onChangeText={setPhone}
            placeholder="+852 0000 0000"
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            error={error && !phone.trim() ? t('auth.invalidPhone') : undefined}
          />

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="******"
            isPassword
            error={error && !password.trim() ? t('auth.invalidPassword') : undefined}
          />

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            size="large"
          />

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>{t('auth.noAccount')}</ThemedText>
            <Link href="/(auth)/register" asChild>
              <ThemedText style={styles.linkText}>{t('auth.register')}</ThemedText>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 180,
    height: 60,
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  loginButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: '#6B7280',
  },
  linkText: {
    color: '#E31837',
    fontWeight: '600',
  },
});
