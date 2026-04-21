import { Button } from '@shared/ui/Button';
import { useCallStore } from '../model/callStore';
import { useAuthenticatedSocket } from '@features/socket';

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
  } = useCallStore();

  const acceptCall = async () => {
    if (!callerId || !socket || !incomingOffer) return;

    try {
      const stream = await initializeMedia(callMode);
      if (!stream) {
        console.error('Не удалось получить медиапоток');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">
          {title} от {callerName}
        </h3>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={acceptCall}
            className="bg-green-500 hover:bg-green-600"
          >
            Принять
          </Button>
          <Button
            onClick={declineCall}
            className="bg-red-500 hover:bg-red-600"
          >
            Отклонить
          </Button>
        </div>
      </div>
    </div>
  );
};
