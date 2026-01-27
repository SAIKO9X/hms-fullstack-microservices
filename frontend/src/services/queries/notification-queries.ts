import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification";

export const notificationKeys = {
  all: ["notifications"] as const,
  user: (userId: number) => [...notificationKeys.all, "user", userId] as const,
};

export const useUserNotifications = (userId: number | undefined) => {
  return useQuery({
    queryKey: notificationKeys.user(userId!),
    queryFn: () => notificationService.getUserNotifications(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // atualiza a cada 30 segundos
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
