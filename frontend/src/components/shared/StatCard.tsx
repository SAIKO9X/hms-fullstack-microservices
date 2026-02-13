import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  unit?: string;
  description?: string;
  loading?: boolean;
  className?: string;
  variant?: "default" | "blue" | "green" | "red" | "purple" | "yellow";
}

const variantStyles = {
  default: "text-primary bg-primary/10",
  blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  green: "text-green-600 bg-green-100 dark:bg-green-900/30",
  red: "text-red-600 bg-red-100 dark:bg-red-900/30",
  purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  unit,
  description,
  loading,
  className,
  variant = "default",
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full", variantStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            {description && <Skeleton className="h-3 w-32" />}
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{value}</span>
              {unit && (
                <span className="text-sm font-medium text-muted-foreground">
                  {unit}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
