import { Button } from '@shared/ui/button';
import { Phone } from 'lucide-react';
import { User, useUserStore } from '@features/auth';
import { useAuthenticatedSocket } from '@features/socket';
import { useCallStore } from '@features/call';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/ui/tooltip';

interface AudioCallProps {
  selectedUser?: User;
}

export const AudioCall = ({ selectedUser }: AudioCallProps) => {
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
      setCallMode('audio');

      const stream = await initializeMedia('audio');
      if (!stream) {
        console.error('Не удалось получить медиапоток (audio)');
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
        mode: 'audio',
      });

      setSelectedUser(selectedUser);
      setCallActive(true);
    } catch (error) {
      console.error('Ошибка при инициировании аудиозвонка:', error);
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
            aria-label="Audio call"
          >
            <Phone data-icon="inline-start" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Аудиозвонок</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
