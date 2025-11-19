import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "red" | "orange";
  isLoading: boolean;
  description?: string;
  trend?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
  description,
  trend,
}: StatCardProps) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      icon: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500/10 to-blue-600/5",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      icon: "text-green-600 dark:text-green-400",
      gradient: "from-green-500/10 to-green-600/5",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      icon: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500/10 to-purple-600/5",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      icon: "text-red-600 dark:text-red-400",
      gradient: "from-red-500/10 to-red-600/5",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      icon: "text-orange-600 dark:text-orange-400",
      gradient: "from-orange-500/10 to-orange-600/5",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none shadow-md group">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <div
          className={`p-3 rounded-xl ${colors.bg} transition-all duration-300 group-hover:scale-110`}
        >
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold tracking-tight">{value}</div>
              {trend && (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>{trend}</span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
