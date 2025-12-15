import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Modal, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card, Button, LoadingOverlay } from '@/src/components';
import { useAuth, useLanguage } from '@/src/contexts';
import { SettingsPresenter, SettingsViewCallbacks } from '@/src/presenters';
import { SupportedLanguage } from '@/src/localization';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { member, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentLanguage, supportedLanguages } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState<SupportedLanguage>(currentLanguage);

  const callbacks: SettingsViewCallbacks = useMemo(() => ({
    showLoading: () => setIsLoading(true),
    hideLoading: () => setIsLoading(false),
    showError: (message: string) => {
      Alert.alert(t('common.error'), t(message) || message);
    },
    onLanguageChanged: (language: SupportedLanguage) => {
      setDisplayLanguage(language);
      setShowLanguageModal(false);
    },
    onNotificationToggled: (enabled: boolean) => {
      setNotificationsEnabled(enabled);
    },
    onLogoutSuccess: () => {
      router.replace('/(tabs)' as any);
    },
    showLogoutConfirmation: () => {
      // Web 平台使用 window.confirm
      if (Platform.OS === 'web') {
        const confirmed = window.confirm(t('auth.logoutConfirm'));
        if (confirmed) {
          (async () => {
            setIsLoading(true);
            await logout();
            setIsLoading(false);
            router.replace('/(tabs)' as any);
          })();
        }
        return;
      }
      
      // 原生平台使用 Alert.alert
      Alert.alert(
        t('auth.logout'),
        t('auth.logoutConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('auth.logout'),
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              await logout();
              setIsLoading(false);
              router.replace('/(tabs)' as any);
            },
          },
        ]
      );
    },
  }), [t, logout]);

  const presenter = useMemo(() => new SettingsPresenter(callbacks), [callbacks]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, authLoading]);

  const handleLogout = useCallback(() => {
    presenter.onLogoutTapped();
  }, [presenter]);

  const handleLanguageChange = useCallback(async (language: SupportedLanguage) => {
    await presenter.onChangeLanguage(language);
  }, [presenter]);

  const handleNotificationToggle = useCallback(async (enabled: boolean) => {
    await presenter.onToggleNotifications(enabled);
  }, [presenter]);

  const getLanguageLabel = (lang: SupportedLanguage) => {
    return t(`languages.${lang}`);
  };

  const renderSettingRow = (
    icon: string,
    title: string,
    value?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color="#6B7280" />
        </View>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
      </View>
      <View style={styles.settingRight}>
        {value && <ThemedText style={styles.settingValue}>{value}</ThemedText>}
        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>{t('settings.title')}</ThemedText>
      </View>

      {member && (
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{member.name}</ThemedText>
              <ThemedText style={styles.profileEmail}>{member.email}</ThemedText>
            </View>
          </View>
        </Card>
      )}

      <ThemedText style={styles.sectionTitle}>{t('settings.personalInfo')}</ThemedText>

      <Card style={styles.settingsCard}>
        {member?.phone && renderSettingRow(
          'call-outline',
          t('auth.phone'),
          member.phone
        )}
        
        {member?.phone && <View style={styles.divider} />}
        
        {member?.gender && renderSettingRow(
          'person-outline',
          t('settings.gender'),
          member.gender === 'male' ? t('settings.male') : member.gender === 'female' ? t('settings.female') : t('settings.other')
        )}
        
        {member?.gender && <View style={styles.divider} />}
        
        {member?.birthDate && renderSettingRow(
          'gift-outline',
          t('settings.birthday'),
          member.birthDate
        )}
        
        {member?.birthDate && <View style={styles.divider} />}
        
        {member?.email && renderSettingRow(
          'mail-outline',
          t('auth.email'),
          member.email
        )}
        
        {member?.email && <View style={styles.divider} />}
        
        {renderSettingRow(
          'calendar-outline',
          t('home.memberSince'),
          member?.joinDate ? new Date(member.joinDate).toLocaleDateString() : ''
        )}
      </Card>

      <ThemedText style={styles.sectionTitle}>{t('settings.settings')}</ThemedText>

      <Card style={styles.settingsCard}>
        {renderSettingRow(
          'language-outline',
          t('settings.language'),
          getLanguageLabel(displayLanguage),
          () => setShowLanguageModal(true)
        )}
        
        <View style={styles.divider} />
        
        {renderSettingRow(
          'notifications-outline',
          t('settings.notificationsEnabled'),
          undefined,
          undefined,
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#D1D5DB', true: '#FECACA' }}
            thumbColor={notificationsEnabled ? '#E31837' : '#F3F4F6'}
          />
        )}
      </Card>

      <ThemedText style={styles.sectionTitle}>{t('settings.about')}</ThemedText>

      <Card style={styles.settingsCard}>
        {renderSettingRow(
          'document-text-outline',
          t('settings.privacyPolicy'),
          undefined,
          () => {}
        )}
        
        <View style={styles.divider} />
        
        {renderSettingRow(
          'shield-checkmark-outline',
          t('settings.termsOfService'),
          undefined,
          () => {}
        )}
        
        <View style={styles.divider} />
        
        {renderSettingRow(
          'help-circle-outline',
          t('settings.help'),
          undefined,
          () => {}
        )}
        
        <View style={styles.divider} />
        
        {renderSettingRow(
          'information-circle-outline',
          t('settings.version'),
          '1.0.0'
        )}
      </Card>

      <Button
        title={t('auth.logout')}
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutButton}
      />

      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t('settings.selectLanguage')}</ThemedText>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {supportedLanguages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageOption,
                  displayLanguage === lang && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageChange(lang)}
              >
                <ThemedText style={[
                  styles.languageText,
                  displayLanguage === lang && styles.languageTextActive,
                ]}>
                  {getLanguageLabel(lang)}
                </ThemedText>
                {displayLanguage === lang && (
                  <Ionicons name="checkmark" size={24} color="#E31837" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={isLoading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E31837',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#111827',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  languageOptionActive: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  languageText: {
    fontSize: 16,
    color: '#374151',
  },
  languageTextActive: {
    color: '#E31837',
    fontWeight: '600',
  },
});
