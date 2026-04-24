import { apiClient } from "./client";
import { BASE_URL, ENDPOINTS } from "./endpoints";
import type { PostComment } from "@/types/comment";

export async function fetchComments(
  postId: string,
  options: RequestInit = {},
): Promise<PostComment[]> {
  const url = `${BASE_URL}${ENDPOINTS.COMMENTS.LIST(postId)}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tải được bình luận");
  return json.data.comments as PostComment[];
}

export function createComment(postId: string, content: string, images: string[] = []) {
  return apiClient.post<{ comment: PostComment }>(
    ENDPOINTS.COMMENTS.CREATE(postId),
    { content, images },
  );
}

export function deleteComment(postId: string, commentId: string) {
  return apiClient.delete(ENDPOINTS.COMMENTS.DELETE(postId, commentId));
}
