import type { PostCategory } from "./enums";
import type { UserRef } from "./user";

export interface WishlistPost {
  _id: string;
  author: UserRef & { verificationStatus?: string };
  title: string;
  category: PostCategory;
  quantity: number;
  images: string[];
  description: string | null;
  status: "open" | "fulfilled";
  isPinned: boolean;
  likes: string[];
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistListResponse {
  items: WishlistPost[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateWishlistPayload {
  title: string;
  category: PostCategory;
  quantity: number;
  images: string[];
  description?: string;
}
