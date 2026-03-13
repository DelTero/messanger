import { useCustomQuery } from '@shared/hooks/useCustomQuery';
import { axiosInstance } from '@shared/lib/axiosConfig';
import { API_ENDPOINTS } from '@shared/config/api';
import { QUERY_KEYS } from '@shared/config/queryKeys';
import { Notification, useNotificationsStore } from '../model/notificationsStore';

export const useNotificationsQuery = () => {
  const setNotifications = useNotificationsStore((state) => state.setNotifications);

  return useCustomQuery<Notification[]>(QUERY_KEYS.NOTIFICATIONS.ALL, async () => {
    const { data } = await axiosInstance.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.GET_ALL);
    setNotifications(data);
    return data;
  });
};
