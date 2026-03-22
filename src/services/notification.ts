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
