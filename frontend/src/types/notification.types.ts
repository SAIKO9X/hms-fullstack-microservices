export interface ActionNotification {
  variant: "success" | "error" | "info";
  title: string;
  description?: string;
}

export const isValidNotification = (
  notification: ActionNotification | null,
): notification is ActionNotification => {
  return (
    notification !== null &&
    typeof notification.title === "string" &&
    notification.title.length > 0
  );
};

export const createSuccessNotification = (
  title: string,
  description?: string,
): ActionNotification => ({
  variant: "success",
  title,
  description,
});

export const createErrorNotification = (
  title: string,
  description?: string,
): ActionNotification => ({
  variant: "error",
  title,
  description,
});

export const createInfoNotification = (
  title: string,
  description?: string,
): ActionNotification => ({
  variant: "info",
  title,
  description,
});

export const NotificationType = {
  APPOINTMENT_REMINDER: "APPOINTMENT_REMINDER",
  STATUS_CHANGE: "STATUS_CHANGE",
  WAITLIST_ALERT: "WAITLIST_ALERT",
  LAB_RESULT: "LAB_RESULT",
  PRESCRIPTION: "PRESCRIPTION",
  NEW_MESSAGE: "NEW_MESSAGE",
  SYSTEM_ALERT: "SYSTEM_ALERT",
  LOW_STOCK: "LOW_STOCK",
  NEW_REVIEW: "NEW_REVIEW",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
