import { type KeyboardEvent, type MouseEvent, useMemo, useState } from 'react';
import { type Notification, useNotificationsStore } from '../model/notificationsStore';
import { useNotificationsQuery } from '../api/useNotificationsQuery';
import { useMarkAsReadMutation } from '../api/useMarkAsReadMutation';
import { useMarkAllAsReadMutation } from '../api/useMarkAllAsReadMutation';
import { useNotificationSSE } from '../hooks/useNotificationSSE';
import { getNotificationTitle } from '../lib/getNotificationTitle';
import { Bell, Check } from 'lucide-react';
import { formatRelativeTime } from '@shared/lib/formatDate';
import { cn } from '@shared/lib/utils';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { ScrollArea } from '@shared/ui/scroll-area';
import { Separator } from '@shared/ui/separator';
import { Spinner } from '@shared/ui/spinner';

export const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useNotificationsStore((state) => state.notifications);
  const { mutate: markAsRead, isPending: isMarkingAsReadPending } = useMarkAsReadMutation();
  const { mutate: markAllAsRead, isPending: isMarkingAllAsReadPending } = useMarkAllAsReadMutation();

  const { isLoading: isNotificationsLoading } = useNotificationsQuery();
  useNotificationSSE();

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleNotificationKeyDown = (event: KeyboardEvent<HTMLDivElement>, notification: Notification) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNotificationClick(notification);
    }
  };

  const handleMarkAsRead =
    (notification: Notification) =>
    (event: MouseEvent<HTMLButtonElement>): void => {
      event.stopPropagation();
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    };

  const getNotificationItemClasses = (isRead: boolean, index: number, total: number): string => {
    return cn('group cursor-pointer px-3 py-3 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70', {
      'bg-muted/40': !isRead,
      'pb-0': index !== total - 1,
    });
  };

  const getNotificationActionsClasses = (index: number, total: number): string => {
    return cn('flex items-start justify-between gap-2', {
      'pb-3': index !== total - 1,
    });
  };

  return (
    <div className="relative">
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Уведомления"
            className="relative"
          >
            <Bell />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 size-5 rounded-full p-0 text-[10px] leading-none"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-80 overflow-hidden p-0"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Уведомления</h3>
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount}</Badge>}
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="ghost"
                size="sm"
                disabled={isMarkingAllAsReadPending}
              >
                {isMarkingAllAsReadPending && <Spinner data-icon="inline-start" />}
                Прочитать все
              </Button>
            )}
          </div>

          <ScrollArea className="h-96">
            {isNotificationsLoading ? (
              <div className="flex items-center justify-center px-3 py-8">
                <Spinner className="text-muted-foreground" />
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(event) => handleNotificationKeyDown(event, notification)}
                    className={getNotificationItemClasses(notification.isRead, index, notifications.length)}
                  >
                    <div className={getNotificationActionsClasses(index, notifications.length)}>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{getNotificationTitle(notification)}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      {!notification.isRead && (
                        <Button
                          onClick={handleMarkAsRead(notification)}
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          title="Отметить как прочитанное"
                          disabled={isMarkingAsReadPending}
                        >
                          {isMarkingAsReadPending ? <Spinner data-icon="inline-start" /> : <Check />}
                        </Button>
                      )}
                    </div>

                    {index !== notifications.length - 1 && <Separator className="mt-0" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-3 py-8 text-center">
                <Bell className="size-12 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">Нет уведомлений</p>
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
