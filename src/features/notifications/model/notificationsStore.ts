import { create } from 'zustand';

export interface Notification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface SSENewNotificationEvent {
  type: 'new_notification';
  notification: Notification;
  unreadCount: number;
}

export interface SSENotificationsUpdatedEvent {
  type: 'notifications_updated';
  notificationId?: string;
  unreadCount: number;
}

export type SSENotificationEvent = SSENewNotificationEvent | SSENotificationsUpdatedEvent;

interface NotificationsState {
  notifications: Notification[];

  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
}));
