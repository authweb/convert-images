import React from 'react';

interface DownloadProgressProps {
  current: number;
  total: number;
  fileName: string;
  size?: number;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({
  current,
  total,
  fileName,
  size
}) => {
  const progress = Math.round((current / total) * 100);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-300 truncate max-w-[200px]">
          {fileName}
        </span>
        <span className="text-sm text-gray-400">
          {size ? `${formatSize(size)} • ` : ''}{progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-purple-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}; 