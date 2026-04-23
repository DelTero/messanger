import { useCustomMutation } from '@shared/hooks/useCustomMutation';
import { axiosInstance } from '@shared/lib/axiosConfig';
import { API_ENDPOINTS } from '@shared/config/api';
import { useNotificationsStore } from '../model/notificationsStore';

export const useMarkAllAsReadMutation = () => {
  return useCustomMutation<void, void>(
    async () => {
      await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
    },
    {
      onSuccess: () => {
        useNotificationsStore.getState().markAllAsRead();
      },
    },
  );
};
