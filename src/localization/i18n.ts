import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './translations/en';
import zhHK from './translations/zh-HK';
import zhCN from './translations/zh-CN';

const LANGUAGE_STORAGE_KEY = 'baleno_app_language';

export type SupportedLanguage = 'zh-HK' | 'zh-CN' | 'en';

const resources = {
  'en': { translation: en },
  'zh-HK': { translation: zhHK },
  'zh-CN': { translation: zhCN },
};

export const supportedLanguages: SupportedLanguage[] = ['zh-HK', 'zh-CN', 'en'];

export const getDeviceLanguage = (): SupportedLanguage => {
  const deviceLocale = Localization.getLocales()[0]?.languageTag || 'zh-HK';
  
  if (deviceLocale.startsWith('zh-Hant') || deviceLocale === 'zh-HK' || deviceLocale === 'zh-TW') {
    return 'zh-HK';
  }
  if (deviceLocale.startsWith('zh-Hans') || deviceLocale === 'zh-CN' || deviceLocale === 'zh') {
    return 'zh-CN';
  }
  if (deviceLocale.startsWith('en')) {
    return 'en';
  }
  
  return 'zh-HK';
};

export const getSavedLanguage = async (): Promise<SupportedLanguage | null> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && supportedLanguages.includes(savedLanguage as SupportedLanguage)) {
      return savedLanguage as SupportedLanguage;
    }
  } catch (error) {
    console.error('Error getting saved language:', error);
  }
  return null;
};

export const saveLanguage = async (language: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export const initializeI18n = async (): Promise<void> => {
  const savedLanguage = await getSavedLanguage();
  const initialLanguage = savedLanguage || getDeviceLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'zh-HK',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  await saveLanguage(language);
  await i18n.changeLanguage(language);
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage;
};

export default i18n;
