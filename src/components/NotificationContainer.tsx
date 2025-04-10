import React from 'react';
import { Notification, NotificationType } from './Notification';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContainerProps {
  notifications: NotificationItem[];
  onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className="pointer-events-auto transform transition-all duration-300 ease-in-out animate-slide-in"
        >
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => onClose(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}; 