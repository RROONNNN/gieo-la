import "server-only";

import { cookies } from "next/headers";
import type { ApiResponse } from "@/types/api";
import { ApiError } from "./client";
import { BASE_URL } from "./endpoints";

interface ServerRequestOptions {
  requireAuth?: boolean;
}

function mergeHeaders(base?: HeadersInit, token?: string | null): Headers {
  const headers = new Headers(base);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

 async function serverApiRequest<T>(
  endpoint: string,
  init: RequestInit = {},
  options: ServerRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { requireAuth = true } = options;
  const token = (await cookies()).get("la_lanh_token")?.value ?? null;

  if (requireAuth && !token) {
    throw new ApiError(401, "Chưa đăng nhập");
  }

  const headers = mergeHeaders(init.headers, token);

  // Only set JSON content-type when body is present and caller did not provide one.
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...init,
      headers,
      cache: init.cache ?? "no-store",
    });
  } catch (error) {
    throw new Error("Không thể kết nối đến máy chủ");
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error || payload?.message || "Đã xảy ra lỗi",
    );
  }

  if (!payload) {
    throw new Error("Phản hồi không hợp lệ từ máy chủ");
  }

  return payload;
}

export async function serverApiData<T>(
  endpoint: string,
  init: RequestInit = {},
  options: ServerRequestOptions = {},
): Promise<T> {
  const response = await serverApiRequest<T>(endpoint, init, options);
  return response.data;
}
