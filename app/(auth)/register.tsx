import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Modal } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { Button, Input, LoadingOverlay, useAlert } from '@/src/components';
import { useAuth } from '@/src/contexts';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<'1' | '2' | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const [selectedYear, setSelectedYear] = useState(1990);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('auth.name');
    }

    if (!phone.trim() || phone.trim().length !== 8 || !/^\d{8}$/.test(phone.trim())) {
      newErrors.phone = t('auth.invalidPhone');
    }

    if (!birthday.trim()) {
      newErrors.birthday = t('auth.invalidBirthday');
    }

    if (!gender) {
      newErrors.gender = t('auth.invalidGender');
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = t('auth.invalidEmail');
      }
    }

    if (!password || password.length < 6) {
      newErrors.password = t('auth.invalidPassword');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, phone, birthday, gender, password, confirmPassword, t]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const result = await register(
      phone.trim(),
      password,
      name.trim(),
      birthday,
      gender as '1' | '2',
      email.trim() || undefined
    );
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      showAlert(t('common.notice'), result.error || t('auth.registerFailed'));
    }
  }, [validateForm, phone, password, name, birthday, gender, email, register, t, showAlert]);

  const handleDateConfirm = () => {
    const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    setBirthday(formattedDate);
    setShowDatePicker(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${year}/${month}/${day}`;
  };

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
          <ThemedText style={styles.subtitle}>{t('auth.register')}</ThemedText>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('auth.name')}
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label={t('auth.phone')}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 8))}
            placeholder="12345678"
            keyboardType="number-pad"
            maxLength={8}
            error={errors.phone}
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <View pointerEvents="none">
              <Input
                label={t('auth.birthday')}
                value={formatDisplayDate(birthday)}
                onChangeText={() => {}}
                placeholder="YYYY/MM/DD"
                error={errors.birthday}
                editable={false}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.genderContainer}>
            <ThemedText style={styles.genderLabel}>{t('auth.gender')}</ThemedText>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === '1' && styles.genderOptionSelected,
                ]}
                onPress={() => setGender('1')}
              >
                <ThemedText
                  style={[
                    styles.genderOptionText,
                    gender === '1' && styles.genderOptionTextSelected,
                  ]}
                >
                  {t('settings.male')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === '2' && styles.genderOptionSelected,
                ]}
                onPress={() => setGender('2')}
              >
                <ThemedText
                  style={[
                    styles.genderOptionText,
                    gender === '2' && styles.genderOptionTextSelected,
                  ]}
                >
                  {t('settings.female')}
                </ThemedText>
              </TouchableOpacity>
            </View>
            {errors.gender ? (
              <ThemedText style={styles.errorText}>{errors.gender}</ThemedText>
            ) : null}
          </View>

          <Input
            label={t('auth.emailOptional')}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="******"
            isPassword
            error={errors.password}
          />

          <Input
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="******"
            isPassword
            error={errors.confirmPassword}
          />

          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.registerButton}
            size="large"
          />

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>{t('auth.hasAccount')}</ThemedText>
            <Link href="/(auth)/login" asChild>
              <ThemedText style={styles.linkText}>{t('auth.login')}</ThemedText>
            </Link>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <ThemedText style={styles.datePickerTitle}>{t('auth.birthday')}</ThemedText>
            
            <View style={styles.datePickerRow}>
              <View style={styles.datePickerColumn}>
                <ThemedText style={styles.datePickerLabel}>Year</ThemedText>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      style={[
                        styles.datePickerItem,
                        selectedYear === year && styles.datePickerItemSelected,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.datePickerItemText,
                          selectedYear === year && styles.datePickerItemTextSelected,
                        ]}
                      >
                        {year}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerColumn}>
                <ThemedText style={styles.datePickerLabel}>Month</ThemedText>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month}
                      onPress={() => setSelectedMonth(month)}
                      style={[
                        styles.datePickerItem,
                        selectedMonth === month && styles.datePickerItemSelected,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.datePickerItemText,
                          selectedMonth === month && styles.datePickerItemTextSelected,
                        ]}
                      >
                        {month}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerColumn}>
                <ThemedText style={styles.datePickerLabel}>Day</ThemedText>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      style={[
                        styles.datePickerItem,
                        selectedDay === day && styles.datePickerItemSelected,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.datePickerItemText,
                          selectedDay === day && styles.datePickerItemTextSelected,
                        ]}
                      >
                        {day}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.datePickerCancelButton}
              >
                <ThemedText style={styles.datePickerCancelText}>{t('common.cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDateConfirm}
                style={styles.datePickerConfirmButton}
              >
                <ThemedText style={styles.datePickerConfirmText}>{t('common.confirm')}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    marginBottom: 32,
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
  registerButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 360,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  datePickerScroll: {
    height: 150,
    width: '100%',
  },
  datePickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  datePickerItemSelected: {
    backgroundColor: '#E31837',
    borderRadius: 8,
  },
  datePickerItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  datePickerItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  datePickerCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderOptionSelected: {
    borderColor: '#E31837',
    backgroundColor: '#FEF2F2',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#6B7280',
  },
  genderOptionTextSelected: {
    color: '#E31837',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E31837',
    alignItems: 'center',
  },
  datePickerConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
