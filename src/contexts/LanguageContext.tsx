import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, getTranslation, LanguageMeta } from '../i18n/index';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  currentMeta: LanguageMeta;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  languages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const isSupportedLanguage = (value: string | null): value is SupportedLanguage =>
  !!value && SUPPORTED_LANGUAGES.some((language) => language.code === value);

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('roblearn_lang');
  return isSupportedLanguage(stored) ? stored : 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const currentMeta = SUPPORTED_LANGUAGES.find((language) => language.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('roblearn_lang', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentMeta.dir || 'ltr';
  }, [currentLanguage, currentMeta]);

  // A signed-in user's saved language is the source of truth across refreshes/devices.
  useEffect(() => {
    const savedLanguage = user?.preferredLanguage;
    if (isSupportedLanguage(savedLanguage) && savedLanguage !== currentLanguage) {
      setCurrentLanguageState(savedLanguage);
    }
  }, [user?.preferredLanguage, currentLanguage]);

  const setLanguage = (lang: SupportedLanguage) => {
    if (!isSupportedLanguage(lang) || lang === currentLanguage) return;
    setCurrentLanguageState(lang);
    if (user) {
      void updateProfile({ preferredLanguage: lang }).catch(() => {
        // Keep the local selection even when persistence is temporarily unavailable.
      });
    }
  };

  const t = (key: string) => getTranslation(key, currentLanguage);

  return (
    <LanguageContext.Provider value={{ currentLanguage, currentMeta, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}