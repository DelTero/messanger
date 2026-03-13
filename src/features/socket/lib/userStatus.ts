import { getSocketInstance } from '@shared/lib/socket';

let hasEmittedUserOnline = false;

export function emitUserOnline(userId: string) {
  const socket = getSocketInstance();

  if (socket.connected && !hasEmittedUserOnline && userId) {
    socket.emit('userOnline', userId);
    hasEmittedUserOnline = true;

    socket.once('disconnect', () => {
      hasEmittedUserOnline = false;
    });
  }
}
