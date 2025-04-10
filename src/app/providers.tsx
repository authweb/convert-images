'use client';

import React, { ReactNode, useEffect } from 'react';
import '../i18n/client';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/client';

export function Providers({ children }: { children: ReactNode }) {
  // Эффект для инициализации i18n на клиенте
  useEffect(() => {
    // Проверяем сохраненный язык
    try {
      const savedLang = localStorage.getItem('i18nextLng');
      if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
        i18n.changeLanguage(savedLang).catch(console.error);
      }
    } catch (e) {
      console.error('Failed to load language preference', e);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 