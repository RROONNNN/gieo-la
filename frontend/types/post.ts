import type {
  PostCategory,
  PostCondition,
  PostStatus,
} from "./enums";
import type { UserRef } from "./user";

export interface PostLocation {
  city: string | null;
  district: string | null;
  detail: string | null;
}

export interface Post {
  _id: string;
  author: UserRef;
  title: string;
  category: PostCategory;
  quantity: number;
  condition: PostCondition;
  conditionNote: string | null;
  images: string[];
  description: string | null;
  status: PostStatus;
  isPinned: boolean;
  selectedApplicant: UserRef | string | null;
  receiverConfirmed: boolean;
  receiverConfirmedAt: string | null;
  location: PostLocation;
  likes: string[];
  likesCount: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePostPayload {
  title: string;
  category: PostCategory;
  quantity: number;
  condition: PostCondition;
  conditionNote?: string;
  images: string[];
  description?: string;
  location?: {
    city?: string;
    district?: string;
    detail?: string;
  };
}

export interface UpdatePostPayload {
  title?: string;
  category?: PostCategory;
  quantity?: number;
  condition?: PostCondition;
  conditionNote?: string;
  images?: string[];
  description?: string;
  location?: {
    city?: string;
    district?: string;
    detail?: string;
  };
}
