import { useEffect, useRef } from 'react';
import { ENV } from '@shared/config/env';
import { API_ENDPOINTS } from '@shared/config/api';
import { SSENotificationEvent, useNotificationsStore } from '../model/notificationsStore';
import { toast } from 'sonner';

export const useNotificationSSE = () => {
  const eventSourceRef = useRef<EventSource | null>(null);

  const addNotification = useNotificationsStore((state) => state.addNotification);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  useEffect(() => {
    const connect = () => {
      const url = `${ENV.API_URL}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`;
      const es = new EventSource(url, { withCredentials: true });

      es.onmessage = (event) => {
        try {
          const data: SSENotificationEvent = JSON.parse(event.data);

          if (data.type === 'new_notification') {
            addNotification(data.notification);
          }

          if (data.type === 'notifications_updated') {
            if (data.notificationId) {
              markAsRead(data.notificationId);
            } else {
              markAllAsRead();
            }
          }
        } catch {
          console.error('Error parsing SSE message:', event.data);
          toast.error('Произошла ошибка при обработке уведомления');
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
      };

      eventSourceRef.current = es;
    };

    connect();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
