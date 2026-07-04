import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
  },
  success: {
    icon: "bg-success/10 text-success",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
  },
  info: {
    icon: "bg-info/10 text-info",
  },
} as const;

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5 transition-all",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-border/80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[13px] font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {description && (
            <p className="text-[13px] text-muted-foreground truncate">
              {description}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-success" : "text-destructive",
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            styles.icon,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
