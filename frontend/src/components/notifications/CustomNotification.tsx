import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

interface NotificationProps {
  variant: "success" | "error" | "info";
  title: string;
  description?: string;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  onDismiss?: () => void;
}

const notificationConfig = {
  success: {
    Icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-900/10",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-800 dark:text-green-300",
    textColor: "text-green-700 dark:text-green-300",
    progressColor: "bg-green-300 dark:bg-green-700",
  },
  error: {
    Icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-900/10",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-800 dark:text-red-300",
    textColor: "text-red-700 dark:text-red-300",
    progressColor: "bg-red-300 dark:bg-red-700",
  },
  info: {
    Icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-900/10",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-800 dark:text-blue-300",
    textColor: "text-blue-700 dark:text-blue-300",
    progressColor: "bg-blue-300 dark:bg-blue-700",
  },
};

export const CustomNotification = ({
  variant,
  title,
  description,
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000,
  onDismiss,
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const config = notificationConfig[variant];

  useEffect(() => {
    if (autoHide && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, isVisible]);

  useEffect(() => {
    if (autoHide && isVisible) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const decrement = (100 / autoHideDelay) * 50;
          return Math.max(prev - decrement, 0);
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [autoHide, autoHideDelay, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !title) return null;

  return (
    <div
      className={`
        relative w-full rounded-lg border p-4 transition-all duration-300
        ${config.bgColor} ${config.borderColor}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className="flex-shrink-0">
          <config.Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${config.titleColor} break-words`}>
            {title}
          </h4>

          {description && (
            <div
              className={`mt-2 text-sm ${config.textColor} break-words whitespace-pre-wrap`}
            >
              {description}
            </div>
          )}
        </div>

        {/* Botão de fechar */}
        {dismissible && (
          <div className="flex-shrink-0">
            <button
              onClick={handleDismiss}
              className={`
                rounded-md p-1.5 transition-colors
                hover:bg-black/5 dark:hover:bg-white/10
                ${config.textColor}
              `}
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Barra de progresso controlada pelo estado do React */}
      {autoHide && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div
            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
