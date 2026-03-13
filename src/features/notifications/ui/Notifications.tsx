import { useMemo, useState } from 'react';
import { useNotificationsStore } from '../model/notificationsStore';
import { useNotificationsQuery } from '../api/useNotificationsQuery';
import { useMarkAsReadMutation } from '../api/useMarkAsReadMutation';
import { useMarkAllAsReadMutation } from '../api/useMarkAllAsReadMutation';
import { useNotificationSSE } from '../hooks/useNotificationSSE';
import { getNotificationTitle } from '../lib/getNotificationTitle';
import { Bell, Check } from 'lucide-react';
import { useClickOutside } from '@shared/hooks/useClickOutside';
import { formatRelativeTime } from '@shared/lib/formatDate';
import React from 'react';
import { Button } from '@shared/ui/Button';
import { IconButton } from '@shared/ui/IconButton';
import { cn } from '@/shared/lib/utils';
import { Spinner } from '@/shared/ui/Spinner';

export const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useNotificationsStore((state) => state.notifications);
  const { mutate: markAsRead, isPending: isMarkingAsReadPending } = useMarkAsReadMutation();
  const { mutate: markAllAsRead, isPending: isMarkingAllAsReadPending } = useMarkAllAsReadMutation();

  const { isLoading: isNotificationsLoading } = useNotificationsQuery();
  useNotificationSSE();

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
  });

  const toggleNotifications = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleNotificationClick = (notification: { id: string; isRead: boolean }) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleMarkAsRead =
    (notification: { id: string; isRead: boolean }) =>
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.stopPropagation();
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    };

  const getNotificationItemClasses = (isRead: boolean, index: number, total: number): string => {
    return cn('p-3 hover:bg-indigo-50 cursor-pointer transition-colors duration-200 group', {
      'border-b': index !== total - 1,
      'bg-indigo-50/50': !isRead,
    });
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <IconButton
        icon={Bell}
        onClick={toggleNotifications}
        variant="primary"
        size="sm"
        aria-label="Уведомления"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </IconButton>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden transform transition-all duration-200 origin-top-right">
          <div className="p-3 border-b bg-gradient-to-r from-indigo-50 to-indigo-100 flex justify-between items-center">
            <h3 className="font-semibold text-indigo-800">
              Уведомления {unreadCount > 0 && <span className="text-xs">({unreadCount})</span>}
            </h3>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                isLoading={isMarkingAllAsReadPending}
                variant="secondary"
                className="text-xs bg-transparent text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 px-2 py-1"
              >
                Прочитать все
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isNotificationsLoading ? (
              <div className="p-8 text-center">
                <Spinner
                  size="lg"
                  className="text-indigo-600"
                />
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={getNotificationItemClasses(notification.isRead, index, notifications.length)}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-700">{getNotificationTitle(notification)}</p>
                          <span className="text-xs text-gray-500 ml-2 group-hover:text-indigo-600">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.payload?.messagePreview as string}
                        </p>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="mt-1 flex justify-end">
                        <IconButton
                          icon={Check}
                          onClick={handleMarkAsRead(notification)}
                          isLoading={isMarkingAsReadPending}
                          variant="secondary"
                          size="sm"
                          title="Отметить как прочитанное"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-indigo-300 mb-2">
                  <Bell className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500">Нет уведомлений</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
