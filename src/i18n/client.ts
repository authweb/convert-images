'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Напрямую импортируем переводы
import ru from './locales/ru.json';
import en from './locales/en.json';

// Заполняем ресурсы напрямую
const resources = {
  en: { translation: en },
  ru: { translation: ru },
};

// Определяем, какой язык использовать
const getBrowserLanguage = (): string => {
  if (typeof window === 'undefined') return 'ru';
  
  try {
    // Пробуем получить язык из localStorage
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
      return savedLang;
    }
    
    // Иначе определяем язык браузера
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ru' ? 'ru' : 'en';
  } catch {
    // В случае ошибки используем русский
    return 'ru';
  }
};

// Проверяем, инициализирован ли уже i18n
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: getBrowserLanguage(),
      fallbackLng: 'ru',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n; 