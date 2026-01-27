import type { Notification } from "@/types/notification.types";
import { NotificationType } from "@/types/notification.types";
import { cn } from "@/utils/utils";
import {
  Calendar,
  Clock,
  FileText,
  MessageCircle,
  Pill,
  AlertTriangle,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
}

const NOTIFICATION_ICONS: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; colorClass: string }
> = {
  [NotificationType.APPOINTMENT_REMINDER]: {
    icon: Clock,
    colorClass: "text-blue-500",
  },
  [NotificationType.STATUS_CHANGE]: {
    icon: Info,
    colorClass: "text-indigo-500",
  },
  [NotificationType.WAITLIST_ALERT]: {
    icon: Calendar,
    colorClass: "text-green-500",
  },
  [NotificationType.LAB_RESULT]: {
    icon: FileText,
    colorClass: "text-purple-500",
  },
  [NotificationType.PRESCRIPTION]: {
    icon: Pill,
    colorClass: "text-red-500",
  },
  [NotificationType.NEW_MESSAGE]: {
    icon: MessageCircle,
    colorClass: "text-orange-500",
  },
  [NotificationType.SYSTEM_ALERT]: {
    icon: AlertTriangle,
    colorClass: "text-yellow-500",
  },
};

export const NotificationItem = ({
  notification,
  onRead,
}: NotificationItemProps) => {
  const iconConfig = NOTIFICATION_ICONS[notification.type] || {
    icon: Info,
    colorClass: "text-gray-500",
  };

  const Icon = iconConfig.icon;

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={notification.read}
      className={cn(
        "w-full flex gap-3 p-3 border-b last:border-0 transition-colors text-left",
        "hover:bg-muted/50 focus:outline-none focus:bg-muted/50",
        !notification.read
          ? "bg-blue-50/50 dark:bg-blue-900/10 cursor-pointer"
          : "cursor-default bg-transparent",
      )}
    >
      <div className="mt-1 flex-shrink-0">
        <Icon className={cn("h-4 w-4", iconConfig.colorClass)} />
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-none",
              !notification.read && "text-primary",
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span
              className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"
              aria-label="Não lida"
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 break-words">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/70 pt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
    </button>
  );
};
