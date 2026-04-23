import { useEffect, useRef } from 'react';
import { PhoneOff } from 'lucide-react';
import { useAuthenticatedSocket } from '@features/socket';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Button } from '@shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@shared/ui/dialog';
import { useCallStore } from '../model/callStore';

export const ActiveCallModal = () => {
  const socket = useAuthenticatedSocket();
  const {
    isCallActive,
    selectedUser,
    callerId,
    resetCallState,
    localStream,
    remoteStream,
    callMode,
    callConnectionStatus,
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (callMode === 'video') {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [localStream, callMode]);

  useEffect(() => {
    if (callMode === 'video') {
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    } else {
      if (remoteAudioRef.current && remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream, callMode]);

  const endCall = () => {
    const targetUserId = selectedUser?.id || callerId;

    if (socket && targetUserId) {
      socket.emit('end-call', {
        to: targetUserId,
      });
    }

    resetCallState();
  };

  const callName = selectedUser?.name || 'пользователем';
  const isConnecting = callConnectionStatus === 'connecting';
  const isConnected = callConnectionStatus === 'connected';
  const isFailed = callConnectionStatus === 'failed';

  const statusText = isFailed
    ? 'Не удалось установить соединение.'
    : isConnected
      ? 'Соединение установлено.'
      : 'Устанавливаем соединение...';

  const callStateText = isFailed ? 'Ошибка соединения' : isConnected ? 'Разговор идет...' : 'Подключаем...';

  return (
    <Dialog
      open={isCallActive}
      onOpenChange={(open) => {
        if (!open) {
          endCall();
        }
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {callMode === 'audio' ? 'Аудиозвонок' : 'Видеозвонок'} с {callName}
          </DialogTitle>
          <DialogDescription>{statusText}</DialogDescription>
        </DialogHeader>

        {callMode === 'audio' ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <Avatar className="size-20">
              <AvatarFallback>{callName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium">{callName}</p>
              <p className="text-sm text-muted-foreground">{callStateText}</p>
            </div>
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
                <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
              </div>
            ) : null}
            <audio
              ref={remoteAudioRef}
              autoPlay
              className="hidden"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-md bg-muted">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="h-56 w-full object-cover md:h-64"
              />
              <span className="absolute bottom-2 left-2 rounded bg-background/90 px-2 py-1 text-xs font-medium">
                Вы
              </span>
            </div>

            <div className="relative overflow-hidden rounded-md bg-muted">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-56 w-full object-cover md:h-64"
              />
              <span className="absolute bottom-2 left-2 rounded bg-background/90 px-2 py-1 text-xs font-medium">
                {selectedUser?.name || 'Собеседник'}
              </span>
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-center">
          <Button
            onClick={endCall}
            size="icon"
            variant="destructive"
            aria-label="End call"
          >
            <PhoneOff />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
