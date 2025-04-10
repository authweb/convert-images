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

// Проверяем, инициализирован ли уже i18n
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'ru', // Используем русский по умолчанию на сервере
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