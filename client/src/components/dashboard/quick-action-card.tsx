import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickActionCardProps {
  title: string;
  statusLine: string;
  icon: LucideIcon;
  to: string;
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}

const iconVariants = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
} as const;

export function QuickActionCard({
  title,
  statusLine,
  icon: Icon,
  to,
  variant = "default",
  className,
}: QuickActionCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative flex items-center gap-4 rounded-xl border border-border bg-card p-4",
        "transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-border/80",
        "active:scale-[0.98]",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
          iconVariants[variant],
        )}
      >
        <Icon className="size-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[13px] text-muted-foreground truncate mt-0.5">
          {statusLine}
        </p>
      </div>

      <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
