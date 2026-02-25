import { useState } from "react";
import { useNavigate } from "react-router";
import type { Notification } from "@/types/notification.types";
import { NotificationType } from "@/types/notification.types";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  MessageCircle,
  Pill,
  AlertTriangle,
  Info,
  ChevronDown,
  PackagePlus,
  Eye,
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
  [NotificationType.PRESCRIPTION]: { icon: Pill, colorClass: "text-red-500" },
  [NotificationType.NEW_MESSAGE]: {
    icon: MessageCircle,
    colorClass: "text-orange-500",
  },
  [NotificationType.SYSTEM_ALERT]: {
    icon: AlertTriangle,
    colorClass: "text-yellow-500",
  },
  [NotificationType.LOW_STOCK]: {
    icon: AlertTriangle,
    colorClass: "text-red-600",
  },
  [NotificationType.NEW_REVIEW]: { icon: Info, colorClass: "text-yellow-400" },
};

export const NotificationItem = ({
  notification,
  onRead,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const iconConfig = NOTIFICATION_ICONS[notification.type] || {
    icon: Info,
    colorClass: "text-gray-500",
  };
  const Icon = iconConfig.icon;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!notification.read) onRead(notification.id);

    switch (notification.type) {
      case NotificationType.LOW_STOCK:
        const match = notification.message.match(/medicamento (.*?) atingiu/);
        const medicineName = match ? match[1] : "";

        navigate("/admin/medicines", {
          state: { prefillMedicine: medicineName },
        });
        break;

      case NotificationType.PRESCRIPTION:
        navigate("/patient/prescriptions");
        break;

      case NotificationType.LAB_RESULT:
        navigate("/patient/medical-history");
        break;

      default:
        break;
    }
  };

  return (
    <div
      onClick={handleToggleExpand}
      className={cn(
        "w-full flex flex-col p-3 border-b last:border-0 transition-colors text-left cursor-pointer",
        "hover:bg-muted/50 focus:outline-none",
        !notification.read
          ? "bg-blue-50/50 dark:bg-blue-900/10"
          : "bg-transparent",
      )}
    >
      <div className="flex gap-3">
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
            <div className="flex items-center gap-2 flex-shrink-0">
              {!notification.read && (
                <span
                  className="h-2 w-2 rounded-full bg-blue-500"
                  aria-label="Não lida"
                />
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180",
                )}
              />
            </div>
          </div>
          <p
            className={cn(
              "text-sm text-muted-foreground break-words transition-all",
              !isExpanded && "line-clamp-2",
            )}
          >
            {notification.message}
          </p>

          <p className="text-xs text-muted-foreground/70 pt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 ml-7 flex gap-2">
          {notification.type === NotificationType.LOW_STOCK && (
            <Button
              size="sm"
              onClick={handleActionClick}
              className="w-full text-xs h-8"
            >
              <PackagePlus className="mr-2 h-3 w-3" />
              Repor Estoque
            </Button>
          )}

          {notification.type === NotificationType.PRESCRIPTION && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleActionClick}
              className="w-full text-xs h-8"
            >
              <Eye className="mr-2 h-3 w-3" />
              Ver Receita
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
