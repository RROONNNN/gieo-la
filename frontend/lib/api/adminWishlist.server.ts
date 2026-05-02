import "server-only";

import { ENDPOINTS } from "./endpoints";
import { serverApiData } from "./serverRequest";
import type { WishlistPost } from "@/types/wishlist";

export interface ListAdminWishlistParams {
  category?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ListAdminWishlistResult {
  items: WishlistPost[];
  total: number;
  page: number;
  limit: number;
}

export async function listAdminWishlistServer(
  params: ListAdminWishlistParams = {},
  options: RequestInit = {},
): Promise<ListAdminWishlistResult> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.page) query.set("page", String(params.page));
  query.set("limit", String(params.limit ?? 20));

  return serverApiData<ListAdminWishlistResult>(
    `${ENDPOINTS.ADMIN_WISHLIST.LIST}?${query}`,
    options,
  );
}
