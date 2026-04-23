import { Button } from '@shared/ui/button';
import { useCallStore } from '../model/callStore';
import { useAuthenticatedSocket } from '@features/socket';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui/alert-dialog';
import { Phone, PhoneOff } from 'lucide-react';

interface IncomingCallModalProps {
  callerName: string;
  callerId: string;
  incomingOffer: RTCSessionDescriptionInit | null;
}

export const IncomingCallModal = ({ callerName, callerId, incomingOffer }: IncomingCallModalProps) => {
  const socket = useAuthenticatedSocket();
  const {
    setCallActive,
    setIncomingCall,
    resetCallState,
    initializeMedia,
    createPeerConnection,
    applyPendingCandidates,
    callMode,
    setCallConnectionStatus,
  } = useCallStore();

  const acceptCall = async () => {
    if (!callerId || !socket || !incomingOffer) return;

    try {
      const stream = await initializeMedia(callMode);
      if (!stream) {
        console.error('Не удалось получить медиапоток');
        setCallConnectionStatus('failed');
        resetCallState();
        return;
      }

      const pc = createPeerConnection(callerId, socket);

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      await applyPendingCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('call-accept', {
        answer,
        to: callerId,
      });

      setCallActive(true);
      setIncomingCall(false);
    } catch (error) {
      console.error('Ошибка при принятии звонка:', error);
      setCallConnectionStatus('failed');
      resetCallState();
    }
  };
  const declineCall = () => {
    if (socket && callerId) {
      socket.emit('decline-call', {
        to: callerId,
      });
    }
    setIncomingCall(false);
  };

  const title = callMode === 'audio' ? 'Входящий аудиозвонок' : 'Входящий видеозвонок';

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title} от {callerName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {callMode === 'audio'
              ? 'Пользователь приглашает вас в аудиоразговор.'
              : 'Пользователь приглашает вас в видеозвонок.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={declineCall}>Отклонить</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={acceptCall}>
              <Phone data-icon="inline-start" />
              Принять
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          aria-label="Отклонить звонок"
          onClick={declineCall}
        >
          <PhoneOff />
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};
