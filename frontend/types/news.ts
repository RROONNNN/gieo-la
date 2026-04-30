import type { UserRef } from "./user";

export type NewsCategory = "announcement" | "story" | "guide" | "event";
export type NewsStatus = "draft" | "published" | "hidden";

export interface NewsPost {
  _id: string;
  title: string;
  thumbnail: string;
  content: string;
  category: NewsCategory;
  status: NewsStatus;
  publishedAt: string | null;
  author: UserRef;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  items: NewsPost[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateNewsPayload {
  title: string;
  thumbnail: string;
  content: string;
  category: NewsCategory;
  status?: NewsStatus;
  isPinned?: boolean;
}

export interface UpdateNewsPayload {
  title?: string;
  thumbnail?: string;
  content?: string;
  category?: NewsCategory;
  status?: NewsStatus;
  isPinned?: boolean;
}
