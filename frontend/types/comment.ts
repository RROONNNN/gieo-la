import type { UserRef } from "./user";

export interface PostComment {
  _id: string;
  post: string;
  author: UserRef;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}
