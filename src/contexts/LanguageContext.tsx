import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, getTranslation, LanguageMeta } from '../i18n/index';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  currentMeta: LanguageMeta;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  languages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('roblearn_lang') as SupportedLanguage) || 'en';
  });

  const currentMeta = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem('roblearn_lang', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentMeta.dir || 'ltr';
  }, [currentLanguage, currentMeta]);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
  };

  const t = (key: string) => {
    return getTranslation(key, currentLanguage);
  };

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
