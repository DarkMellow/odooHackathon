import { cn } from "@/lib/utils";

const PASTEL_COLORS = [
  { bg: "bg-badge-orange/20", text: "text-badge-orange" },
  { bg: "bg-badge-pink/20", text: "text-badge-pink" },
  { bg: "bg-badge-violet/20", text: "text-badge-violet" },
  { bg: "bg-badge-emerald/20", text: "text-badge-emerald" },
] as const;

function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface InitialsAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

export function InitialsAvatar({
  name,
  imageUrl,
  size = "md",
  className,
}: InitialsAvatarProps) {
  const color = getColorFromName(name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "rounded-full object-cover shrink-0",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0 select-none",
        color.bg,
        color.text,
        sizeClasses[size],
        className,
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
