import "server-only";

import { ENDPOINTS } from "./endpoints";
import { serverApiData } from "./serverRequest";
import type { Post } from "@/types/post";

export interface ListAdminPostsParams {
  status?: string;
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ListAdminPostsResult {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export async function listAdminPostsServer(
  params: ListAdminPostsParams = {},
  options: RequestInit = {},
): Promise<ListAdminPostsResult> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.page) query.set("page", String(params.page));
  query.set("limit", String(params.limit ?? 20));

  return serverApiData<ListAdminPostsResult>(
    `${ENDPOINTS.ADMIN_POSTS.LIST}?${query}`,
    options,
  );
}