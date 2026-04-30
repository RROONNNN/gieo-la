import "server-only";

import { ENDPOINTS } from "./endpoints";
import { serverApiData } from "./serverRequest";
import type { NewsPost, NewsListResponse, NewsCategory, NewsStatus } from "@/types/news";

export interface AdminListNewsParams {
  category?: NewsCategory;
  status?: NewsStatus;
  page?: number;
  limit?: number;
}

export async function adminListNewsServer(
  params: AdminListNewsParams = {},
  options: RequestInit = {},
): Promise<NewsListResponse> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  query.set("limit", String(params.limit ?? 50));

  return serverApiData<NewsListResponse>(
    `${ENDPOINTS.NEWS.ADMIN_LIST}?${query}`,
    options,
  );
}

export async function adminGetNewsServer(
  id: string,
  options: RequestInit = {},
): Promise<NewsPost> {
  const data = await serverApiData<{ item: NewsPost }>(
    ENDPOINTS.NEWS.ADMIN_GET(id),
    options,
  );
  return data.item;
}
