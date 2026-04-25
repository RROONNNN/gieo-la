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
  completedThisMonth: number;
  badge: BadgeType;
  badgeLabel: string;
}

export interface LeaderboardResponse {
  year: number;
  month: number;
  entries: LeaderboardEntry[];
}
