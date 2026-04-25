import { apiClient } from "./client";
import { ENDPOINTS, BASE_URL } from "./endpoints";
import type {
  Post,
  PostListResponse,
  CreatePostPayload,
  UpdatePostPayload,
} from "@/types/post";
import type { PostCategory, PostStatus } from "@/types/enums";

export interface ListPostsParams {
  category?: PostCategory;
  status?: PostStatus;
  search?: string;
  mine?: boolean;
  page?: number;
  limit?: number;
}

// ─── Public (SSR-compatible) ──────────────────────────────────────────────────

export async function fetchPosts(
  params: ListPostsParams = {},
  options: RequestInit = {},
): Promise<PostListResponse> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.mine) query.set("mine", "true");
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${BASE_URL}${ENDPOINTS.POSTS.LIST}${query.size > 0 ? `?${query}` : ""}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được danh sách bài đăng");

  return json.data as PostListResponse;
}

export async function fetchPost(
  id: string,
  options: RequestInit = {},
): Promise<Post> {
  const url = `${BASE_URL}${ENDPOINTS.POSTS.DETAIL(id)}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được bài đăng");

  return json.data.post as Post;
}

// ─── Client-side (authenticated) ─────────────────────────────────────────────

export function createPost(payload: CreatePostPayload) {
  return apiClient.post<{ post: Post }>(ENDPOINTS.POSTS.CREATE, payload);
}

export function updatePost(id: string, payload: UpdatePostPayload) {
  return apiClient.patch<{ post: Post }>(ENDPOINTS.POSTS.UPDATE(id), payload);
}

export function deletePost(id: string) {
  return apiClient.delete(ENDPOINTS.POSTS.DELETE(id));
}

export function updatePostStatus(id: string, status: PostStatus) {
  return apiClient.patch<{ post: Post }>(
    ENDPOINTS.POSTS.UPDATE_STATUS(id),
    { status },
  );
}

export function toggleLikePost(id: string) {
  return apiClient.post<{ liked: boolean; likesCount: number }>(
    ENDPOINTS.POSTS.LIKE(id),
  );
}

// ─── SSR with auth (mine filter) ─────────────────────────────────────────────

export async function fetchMyPostsServer(
  token: string,
  params: Omit<ListPostsParams, "mine"> = {},
): Promise<PostListResponse> {
  const query = new URLSearchParams({ mine: "true" });
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${BASE_URL}${ENDPOINTS.POSTS.LIST}?${query}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được danh sách bài đăng");

  return json.data as PostListResponse;
}
