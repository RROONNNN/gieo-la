import type { BadgeType } from "@/types/enums";

export interface BadgeTierMeta {
  badge: Exclude<BadgeType, "none">;
  rangeLabel: string;
  label: string;
}

export const BADGE_TIER_META: BadgeTierMeta[] = [
  { badge: "gold", rangeLabel: "Top 1", label: "Đại sứ Lá Lành" },
  { badge: "silver", rangeLabel: "Top 2–5", label: "Lá Lành Tích Cực" },
  { badge: "bronze", rangeLabel: "Top 6–10", label: "Mầm Lành Năng Nổ" },
];
