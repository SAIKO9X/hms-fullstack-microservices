import type { LucideIcon } from "lucide-react";

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
  className?: string;
}

export function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: InfoItemProps) {
  if (!value) return null;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg bg-muted/50 ${className}`}
    >
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
