import { apiClient } from "./client";
import { ENDPOINTS, BASE_URL } from "./endpoints";
import type {
  NewsPost,
  NewsListResponse,
  CreateNewsPayload,
  UpdateNewsPayload,
  NewsCategory,
  NewsStatus,
} from "@/types/news";

export interface ListNewsParams {
  category?: NewsCategory;
  status?: NewsStatus;
  page?: number;
  limit?: number;
}

// ─── SSR-compatible (Server Components) ──────────────────────────────────────

export async function fetchNewsList(
  params: ListNewsParams = {},
  options: RequestInit = {},
): Promise<NewsListResponse> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${BASE_URL}${ENDPOINTS.NEWS.LIST}${query.size > 0 ? `?${query}` : ""}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được danh sách bản tin");

  return json.data as NewsListResponse;
}

export async function fetchNewsDetail(
  id: string,
  options: RequestInit = {},
): Promise<NewsPost> {
  const url = `${BASE_URL}${ENDPOINTS.NEWS.DETAIL(id)}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được bài bản tin");

  return json.data.item as NewsPost;
}

// ─── Client-side (Admin — authenticated) ─────────────────────────────────────

export function adminFetchNewsList(params: ListNewsParams = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.size > 0 ? `?${query}` : "";
  return apiClient.get<NewsListResponse>(`${ENDPOINTS.NEWS.ADMIN_LIST}${qs}`);
}

export function adminCreateNews(payload: CreateNewsPayload) {
  return apiClient.post<{ item: NewsPost }>(ENDPOINTS.NEWS.ADMIN_CREATE, payload);
}

export function adminUpdateNews(id: string, payload: UpdateNewsPayload) {
  return apiClient.patch<{ item: NewsPost }>(ENDPOINTS.NEWS.ADMIN_UPDATE(id), payload);
}

export function adminDeleteNews(id: string) {
  return apiClient.delete(ENDPOINTS.NEWS.ADMIN_DELETE(id));
}

export function adminTogglePinNews(id: string) {
  return apiClient.patch<{ item: NewsPost }>(ENDPOINTS.NEWS.ADMIN_TOGGLE_PIN(id));
}
