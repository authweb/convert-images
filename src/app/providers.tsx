'use client';

import { PropsWithChildren, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    // Принудительно обновляем компонент после гидратации
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 