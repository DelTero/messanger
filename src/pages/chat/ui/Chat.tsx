import { useEffect, useRef, useState } from 'react';
import { useGetUsers } from '../api/useGetAllUsers';
import { User, useUserStore } from '@features/auth';
import { useAuthenticatedSocket } from '@features/socket';
import { cn } from '@/shared/lib/utils';
import { Menu, MessagesSquare, SendHorizontal } from 'lucide-react';
import { AudioCall } from '@features/audio-call';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { ScrollArea } from '@shared/ui/scroll-area';
import { Separator } from '@shared/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@shared/ui/sheet';
import { VideoCall } from '@/features/video-call';

interface Message {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface MessageNotification {
  fromUserId: string;
  messagePreview: string;
  roomId: string;
  timestamp: Date;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [unreadMessages, setUnreadMessages] = useState<string[]>([]);
  const [isUsersSheetOpen, setIsUsersSheetOpen] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const currentUser = useUserStore((state) => state.user);

  const { data: users = [] } = useGetUsers();

  const socket = useAuthenticatedSocket();

  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = ({ message, fromUserId }: { message: Message; fromUserId: string }) => {
      if ((currentUser && message.userId === currentUser.id) || (selectedUser && fromUserId === selectedUser.id)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleNewMessageNotification = (notification: MessageNotification) => {
      const fromUserId = notification.fromUserId;

      if (!selectedUser || selectedUser.id !== fromUserId) {
        setUnreadMessages((prev) => (prev.includes(fromUserId) ? prev : [...prev, fromUserId]));
      }
    };

    const handlePrivateChat = (data: { roomId: string; messages: Message[] }) => {
      setMessages(data.messages || []);
    };

    socket.on('onPrivateMessage', handlePrivateMessage);
    socket.on('newMessageNotification', handleNewMessageNotification);
    socket.on('privateChat', handlePrivateChat);

    return () => {
      socket.off('onPrivateMessage', handlePrivateMessage);
      socket.off('newMessageNotification', handleNewMessageNotification);
      socket.off('privateChat', handlePrivateChat);
    };
  }, [socket, selectedUser, currentUser]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !currentUser || !messageInput.trim() || !selectedUser) return;

    const messageData = {
      fromUserId: currentUser.id,
      toUserId: selectedUser.id,
      message: messageInput,
    };
    socket.emit('sendPrivateMessage', messageData);
    setMessageInput('');
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsUsersSheetOpen(false);

    setMessages([]);

    setUnreadMessages((prev) => prev.filter((id) => id !== user.id));

    if (socket && currentUser) {
      socket.emit('startPrivateChat', {
        fromUserId: currentUser.id,
        toUserId: user.id,
      });
    }
  };

  const getUserItemClasses = (user: User) => {
    const isActiveUser = selectedUser?.id === user.id;
    const hasUnreadMessages = unreadMessages.includes(user.id);

    return cn('flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors', {
      'bg-primary/10': isActiveUser,
      'bg-muted/70': hasUnreadMessages && !isActiveUser,
      'hover:bg-muted': !hasUnreadMessages && !isActiveUser,
    });
  };

  const getUserName = (user: User) => {
    const parts = user.name.trim().split(' ');

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  };

  const renderUserList = () => (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-2">
        {users.map((user) => {
          const hasUnreadMessages = unreadMessages.includes(user.id);

          return (
            <button
              key={user.id}
              type="button"
              onClick={() => handleUserSelect(user)}
              className={getUserItemClasses(user)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar>
                  <AvatarFallback>{getUserName(user)}</AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">{user.name}</span>
              </div>

              {hasUnreadMessages ? <Badge variant="secondary">Новое</Badge> : null}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );

  const getMessageClasses = (messageUserId: string) => {
    const isCurrentUser = messageUserId === currentUser?.id;

    return cn('max-w-[85%] rounded-lg px-3 py-2 text-sm sm:max-w-[70%] bg-muted text-foreground', {
      'ml-auto': isCurrentUser,
      'mr-auto': !isCurrentUser,
    });
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl">
      <div className="flex h-full w-full overflow-hidden rounded-lg border bg-background shadow-sm">
        <aside className="hidden w-72 border-r md:flex md:flex-col">
          <div className="px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Пользователи</h2>
          </div>
          <Separator />
          {renderUserList()}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Текущий диалог</p>
              <p className="truncate text-base font-semibold">
                {selectedUser ? selectedUser.name : 'Пользователь не выбран'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Sheet
                open={isUsersSheetOpen}
                onOpenChange={setIsUsersSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Открыть список пользователей"
                  >
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="p-0"
                >
                  <SheetHeader>
                    <SheetTitle>Пользователи</SheetTitle>
                    <SheetDescription>Выберите собеседника, чтобы открыть диалог.</SheetDescription>
                  </SheetHeader>
                  <Separator />
                  <div className="min-h-0 flex-1">{renderUserList()}</div>
                </SheetContent>
              </Sheet>

              {selectedUser ? (
                <div className="flex items-center gap-2">
                  <VideoCall selectedUser={selectedUser} />
                  <AudioCall selectedUser={selectedUser} />
                </div>
              ) : null}
            </div>
          </div>

          <Separator />

          {selectedUser ? (
            <>
              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={getMessageClasses(message.userId)}
                    >
                      <div className="mb-1 text-xs text-muted-foreground">
                        {message.userId === currentUser?.id ? 'Вы' : message.user.name}
                        <span className="mx-1">•</span>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <p>{message.content}</p>
                    </div>
                  ))}
                  <div ref={lastMessageRef} />
                </div>
              </ScrollArea>

              <Separator />

              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Введите сообщение..."
                    className="w-full"
                    containerClassName="w-full"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    size="icon"
                    aria-label="Отправить сообщение"
                  >
                    <SendHorizontal />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <MessagesSquare className="text-muted-foreground" />
              <h3 className="text-lg font-semibold">Выберите пользователя для начала чата</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Выберите пользователя из списка, чтобы начать общение или продолжить существующий диалог.
              </p>
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setIsUsersSheetOpen(true)}
              >
                Открыть список пользователей
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
