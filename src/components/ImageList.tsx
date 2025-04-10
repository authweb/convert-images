'use client';

import React, { useState, useCallback, useRef, ChangeEvent, useEffect } from 'react';
import { ImageItem } from './ImageItem';
import { DownloadPanel } from './DownloadPanel';
import { NotificationContainer, NotificationItem } from './NotificationContainer';
import { convertImage } from '../utils/imageConverter';
import { ImageSettings, Image, ConvertProgress } from '../types';
import { FiCheck, FiPlus, FiTrash, FiDownload, FiLoader, FiUpload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

interface ImageWithCrop extends Omit<Image, 'settings'> {
  settings: ImageSettings;
  convertedUrl?: string;
  selected?: boolean;
  progress?: ConvertProgress;
  error?: string;
}

const defaultSettings: ImageSettings = {
  format: 'jpeg',
  quality: 85,
  maintainAspectRatio: true,
};

export const ImageList: React.FC = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageWithCrop[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<ImageSettings>(defaultSettings);
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addNotification = useCallback((type: NotificationItem['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      settings: { ...defaultSettings },
      selected: false,
    }));
    setImages((prev) => [...prev, ...newImages]);
    addNotification('success', t('app.notifications.added', { count: files.length }));
  }, [addNotification, t]);

  const handleFileSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  }, [handleFiles]);

  useEffect(() => {
    const handleWindowDragEnter = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleWindowDragLeave = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = document.documentElement.getBoundingClientRect();
      const dragEvent = e as DragEvent;
      if (
        dragEvent.clientX <= rect.left ||
        dragEvent.clientX >= rect.right ||
        dragEvent.clientY <= rect.top ||
        dragEvent.clientY >= rect.bottom
      ) {
        setIsDragging(false);
      }
    };

    const handleWindowDragOver = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleWindowDrop = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const dragEvent = e as DragEvent;
      const files = Array.from(dragEvent.dataTransfer?.files || [])
        .filter(file => file.type.startsWith('image/'));
      
      if (files.length > 0) {
        handleFiles(files);
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [handleFiles]);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
    addNotification('info', t('app.notifications.deleted'));
  }, [addNotification, t]);

  const handleRemoveAll = useCallback(() => {
    setImages((prev) => {
      prev.forEach((image) => {
        URL.revokeObjectURL(image.preview);
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      });
      return [];
    });
    addNotification('info', t('app.notifications.allDeleted'));
  }, [addNotification, t]);

  const handleConvert = useCallback(async (id: string) => {
    const image = images.find(img => img.id === id);
    if (!image) return;

    setIsConverting(prev => ({ ...prev, [id]: true }));
    try {
      const convertedUrl = await convertImage(image.file, {
        ...settings,
        onProgress: (progress) => {
          setImages(prev => prev.map(img => 
            img.id === id ? { ...img, progress } : img
          ));
        }
      });
      setImages(prev => prev.map(img => 
        img.id === id ? { 
          ...img, 
          convertedUrl,
          settings: { ...settings },
          progress: undefined,
          error: undefined
        } : img
      ));
      addNotification('success', t('app.notifications.converted', { name: image.file.name }));
    } catch (error) {
      setImages(prev => prev.map(img => 
        img.id === id ? { 
          ...img, 
          error: error instanceof Error ? error.message : t('app.notifications.conversionError', { name: image.file.name }),
          progress: undefined
        } : img
      ));
      addNotification('error', t('app.notifications.conversionError', { name: image.file.name }));
    } finally {
      setIsConverting(prev => ({ ...prev, [id]: false }));
    }
  }, [images, settings, addNotification, t]);

  const handleToggleSelect = useCallback((id: string) => {
    if (id === '') {
      // Clear all selections
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          selected: false,
        }))
      );
      return;
    }

    if (id === 'all') {
      // Select all images
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          selected: true,
        }))
      );
      return;
    }

    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, selected: !img.selected }
          : img
      )
    );
  }, []);

  const handleConvertAll = useCallback(async () => {
    const selectedImages = images.filter(img => img.selected);
    const imagesToConvert = selectedImages.length > 0 ? selectedImages : images;
    
    for (const image of imagesToConvert) {
      await handleConvert(image.id);
    }
    setShowDownloadPanel(true);
  }, [images, handleConvert]);

  const selectedCount = images.filter(img => img.selected).length;

  const handleSettingsChange = useCallback((newSettings: Partial<ImageSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleFormatChange = useCallback((format: ImageSettings['format']) => {
    handleSettingsChange({ format });
  }, [handleSettingsChange]);

  const hasConvertedImages = images.some(img => img.convertedUrl);

  return (
    <div className="bg-[#151821] text-white p-4 sm:p-6 rounded-xl">
      {isDragging && (
        <div className="fixed inset-0 bg-purple-500/10 backdrop-blur-md z-[60] flex items-center justify-center">
          <div className="bg-[#232936]/90 rounded-2xl p-8 max-w-2xl w-full mx-4 text-center border-2 border-dashed border-purple-500/50">
            <div className="w-20 h-20 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <FiPlus className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-2">
              {t('app.dropzone.drop')}
            </h3>
            <p className="text-gray-400 text-lg">
              {t('app.dropzone.dropDescription')}
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              {t('app.dropzone.formats')}
            </p>
          </div>
        </div>
      )}
      <LanguageSwitcher />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
          {t('app.title')}
        </h1>
        
        {images.length === 0 ? (
          <div
            className={`rounded-lg border-2 border-dashed ${
              isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600'
            } bg-[#232936] p-4 sm:p-6 lg:p-8 text-center transition-colors`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              aria-label={t('app.dropzone.select')}
            />
            <FiPlus className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-purple-500" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-base sm:text-lg font-medium text-gray-300 hover:text-white transition-colors"
              title={t('app.dropzone.select')}
            >
              {t('app.dropzone.select')}
            </button>
            <p className="mt-2 text-sm text-gray-400">
              {t('app.dropzone.formats')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            <div className="w-full lg:flex-1 mb-4">
              <div className="bg-[#232936] rounded-lg p-4 sm:p-6">
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#1a1f2b] rounded-lg p-3 sm:p-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                    <span className="text-gray-300">
                      {t('app.images.total')} ({images.length})
                    </span>
                    {selectedCount < images.length && (
                      <button
                        onClick={() => handleToggleSelect('all')}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        title={t('app.images.selectAll')}
                      >
                        {t('app.images.selectAll')}
                      </button>
                    )}
                    {selectedCount > 0 && (
                      <>
                        <span className="text-gray-300">
                          {t('app.images.selected')} ({selectedCount})
                        </span>
                        <button
                          onClick={() => handleToggleSelect('')}
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                          title={t('app.images.clearSelection')}
                        >
                          {t('app.images.clearSelection')}
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleRemoveAll}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    title={t('app.images.deleteAll')}
                  >
                    {t('app.images.deleteAll')}
                  </button>
                </div>

                <div className="space-y-2">
                  {images.map((image) => (
                    <ImageItem
                      key={image.id}
                      file={image.file}
                      selected={image.selected}
                      isConverting={isConverting[image.id]}
                      settings={image.settings}
                      convertedUrl={image.convertedUrl}
                      onToggleSelect={() => handleToggleSelect(image.id)}
                      onDelete={() => handleRemove(image.id)}
                    />
                  ))}
                </div>

                <div 
                  className={`mt-4 rounded-lg border-2 border-dashed ${
                    isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600'
                  } bg-[#232936] p-3 sm:p-4 text-center transition-colors`}
                >
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                    title={t('app.dropzone.select')}
                  >
                    {t('app.dropzone.select')}
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-[400px] mb-4">
              <div className="space-y-4">
                <div className="rounded-lg border border-purple-500/30 bg-[#232936] p-4 sm:p-6">
                  <h2 className="text-xl font-medium text-white mb-4 sm:mb-6">
                    {t('app.settings.title')}
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="format-select">
                      {t('app.settings.format')}
                    </label>
                    <select
                      id="format-select"
                      value={settings.format}
                      onChange={(e) => handleFormatChange(e.target.value as ImageSettings['format'])}
                      className="w-full rounded-lg bg-[#1a1f2b] border border-gray-600 text-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all"
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>

                  {settings.format !== 'png' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="quality-range">
                        {t('app.settings.quality')} {settings.quality}%
                      </label>
                      <input
                        id="quality-range"
                        type="range"
                        min="1"
                        max="100"
                        value={settings.quality}
                        onChange={(e) => handleSettingsChange({ quality: parseInt(e.target.value, 10) })}
                        className="w-full"
                        title={`${t('app.settings.quality')}: ${settings.quality}%`}
                      />
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                      {t('app.settings.dimensions')}
                      <span className="ml-2">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.maintainAspectRatio}
                            onChange={(e) => handleSettingsChange({ maintainAspectRatio: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                          <span className="ml-2 text-xs text-gray-400">
                            {t('app.settings.maintainAspect')}
                          </span>
                        </label>
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          {t('app.settings.width')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('app.settings.auto')}
                          value={settings.width || ''}
                          onChange={(e) => handleSettingsChange({ width: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                          className="block w-full px-3 py-2 bg-[#232936] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          {t('app.settings.height')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('app.settings.auto')}
                          value={settings.height || ''}
                          onChange={(e) => handleSettingsChange({ height: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                          className="block w-full px-3 py-2 bg-[#232936] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleConvertAll}
                      disabled={images.length === 0 || (selectedCount === 0 && images.some(img => img.convertedUrl))}
                      className="w-full rounded-lg px-4 py-2.5 sm:py-3 font-medium text-white transition-all bg-purple-600 hover:bg-purple-500 focus:ring focus:ring-purple-500/50 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                      {Object.values(isConverting).some(Boolean)
                        ? t('app.actions.converting')
                        : selectedCount === 0
                          ? t('app.actions.convert')
                          : selectedCount === images.length
                            ? t('app.actions.convertAll')
                            : t('app.actions.convertSelected', { count: selectedCount })}
                    </button>
                    
                    {hasConvertedImages && (
                      <button
                        onClick={() => setShowDownloadPanel(true)}
                        className="w-full rounded-lg px-4 py-2.5 sm:py-3 font-medium text-white transition-all bg-[#1a1f2b] hover:bg-[#2a2f3b] border border-purple-500/30"
                      >
                        {t('app.actions.showDownloads')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showDownloadPanel && (
        <DownloadPanel
          images={images}
          onClose={() => setShowDownloadPanel(false)}
          onFilesAdd={handleFiles}
        />
      )}
      {notifications.length > 0 && (
        <NotificationContainer
          notifications={notifications}
          onClose={removeNotification}
        />
      )}
    </div>
  );
};

export default ImageList; 