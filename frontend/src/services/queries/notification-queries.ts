import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { NotificationService } from "@/services";

// === QUERY KEYS ===
export const notificationKeys = {
  all: ["notifications"] as const,
  user: (userId: number) => [...notificationKeys.all, "user", userId] as const,
};

// === QUERIES ===
export const useUserNotifications = (userId: number | undefined) => {
  return useQuery({
    queryKey: notificationKeys.user(userId!),
    queryFn: () => NotificationService.getUserNotifications(userId!),
    enabled: !!userId,
    refetchInterval: 30000,
  });
};

// === MUTATIONS ===
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
