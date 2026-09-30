// Language Context for bilingual support
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Reusable alternative:
  // const [language, setLanguage] = useState(() => {
  //   const savedLang = localStorage.getItem('language');
  //   return savedLang || 'th';
  // });

  // Force default language to Thai
  const [language, setLanguage] = useState('th');

  // Update localStorage and html lang attribute when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'th' ? 'en' : 'th');
  };

  // Helper function to get text in current language
  const t = (textObj) => {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj;
    return textObj[language] || textObj.en || '';
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t, // translation helper
    isThailand: language === 'th',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
