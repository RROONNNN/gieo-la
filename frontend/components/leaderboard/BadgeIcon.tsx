"use client";

import type { BadgeType } from "@/types/enums";

interface BadgeIconProps {
  badge: BadgeType;
  showLabel?: boolean;
}

const CONFIG: Record<
  Exclude<BadgeType, "none">,
  { emoji: string; label: string; className: string }
> = {
  gold: {
    emoji: "👑",
    label: "Đại sứ Lá Lành",
    className: "text-amber-500",
  },
  silver: {
    emoji: "🥈",
    label: "Lá Lành Tích Cực",
    className: "text-slate-400",
  },
  bronze: {
    emoji: "🥉",
    label: "Mầm Lành Năng Nổ",
    className: "text-orange-400",
  },
};

export function BadgeIcon({ badge, showLabel = false }: BadgeIconProps) {
  if (badge === "none") return null;
  const config = CONFIG[badge];

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${config.className}`}
      title={config.label}
    >
      <span>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
