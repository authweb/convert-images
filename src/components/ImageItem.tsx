'use client';

import React from 'react';
import { FiTrash2, FiCheck, FiLoader } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { ImageSettings } from '../types';

interface ImageItemProps {
  file: File;
  selected?: boolean;
  isConverting?: boolean;
  settings: ImageSettings;
  convertedUrl?: string;
  onToggleSelect: () => void;
  onDelete: () => void;
}

export const ImageItem: React.FC<ImageItemProps> = ({
  file,
  selected = false,
  isConverting = false,
  settings,
  convertedUrl,
  onToggleSelect,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        selected ? 'bg-purple-500/10 border border-purple-500' : 'bg-[#1a1f2b] border border-transparent'
      } group cursor-pointer transition-colors`}
      onClick={onToggleSelect}
    >
      <div className="flex items-center gap-3">
        {selected && (
          <div className="bg-purple-500 rounded-full p-1">
            <FiCheck className="w-4 h-4 text-white" />
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-white">
            {file.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
            {isConverting && (
              <span className="text-xs text-purple-400 flex items-center gap-1">
                <FiLoader className="w-3 h-3 animate-spin" />
                {t('app.actions.converting')}
              </span>
            )}
            {convertedUrl && (
              <span className="text-xs text-green-400">
                → {settings.format.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title={t('app.images.delete')}
      >
        <FiTrash2 className="w-5 h-5" />
      </button>
    </div>
  );
};