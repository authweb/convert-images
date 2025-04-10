import { ImageSettings, OnProgressCallback } from '../types';

interface ConvertImageOptions extends ImageSettings {
  signal?: AbortSignal;
  onProgress?: OnProgressCallback;
}

export const convertImage = async (file: File, options: ConvertImageOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (options.width || options.height) {
          if (options.maintainAspectRatio) {
            const aspectRatio = img.width / img.height;
            if (options.width) {
              width = options.width;
              height = width / aspectRatio;
            } else if (options.height) {
              height = options.height;
              width = height * aspectRatio;
            }
          } else {
            width = options.width || width;
            height = options.height || height;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        const mimeType = `image/${options.format}`;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }

            // Track progress
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.onerror = () => {
              reject(new Error('Failed to read converted image'));
            };

            if (options.onProgress) {
              const interval = setInterval(() => {
                if (reader.readyState === 2) { // DONE
                  options.onProgress?.({
                    loaded: blob.size,
                    total: blob.size,
                    percent: 100
                  });
                  clearInterval(interval);
                } else if (reader.readyState === 1) { // LOADING
                  options.onProgress?.({
                    loaded: blob.size / 2, // Примерная оценка
                    total: blob.size,
                    percent: 50
                  });
                }
              }, 100);
            }

            reader.readAsDataURL(blob);
          },
          mimeType,
          options.format === 'png' ? undefined : options.quality / 100
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    if (options.onProgress) {
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          options.onProgress?.({
            loaded: event.loaded,
            total: event.total,
            percent: Math.round((event.loaded / event.total) * 100)
          });
        }
      };
    }

    reader.readAsDataURL(file);
  });
}; 