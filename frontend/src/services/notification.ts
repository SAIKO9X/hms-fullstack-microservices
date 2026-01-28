import api from "@/config/axios";
import type { Notification } from "@/types/notification.types";

// NOTIFICATIONS
export const getUserNotifications = async (
  userId: number,
): Promise<Notification[]> => {
  const { data } = await api.get<Notification[]>(
    `/notifications/user/${userId}`,
  );
  return data;
};

export const markAsRead = async (notificationId: number): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (userId: number): Promise<void> => {
  await api.patch(`/notifications/user/${userId}/read-all`);
};
