import { useCustomMutation } from '@shared/hooks/useCustomMutation';
import { axiosInstance } from '@shared/lib/axiosConfig';
import { API_ENDPOINTS } from '@shared/config/api';

export const useMarkAsReadMutation = () => {
  return useCustomMutation<void, string>(async (id) => {
    await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
  });
};
