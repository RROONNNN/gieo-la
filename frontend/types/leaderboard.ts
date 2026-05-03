import type { BadgeType } from "./enums";

export interface LeaderboardUser {
  _id: string;
  name: string;
  avatar: string | null;
  role: string;
  badge: BadgeType;
}

export interface LeaderboardEntry {
  rank: number;
  user: LeaderboardUser;
  completedThisWeek: number;
  badge: BadgeType;
  badgeLabel: string;
}

export interface LeaderboardResponse {
  year: number;
  week: number;
  entries: LeaderboardEntry[];
}
