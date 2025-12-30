import { create } from 'zustand';
import { User } from '@features/auth';
import { axiosInstance } from '@/shared/lib/axiosConfig';
import { API_ENDPOINTS } from '@/shared/config/api';

export interface CallState {
  isCallActive: boolean;
  isIncomingCall: boolean;
  callerName: string;
  callerId: string;
  incomingOffer: RTCSessionDescriptionInit | null;
  selectedUser: User | null;

  callMode: 'video' | 'audio';

  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  pendingCandidates: RTCIceCandidateInit[];
  iceServers: RTCIceServer[];

  setCallActive: (active: boolean) => void;
  setIncomingCall: (
    incoming: boolean,
    callerId?: string,
    callerName?: string,
    offer?: RTCSessionDescriptionInit | null,
    mode?: 'audio' | 'video',
  ) => void;
  setSelectedUser: (user: User | null) => void;
  setCallMode: (mode: 'video' | 'audio') => void;

  fetchIceServers: () => Promise<void>;
  initializeMedia: (mode?: 'video' | 'audio') => Promise<MediaStream | null>;
  createPeerConnection: (targetUserId: string | number) => RTCPeerConnection;
  applyPendingCandidates: () => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => void;
  cleanupResources: () => void;

  resetCallState: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  isCallActive: false,
  isIncomingCall: false,
  callerName: '',
  callerId: '',
  incomingOffer: null,
  selectedUser: null,

  callMode: 'video',

  localStream: null,
  remoteStream: null,
  peerConnection: null,
  pendingCandidates: [],
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],

  setCallActive: (active) => set({ isCallActive: active }),

  setIncomingCall: (incoming, callerId = '', callerName = '', offer = null, mode = 'video') =>
    set((state) => ({
      isIncomingCall: incoming,
      callerId: incoming ? callerId : state.callerId,
      callerName: incoming ? callerName : state.callerName,
      incomingOffer: incoming ? offer : state.incomingOffer,
      callMode: incoming ? mode : state.callMode,
    })),

  setSelectedUser: (user) => set({ selectedUser: user }),
  setCallMode: (mode) => set({ callMode: mode }),

  fetchIceServers: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.VOIP.ICE_SERVERS);
      const data = response.data;

      if (data.iceServers) {
        set({ iceServers: data.iceServers });
      }
    } catch (error) {
      console.error('Не удалось получить ICE серверы:', error);
    }
  },

  initializeMedia: async (mode = 'video') => {
    try {
      await get().fetchIceServers();

      const constraints: MediaStreamConstraints =
        mode === 'audio' ? { audio: true, video: false } : { audio: true, video: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      set({ localStream: stream });
      return stream;
    } catch (error) {
      console.error('Ошибка при доступе к медиа устройствам:', error);
      return null;
    }
  },

  createPeerConnection: () => {
    const currentPeerConnection = get().peerConnection;
    if (currentPeerConnection) {
      currentPeerConnection.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: get().iceServers,
    });

    const { localStream } = get();
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        set({ remoteStream: event.streams[0] });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE состояние изменилось:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Состояние соединения изменилось:', pc.connectionState);
    };

    set({ peerConnection: pc });
    return pc;
  },

  applyPendingCandidates: async () => {
    const { peerConnection, pendingCandidates } = get();

    if (!peerConnection || !peerConnection.remoteDescription) {
      console.log('Невозможно применить ICE кандидаты: remoteDescription не установлен');
      return;
    }

    if (pendingCandidates.length > 0) {
      for (const candidate of pendingCandidates) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Ошибка при добавлении накопленного ICE кандидата:', error);
        }
      }

      set({ pendingCandidates: [] });
    }
  },

  addIceCandidate: (candidate) => {
    const { peerConnection } = get();

    if (peerConnection && peerConnection.remoteDescription) {
      peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((err) => console.error('Ошибка при добавлении ICE кандидата:', err));
    } else {
      set((state) => ({
        pendingCandidates: [...state.pendingCandidates, candidate],
      }));
    }
  },

  cleanupResources: () => {
    const { localStream, peerConnection } = get();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
      peerConnection.close();
    }

    set({
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      pendingCandidates: [],
    });
  },

  resetCallState: () => {
    get().cleanupResources();

    set({
      isCallActive: false,
      isIncomingCall: false,
      callerName: '',
      callerId: '',
      incomingOffer: null,
      selectedUser: null,
      callMode: 'video',
    });
  },
}));
