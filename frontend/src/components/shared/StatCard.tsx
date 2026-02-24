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
  styleType?: "default" | "gradient";
}

const variantStyles = {
  default: "text-primary bg-primary/10",
  blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  green: "text-green-600 bg-green-100 dark:bg-green-900/30",
  red: "text-red-600 bg-red-100 dark:bg-red-900/30",
  purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
};

const gradientStyles = {
  default: "from-slate-500 to-slate-600",
  blue: "from-blue-500 to-cyan-600",
  green: "from-emerald-500 to-teal-600",
  red: "from-rose-500 to-pink-600",
  purple: "from-violet-500 to-purple-600",
  yellow: "from-orange-500 to-amber-600",
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
  styleType = "default",
}: StatCardProps) => {
  if (styleType === "gradient") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg",
          gradientStyles[variant],
          className,
        )}
      >
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-white/30" />
            <Skeleton className="h-8 w-16 bg-white/30" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                {title}
              </p>
              <div className="rounded-xl bg-white/20 p-2">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold leading-none">{value}</p>
              {(unit || description) && (
                <p className="text-xs text-white/70 mt-1">
                  {unit} {description && `• ${description}`}
                </p>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -right-1 h-16 w-16 rounded-full bg-white/5" />
          </>
        )}
      </div>
    );
  }

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
