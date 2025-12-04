import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SupportedLanguage, 
  changeLanguage as changeI18nLanguage, 
  getSavedLanguage,
  getDeviceLanguage,
  supportedLanguages,
} from '../localization';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    (i18n.language as SupportedLanguage) || 'zh-HK'
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initLanguage = async () => {
      const savedLanguage = await getSavedLanguage();
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      } else {
        setCurrentLanguage(getDeviceLanguage());
      }
    };
    initLanguage();
  }, []);

  useEffect(() => {
    setCurrentLanguage(i18n.language as SupportedLanguage);
  }, [i18n.language]);

  const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
    try {
      setIsLoading(true);
      await changeI18nLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    supportedLanguages,
    changeLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
