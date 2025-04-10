import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(newLang).catch(console.error);
  }, [i18n]);

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 text-sm font-medium transition-all border border-purple-500/30 hover:border-purple-500/40"
      aria-label={i18n.language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
    >
      {i18n.language === 'ru' ? 'English' : 'Русский'}
    </button>
  );
}; 