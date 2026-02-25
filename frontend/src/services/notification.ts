import api from "@/config/axios";
import type { ApiResponse } from "@/types/api.types";
import type { Notification } from "@/types/notification.types";

// NOTIFICATIONS
export const getUserNotifications = async (
  userId: string | number,
): Promise<Notification[]> => {
  const { data } = await api.get<ApiResponse<Notification[]>>(
    `/notifications/user/${userId}`,
  );
  return data.data;
};

export const markAsRead = async (notificationId: number): Promise<void> => {
  await api.patch<ApiResponse<void>>(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (userId: string | number): Promise<void> => {
  await api.patch<ApiResponse<void>>(`/notifications/user/${userId}/read-all`);
};
