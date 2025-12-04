import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { Button, Input, LoadingOverlay } from '@/src/components';
import { useAuth } from '@/src/contexts';
import { AuthPresenter, AuthViewCallbacks } from '@/src/presenters';
import { Member } from '@/src/models';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
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
    
    if (!email.trim()) {
      setError(t('auth.invalidEmail'));
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError(t('auth.invalidPassword'));
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || t('auth.loginFailed'));
      Alert.alert(t('common.error'), result.error || t('auth.loginFailed'));
    }
  }, [email, password, login, t]);

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
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={error && !email.trim() ? t('auth.invalidEmail') : undefined}
          />

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="******"
            isPassword
            error={error && (!password.trim() || password.length < 6) ? t('auth.invalidPassword') : undefined}
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

      <LoadingOverlay visible={isLoading} />
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
