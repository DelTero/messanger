import { Button } from '@shared/ui/button';
import { Video } from 'lucide-react';
import { User, useUserStore } from '@features/auth';
import { useAuthenticatedSocket } from '@features/socket';
import { useCallStore } from '@features/call';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/ui/tooltip';

interface VideoCallProps {
  selectedUser?: User;
}

export const VideoCall = ({ selectedUser }: VideoCallProps) => {
  const user = useUserStore((state) => state.user);
  const {
    setCallActive,
    setSelectedUser,
    initializeMedia,
    createPeerConnection,
    setCallMode,
    setCallConnectionStatus,
  } = useCallStore();

  const socket = useAuthenticatedSocket();

  const initiateCall = async () => {
    if (!selectedUser || !socket || !user) return;

    try {
      setCallMode('video');

      const stream = await initializeMedia('video');
      if (!stream) {
        console.error('Не удалось получить медиапоток');
        setCallConnectionStatus('failed');
        return;
      }

      const pc = createPeerConnection(selectedUser.id, socket, stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-user', {
        offer,
        to: selectedUser.id,
        from: user.id,
        fromName: user.name,
        mode: 'video',
      });

      setSelectedUser(selectedUser);
      setCallActive(true);
    } catch (error) {
      console.error('Ошибка при инициировании звонка:', error);
      setCallConnectionStatus('failed');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={initiateCall}
            disabled={!selectedUser}
            size="icon"
            aria-label="Video call"
          >
            <Video data-icon="inline-start" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Видеозвонок</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
