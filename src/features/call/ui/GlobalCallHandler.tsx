import { useEffect } from 'react';
import { useCallStore } from '../model/callStore';
import { useUserStore } from '@features/auth';
import { useAuthenticatedSocket } from '@features/socket';
import { IncomingCallModal } from './IncomingCallModal';
import { ActiveCallModal } from './ActiveCallModal';

export const GlobalCallHandler = () => {
  const socket = useAuthenticatedSocket();
  const user = useUserStore((state) => state.user);

  const {
    isCallActive,
    isIncomingCall,
    callerName,
    callerId,
    incomingOffer,
    setIncomingCall,
    addIceCandidate,
    resetCallState,
  } = useCallStore();

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleIncomingCall = ({
      offer,
      from,
      fromName,
      mode,
    }: {
      offer: RTCSessionDescriptionInit;
      from: string;
      fromName: string;
      mode?: 'audio' | 'video';
    }) => {
      console.log('incoming-call от', fromName, 'режим', mode);
      setIncomingCall(true, from, fromName, offer, mode || 'video');
    };

    const handleIceCandidate = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      addIceCandidate(candidate);
    };

    const handleCallAccepted = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log('Звонок принят, получен ответ');
      const { peerConnection: currentPeerConnection, applyPendingCandidates: applyCurrentPendingCandidates } =
        useCallStore.getState();
      if (currentPeerConnection) {
        try {
          await currentPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          await applyCurrentPendingCandidates();
        } catch (error) {
          console.error('Ошибка при установке удаленного описания:', error);
        }
      } else {
        console.error('peerConnection не инициализирован при получении ответа');
      }
    };

    const handleCallDeclined = () => {
      console.log('Звонок отклонен');
      resetCallState();
    };

    const handleCallEnded = () => {
      console.log('Звонок завершен другой стороной');
      resetCallState();
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-declined', handleCallDeclined);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-declined', handleCallDeclined);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, user, setIncomingCall, addIceCandidate, resetCallState]);

  return (
    <>
      {isIncomingCall && !isCallActive && (
        <IncomingCallModal
          callerName={callerName}
          callerId={callerId}
          incomingOffer={incomingOffer}
        />
      )}

      {isCallActive && <ActiveCallModal />}
    </>
  );
};
