import { apiClient } from "./client";
import { BASE_URL, ENDPOINTS } from "./endpoints";
import type { PostComment } from "@/types/comment";

export async function fetchWishlistComments(
  wishlistId: string,
  options: RequestInit = {},
): Promise<PostComment[]> {
  const url = `${BASE_URL}${ENDPOINTS.WISHLIST_COMMENTS.LIST(wishlistId)}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tải được bình luận");
  return json.data.comments as PostComment[];
}

export function createWishlistComment(
  wishlistId: string,
  content: string,
  images: string[] = [],
) {
  return apiClient.post<{ comment: PostComment }>(
    ENDPOINTS.WISHLIST_COMMENTS.CREATE(wishlistId),
    { content, images },
  );
}

export function deleteWishlistComment(wishlistId: string, commentId: string) {
  return apiClient.delete(
    ENDPOINTS.WISHLIST_COMMENTS.DELETE(wishlistId, commentId),
  );
}
