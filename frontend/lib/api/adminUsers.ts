import { BASE_URL } from "./endpoints";
import { ApiError } from "./client";
import type { AdminUserSummary } from "./admin";

export interface ListUsersParams {
  role?: string;
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
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${BASE_URL}/api/v1/admin/users${query.size > 0 ? `?${query}` : ""}`;
  const res = await fetch(url, { ...options, cache: "no-store" });

  if (res.status === 401) throw new ApiError(401, "Chưa đăng nhập");
  if (res.status === 403) throw new ApiError(403, "Không có quyền truy cập");

  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json.message || "Đã xảy ra lỗi");

  return json.data as ListUsersResult;
}

export async function getAdminUser(
  id: string,
  options: RequestInit = {},
): Promise<AdminUserSummary> {
  const url = `${BASE_URL}/api/v1/admin/users/${id}`;
  const res = await fetch(url, { ...options, cache: "no-store" });

  if (res.status === 401) throw new ApiError(401, "Chưa đăng nhập");
  if (res.status === 403) throw new ApiError(403, "Không có quyền truy cập");
  if (res.status === 404) throw new ApiError(404, "Không tìm thấy người dùng");

  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json.message || "Đã xảy ra lỗi");

  return json.data.user as AdminUserSummary;
}
