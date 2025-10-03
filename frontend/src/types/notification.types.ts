// Tipos para as notificações da aplicação
export interface ActionNotification {
  variant: "success" | "error" | "info";
  title: string;
  description?: string;
}

// Type guard para verificar se a notificação é válida
export const isValidNotification = (
  notification: ActionNotification | null
): notification is ActionNotification => {
  return (
    notification !== null &&
    typeof notification.title === "string" &&
    notification.title.length > 0
  );
};

// Helpers para criar notificações específicas
export const createSuccessNotification = (
  title: string,
  description?: string
): ActionNotification => ({
  variant: "success",
  title,
  description,
});

export const createErrorNotification = (
  title: string,
  description?: string
): ActionNotification => ({
  variant: "error",
  title,
  description,
});

export const createInfoNotification = (
  title: string,
  description?: string
): ActionNotification => ({
  variant: "info",
  title,
  description,
});
