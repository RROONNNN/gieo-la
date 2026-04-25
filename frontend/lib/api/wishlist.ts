import { apiClient } from "./client";
import { ENDPOINTS, BASE_URL } from "./endpoints";
import type {
  WishlistPost,
  WishlistListResponse,
  CreateWishlistPayload,
} from "@/types/wishlist";
import type { PostCategory } from "@/types/enums";

export interface ListWishlistParams {
  category?: PostCategory;
  status?: "open" | "fulfilled";
  page?: number;
  limit?: number;
}

// ─── SSR-compatible ───────────────────────────────────────────────────────────

export async function fetchWishlist(
  params: ListWishlistParams = {},
  options: RequestInit = {},
): Promise<WishlistListResponse> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${BASE_URL}${ENDPOINTS.WISHLIST.LIST}${query.size > 0 ? `?${query}` : ""}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được danh sách wishlist");

  return json.data as WishlistListResponse;
}

export async function fetchWishlistItem(
  id: string,
  options: RequestInit = {},
): Promise<WishlistPost> {
  const url = `${BASE_URL}${ENDPOINTS.WISHLIST.DETAIL(id)}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được wishlist");

  return json.data.item as WishlistPost;
}

// ─── Client-side (authenticated) ─────────────────────────────────────────────

export function createWishlist(payload: CreateWishlistPayload) {
  return apiClient.post<{ item: WishlistPost }>(ENDPOINTS.WISHLIST.CREATE, payload);
}

export function deleteWishlist(id: string) {
  return apiClient.delete(ENDPOINTS.WISHLIST.DELETE(id));
}

export function toggleLikeWishlist(id: string) {
  return apiClient.post<{ liked: boolean; likesCount: number }>(
    ENDPOINTS.WISHLIST.LIKE(id),
  );
}
