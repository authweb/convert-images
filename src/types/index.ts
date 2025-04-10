export interface ImageSettings {
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  width?: number;
  height?: number;
  maxSize?: number;
  maintainAspectRatio: boolean;
}

export type ConvertProgress = number;

export interface ConvertImageOptions extends ImageSettings {
  signal?: AbortSignal;
  onProgress?: (progress: ConvertProgress) => void;
} 