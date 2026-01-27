import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import {
  useUserNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/services/queries/notification-queries";
import { NotificationItem } from "./NotificationItem";

export const NotificationsPopover = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading } = useUserNotifications(
    user?.id,
  );
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead.mutate(user.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-[10px] font-bold text-white border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <h4 className="font-semibold leading-none flex items-center gap-2">
            Notificações
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {unreadCount}
              </span>
            )}
          </h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Ler todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-2 text-sm text-muted-foreground">
                Carregando...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <Bell className="h-8 w-8 opacity-20" />
              <p className="text-sm">Nenhuma notificação encontrada.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
