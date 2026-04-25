import "server-only";

import type { AdminUserSummary } from "./admin";
import { serverApiData } from "./serverRequest";

export interface ListUsersParams {
  role?: string;
  search?: string;
  verificationStatus?: string;
  accountStatus?: string;
  page?: number;
  limit?: number;
}

export interface ListUsersResult {
  users: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
}

export async function listAdminUsers(
  params: ListUsersParams = {},
  options: RequestInit = {},
): Promise<ListUsersResult> {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.search) query.set("search", params.search);
  if (params.verificationStatus) query.set("verificationStatus", params.verificationStatus);
  if (params.accountStatus) query.set("accountStatus", params.accountStatus);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const endpoint = `/api/v1/admin/users${query.size > 0 ? `?${query}` : ""}`;
  return serverApiData<ListUsersResult>(endpoint, options);
}

export async function getAdminUser(
  id: string,
  options: RequestInit = {},
): Promise<AdminUserSummary> {
  const data = await serverApiData<{ user: AdminUserSummary }>(
    `/api/v1/admin/users/${id}`,
    options,
  );
  return data.user;
}