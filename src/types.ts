export interface ImageSettings {
  format: 'jpeg' | 'png' | 'webp';
  quality: number; // 0-100 для JPEG и WebP
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

export interface Image {
  id: string;
  file: File;
  preview: string;
  settings: ImageSettings;
}

export interface ConvertProgress {
  loaded: number;
  total: number;
  percent: number;
}

export type OnProgressCallback = (progress: ConvertProgress) => void; 