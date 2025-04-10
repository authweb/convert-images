import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const LANGUAGE_KEY = 'image-converter-language';

// Базовая конфигурация i18next
const i18nConfig = {
  fallbackLng: 'ru', // Используем русский как язык по умолчанию
  supportedLngs: ['en', 'ru'],
  
  detection: {
    order: ['localStorage', 'navigator'],
    lookupLocalStorage: LANGUAGE_KEY,
    caches: ['localStorage'],
  },

  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  interpolation: {
    escapeValue: false
  },

  // Отключаем Suspense для предотвращения проблем с гидрацией
  react: {
    useSuspense: false
  }
};

// Инициализация только на клиенте
if (typeof window !== 'undefined') {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig);
} else {
  // Базовая инициализация для сервера
  i18n
    .use(initReactI18next)
    .init({
      ...i18nConfig,
      lng: 'ru' // Используем русский как язык по умолчанию на сервере
    });
}

export default i18n; 