import { useEffect, useRef } from 'react';
import { ENV } from '@shared/config/env';
import { API_ENDPOINTS } from '@shared/config/api';
import { SSENotificationEvent, useNotificationsStore } from '../model/notificationsStore';
import { toast } from 'sonner';

export const useNotificationSSE = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isUnmountedRef = useRef(false);

  const addNotification = useNotificationsStore((state) => state.addNotification);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  useEffect(() => {
    const scheduleReconnect = (connect: () => void) => {
      if (isUnmountedRef.current || reconnectTimeoutRef.current) {
        return;
      }

      const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000);
      reconnectAttemptRef.current += 1;

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connect();
      }, delayMs);
    };

    const connect = () => {
      if (isUnmountedRef.current || eventSourceRef.current) {
        return;
      }

      const url = `${ENV.API_URL}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`;
      const es = new EventSource(url, { withCredentials: true });

      es.onopen = () => {
        reconnectAttemptRef.current = 0;
      };

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
        scheduleReconnect(connect);
      };

      eventSourceRef.current = es;
    };

    connect();

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
