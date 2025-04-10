import React, { useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <FiCheck className="w-5 h-5" />;
    case 'error':
      return <FiAlertCircle className="w-5 h-5" />;
    case 'warning':
      return <FiAlertCircle className="w-5 h-5" />;
    case 'info':
      return <FiInfo className="w-5 h-5" />;
  }
};

const getStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-[#232936] text-green-400 border-green-500/20 shadow-green-500/10';
    case 'error':
      return 'bg-[#232936] text-red-400 border-red-500/20 shadow-red-500/10';
    case 'warning':
      return 'bg-[#232936] text-yellow-400 border-yellow-500/20 shadow-yellow-500/10';
    case 'info':
      return 'bg-[#232936] text-blue-400 border-blue-500/20 shadow-blue-500/10';
  }
};

const getProgressStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/20';
    case 'error':
      return 'bg-red-500/20';
    case 'warning':
      return 'bg-yellow-500/20';
    case 'info':
      return 'bg-blue-500/20';
  }
};

export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg ${getStyles(
        type
      )} animate-notification-slide-in`}
      role="alert"
    >
      <div className="flex-shrink-0">{getIcon(type)}</div>
      <div className="flex-grow text-sm font-medium">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
        aria-label="Закрыть уведомление"
      >
        <FiX className="w-5 h-5" />
      </button>
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div
            className={`h-full ${getProgressStyles(type)} animate-notification-progress`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}; 