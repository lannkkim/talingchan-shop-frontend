import axios from "@/lib/axios";
import { NotificationResponse, MarkAsReadResponse } from "@/types/notification";

export const getNotifications = async (page = 1, limit = 20) => {
  const response = await axios.get<NotificationResponse>(
    "/api/v1/notifications",
    {
      params: { page, limit },
    },
  );
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await axios.put<MarkAsReadResponse>(
    `/api/v1/notifications/${id}/read`,
  );
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axios.put<MarkAsReadResponse>(
    "/api/v1/notifications/read-all",
  );
  return response.data;
};

export interface NotificationPreference {
  type: string;
  channel_email: boolean;
  channel_in_app: boolean;
}

export const getNotificationPreferences = async (): Promise<NotificationPreference[]> => {
  const response = await axios.get<NotificationPreference[]>(
    "/api/v1/users/me/notification-preferences",
  );
  return response.data ?? [];
};

export const updateNotificationPreferences = async (
  preferences: NotificationPreference[]
): Promise<NotificationPreference[]> => {
  const response = await axios.put<NotificationPreference[]>(
    "/api/v1/users/me/notification-preferences",
    preferences,
  );
  return response.data;
};
