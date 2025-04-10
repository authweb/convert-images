import React, { useCallback, useRef, useState, useEffect } from 'react';
import { ImageItem } from './ImageItem';
import { Image } from '../types';

interface VirtualizedImageListProps {
  images: Array<Image & { selected?: boolean }>;
  onRemove: (id: string) => void;
  onToggleSelect: (id: string) => void;
}

const ITEM_HEIGHT = 65; // Высота каждого элемента списка
const BUFFER_SIZE = 5; // Количество элементов для буферизации

export const VirtualizedImageList: React.FC<VirtualizedImageListProps> = ({
  images,
  onRemove,
  onToggleSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  const calculateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    let start = Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE;
    let end = Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE;

    // Ограничиваем диапазон
    start = Math.max(0, start);
    end = Math.min(images.length, end);

    setVisibleRange({ start, end });
  }, [images.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      window.requestAnimationFrame(calculateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Инициализация
    calculateVisibleRange();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [calculateVisibleRange]);

  const getItemStyle = (index: number) => ({
    position: 'absolute' as const,
    top: index * ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT
  });

  const visibleImages = images.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      style={{ height: '100%', maxHeight: 'calc(100vh - 400px)' }}
    >
      <div style={{ height: images.length * ITEM_HEIGHT }}>
        {visibleImages.map((image, index) => (
          <div
            key={image.id}
            style={getItemStyle(index + visibleRange.start)}
            className="absolute w-full"
          >
            <div className="p-1">
              <ImageItem
                key={image.id}
                file={image.file}
                selected={image.selected}
                settings={image.settings}
                onDelete={() => onRemove(image.id)}
                onToggleSelect={() => onToggleSelect(image.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 