import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const statusDot = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  info: "bg-info",
} as const;

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <span className="text-xl">📋</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No recent activity yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          It'll show up here as you use the system
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const dotColor = statusDot[item.status ?? "info"];

        return (
          <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
            )}

            {/* Dot */}
            <div className="relative z-10 mt-1.5 shrink-0">
              <div className={cn("size-[15px] rounded-full border-2 border-background", dotColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm text-foreground leading-snug">
                {item.message}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRelativeTime(item.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
