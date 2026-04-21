import { Button } from '@shared/ui/Button';
import { Phone } from 'lucide-react';
import { User, useUserStore } from '@features/auth';
import { useAuthenticatedSocket } from '@features/socket';
import { useCallStore } from '@features/call';

interface AudioCallProps {
  selectedUser?: User;
}

export const AudioCall = ({ selectedUser }: AudioCallProps) => {
  const user = useUserStore((state) => state.user);
  const { setCallActive, setSelectedUser, initializeMedia, createPeerConnection, setCallMode } = useCallStore();

  const socket = useAuthenticatedSocket();

  const initiateCall = async () => {
    if (!selectedUser || !socket || !user) return;

    try {
      setCallMode('audio');

      const stream = await initializeMedia('audio');
      if (!stream) {
        console.error('Не удалось получить медиапоток (audio)');
        return;
      }

      const pc = createPeerConnection(selectedUser.id, socket);

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
    }
  };

  return (
    <Button
      onClick={initiateCall}
      disabled={!selectedUser}
      className="px-6"
    >
      <Phone className="h-5 w-5" />
    </Button>
  );
};
