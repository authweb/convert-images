'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiCheck, FiUpload } from 'react-icons/fi';
import JSZip from 'jszip';
import { ImageSettings } from '../types';
import { useTranslation } from 'react-i18next';
import { Spinner } from './icons/Spinner';
import { DownloadIcon } from './icons/DownloadIcon';
import Image from 'next/image';

interface DownloadPanelProps {
  images: Array<{
    id: string;
    file: File;
    convertedUrl?: string;
    error?: string;
    settings: ImageSettings;
  }>;
  onClose: () => void;
  onFilesAdd: (files: File[]) => void;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({ images, onClose, onFilesAdd }) => {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Проверяем, что курсор действительно покинул окно
      const rect = document.documentElement.getBoundingClientRect();
      if (
        e.clientX <= rect.left ||
        e.clientX >= rect.right ||
        e.clientY <= rect.top ||
        e.clientY >= rect.bottom
      ) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        onFilesAdd(files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onFilesAdd]);

  const getFileNameWithFormat = (originalName: string, format: string) => {
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    return `converted_${baseName}.${format}`;
  };

  const handleDownloadSingle = async (url: string, fileName: string, format: string, id: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = getFileNameWithFormat(fileName, format);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    setDownloadedFiles(prev => new Set([...prev, id]));
  };

  const handleDownloadZip = async (images: DownloadPanelProps['images']) => {
    const zip = new JSZip();
    
    const promises = images
      .filter(image => image.convertedUrl && !image.error)
      .map(async (image) => {
        if (!image.convertedUrl) return;
        
        const response = await fetch(image.convertedUrl);
        const blob = await response.blob();
        
        zip.file(
          getFileNameWithFormat(image.file.name, image.settings.format),
          blob
        );
      });

    await Promise.all(promises);

    const content = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = 'converted_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);

    // Отмечаем все файлы как скачанные
    setDownloadedFiles(new Set(images.map(img => img.id)));
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const successImages = images.filter(img => img.convertedUrl && !img.error);
      
      if (successImages.length <= 5) {
        for (const image of successImages) {
          if (image.convertedUrl) {
            await handleDownloadSingle(
              image.convertedUrl, 
              image.file.name,
              image.settings.format,
              image.id
            );
          }
        }
      } else {
        await handleDownloadZip(successImages);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const successCount = images.filter(img => img.convertedUrl && !img.error).length;

  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 bg-purple-500/10 backdrop-blur-md z-[60] flex items-center justify-center">
          <div className="bg-[#232936]/90 rounded-2xl p-8 max-w-lg w-full mx-4 text-center border-2 border-dashed border-purple-500/50">
            <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <FiUpload className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {t('app.dropzone.drop')}
            </h3>
            <p className="text-gray-400">
              {t('app.dropzone.dropDescription')}
            </p>
          </div>
        </div>
      )}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#232936] rounded-xl p-4 sm:p-6 max-w-lg w-full mx-4 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-medium text-white mb-1">
                {t('app.download.title')}
              </h2>
              <p className="text-sm text-gray-400">
                {successCount} {t('app.download.ready')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#151821] rounded-lg transition-colors"
              title={t('app.actions.close')}
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1a1f2b] rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FiDownload className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {t('app.download.downloadAll')}
                  </span>
                </div>
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading || images.length === 0}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      {t('app.download.downloading')}
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="w-4 h-4" />
                      {t('app.download.downloadAll')}
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {images.map((image) => {
                  const isDownloaded = downloadedFiles.has(image.id);
                  return (
                    <div
                      key={image.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#151821] group hover:bg-[#1c202a] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-[#232936] rounded-lg overflow-hidden flex-shrink-0">
                          {image.convertedUrl && (
                            <Image
                              src={image.convertedUrl}
                              alt={image.file.name}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {getFileNameWithFormat(image.file.name, image.settings.format)}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            {(image.file.size / 1024 / 1024).toFixed(2)} MB
                            {isDownloaded && (
                              <span className="flex items-center gap-1 text-green-400">
                                <FiCheck className="w-3 h-3" />
                                {t('app.download.downloaded')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => image.convertedUrl && handleDownloadSingle(
                          image.convertedUrl,
                          image.file.name,
                          image.settings.format,
                          image.id
                        )}
                        disabled={!image.convertedUrl || isDownloading}
                        className={`p-2 rounded-lg transition-colors ${
                          isDownloaded 
                            ? 'text-green-400 bg-green-500/10' 
                            : 'text-purple-400 hover:bg-purple-500/10'
                        } disabled:text-gray-500 disabled:hover:bg-transparent disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 focus:opacity-100`}
                        title={t('app.download.downloadSingle')}
                      >
                        {isDownloaded ? (
                          <FiCheck className="w-5 h-5" />
                        ) : (
                          <DownloadIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 