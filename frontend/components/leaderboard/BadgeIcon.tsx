"use client";

import { Crown, Medal, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeType } from "@/types/enums";

interface BadgeIconProps {
  badge: BadgeType;
  /** "icon" shows only the icon, "chip" shows a pill with icon + label. */
  variant?: "icon" | "chip";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Override visible label (otherwise uses the tier label). */
  label?: string;
}

interface TierConfig {
  Icon: LucideIcon;
  label: string;
  /** Foreground color for the glyph. */
  iconClass: string;
  /** Background + border + text combo used in the "chip" variant. */
  chipClass: string;
}

const TIER: Record<Exclude<BadgeType, "none">, TierConfig> = {
  gold: {
    Icon: Crown,
    label: "Đại sứ Lá Lành",
    iconClass: "text-amber-500",
    chipClass:
      "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
  },
  silver: {
    Icon: Medal,
    label: "Lá Lành Tích Cực",
    iconClass: "text-slate-500",
    chipClass:
      "bg-slate-50 text-slate-700 border-slate-200 ring-slate-400/20",
  },
  bronze: {
    Icon: Award,
    label: "Mầm Lành Năng Nổ",
    iconClass: "text-orange-500",
    chipClass:
      "bg-orange-50 text-orange-700 border-orange-200 ring-orange-400/20",
  },
};

const ICON_SIZE: Record<NonNullable<BadgeIconProps["size"]>, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

const CHIP_SIZE: Record<NonNullable<BadgeIconProps["size"]>, string> = {
  sm: "h-5 px-1.5 text-[10px] gap-1",
  md: "h-6 px-2 text-xs gap-1",
  lg: "h-7 px-2.5 text-sm gap-1.5",
};

export function BadgeIcon({
  badge,
  variant = "icon",
  size = "md",
  className,
  label,
}: BadgeIconProps) {
  if (badge === "none") return null;
  const tier = TIER[badge];
  const { Icon } = tier;
  const displayLabel = label ?? tier.label;

  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border font-medium ring-1 ring-inset",
          tier.chipClass,
          CHIP_SIZE[size],
          className,
        )}
        title={displayLabel}
        aria-label={displayLabel}
      >
        <Icon className={cn(ICON_SIZE[size], tier.iconClass)} aria-hidden />
        <span className="whitespace-nowrap">{displayLabel}</span>
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      title={displayLabel}
      aria-label={displayLabel}
      role="img"
    >
      <Icon className={cn(ICON_SIZE[size], tier.iconClass)} aria-hidden />
    </span>
  );
}

export type { BadgeTierMeta } from "./badgeMeta";
export { BADGE_TIER_META } from "./badgeMeta";
