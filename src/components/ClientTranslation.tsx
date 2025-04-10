'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClientTranslationProps {
  translationKey: string;
  className?: string;
}

export const ClientTranslation: React.FC<ClientTranslationProps> = ({ translationKey, className = '' }) => {
  const { t } = useTranslation();
  return <span className={className}>{t(translationKey)}</span>;
}; 