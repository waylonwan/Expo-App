import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { Button, Input, useAlert } from '@/src/components';
import { useAuth } from '@/src/contexts';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = useCallback(async () => {
    setError('');
    
    if (!phone.trim() || phone.trim().length !== 8 || !/^\d{8}$/.test(phone.trim())) {
      setError(t('auth.invalidPhone'));
      return;
    }
    if (!password.trim()) {
      setError(t('auth.invalidPassword'));
      return;
    }

    setIsLoading(true);
    const result = await login(phone.trim(), password);
    setIsLoading(false);

    if (result.success) {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } else {
      const errorMessage = result.error || t('auth.loginFailed');
      console.log('[LoginScreen] 登入失敗，錯誤訊息:', errorMessage);
      setError(errorMessage);
      showAlert(t('common.error'), errorMessage);
    }
  }, [phone, password, login, t, showAlert]);

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
            onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 8))}
            placeholder="12345678"
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={8}
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
