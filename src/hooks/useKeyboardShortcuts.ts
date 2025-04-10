import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
  onConvert: () => void;
  onClosePanel?: () => void;
}

export const useKeyboardShortcuts = ({
  onSelectAll,
  onClearSelection,
  onDelete,
  onConvert,
  onClosePanel,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем события в полях ввода
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + A: Выбрать все
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        onSelectAll();
      }

      // Escape: Снять выбор или закрыть панель
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onClosePanel) {
          onClosePanel();
        } else {
          onClearSelection();
        }
      }

      // Delete: Удалить выбранные
      if (e.key === 'Delete') {
        e.preventDefault();
        onDelete();
      }

      // Ctrl/Cmd + Enter: Конвертировать
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onConvert();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectAll, onClearSelection, onDelete, onConvert, onClosePanel]);
}; 