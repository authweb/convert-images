import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageSettings, ConvertProgress } from '../types';
import { convertImage } from '../utils/imageConverter';

export const useImageConversion = () => {
  const { t } = useTranslation();
  const [conversionStates, setConversionStates] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, ConvertProgress>>({});

  const convertImages = useCallback(async (
    files: File[],
    settings: ImageSettings,
    onComplete?: (urls: Record<string, string>) => void
  ) => {
    const controller = new AbortController();
    const urls: Record<string, string> = {};

    try {
      for (const file of files) {
        const convertedUrl = await convertImage(file, {
          ...settings,
          signal: controller.signal,
          onProgress: (progress: ConvertProgress) => {
            setConversionStates(prev => ({
              ...prev,
              [file.name]: true
            }));
            setProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          }
        });
        urls[file.name] = convertedUrl;
      }
      onComplete?.(urls);
    } catch (error) {
      console.error('Error converting images:', error);
    } finally {
      setConversionStates({});
      setProgress({});
    }

    return () => controller.abort();
  }, []);

  const startConversion = useCallback(async (
    id: string,
    file: File,
    settings: ImageSettings,
    onComplete?: (url: string) => void,
    onError?: (error: string) => void
  ) => {
    if (conversionStates[id]) {
      const error = t('app.conversion.alreadyInProgress');
      setConversionStates(prev => ({
        ...prev,
        [id]: false
      }));
      onError?.(error);
      return;
    }

    setConversionStates(prev => ({
      ...prev,
      [id]: true
    }));

    try {
      const convertedUrl = await convertImage(file, {
        ...settings,
        onProgress: (progress: ConvertProgress) => {
          setProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
        }
      });

      setConversionStates(prev => ({
        ...prev,
        [id]: false
      }));

      onComplete?.(convertedUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('app.conversion.error');
      setConversionStates(prev => ({
        ...prev,
        [id]: false
      }));

      onError?.(errorMessage);
    }
  }, [t, conversionStates]);

  const cancelConversion = useCallback((id: string) => {
    setConversionStates(prev => ({
      ...prev,
      [id]: false
    }));
  }, []);

  const getConversionState = useCallback((id: string) => {
    return conversionStates[id] || false;
  }, [conversionStates]);

  return {
    conversionStates,
    progress,
    convertImages,
    startConversion,
    cancelConversion,
    getConversionState
  };
}; 