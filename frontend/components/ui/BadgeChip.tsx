import type { BadgeType } from "@/types/enums";
import { cn } from "@/lib/utils";

interface BadgeChipProps {
  badge: BadgeType;
  className?: string;
}

const CONFIG: Record<
  Exclude<BadgeType, "none">,
  { emoji: string; label: string; bg: string; text: string }
> = {
  gold: {
    emoji: "👑",
    label: "Đại sứ Lá Lành",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  silver: {
    emoji: "🥈",
    label: "Lá Lành Tích Cực",
    bg: "bg-slate-50",
    text: "text-slate-500",
  },
  bronze: {
    emoji: "🥉",
    label: "Mầm Lành Năng Nổ",
    bg: "bg-orange-50",
    text: "text-orange-500",
  },
};

export function BadgeChip({ badge, className }: BadgeChipProps) {
  if (badge === "none") return null;
  const config = CONFIG[badge];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
        className,
      )}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
