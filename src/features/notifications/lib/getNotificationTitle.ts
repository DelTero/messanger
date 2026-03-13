import { Notification } from '../model/notificationsStore';

interface NotificationPayloadView {
  senderName?: string;
}

const getStringValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const getPayloadView = (payload: Notification['payload']): NotificationPayloadView => {
  return {
    senderName: getStringValue(payload?.fromUserName),
  };
};

export const getNotificationTitle = (notification: Notification): string => {
  const payload = getPayloadView(notification.payload);
  const senderName = payload.senderName ?? 'Неизвестно';

  const titleByType: Record<string, () => string> = {
    new_message: () => `Новое сообщение от пользователя "${senderName}"`,
    call_missed: () => `Пропущенный звонок от "${senderName}"`,
    system: () => 'Системное уведомление',
  };

  return titleByType[notification.type]?.() ?? 'Новое уведомление';
};
