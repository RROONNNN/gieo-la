import type { ApiResponse } from "@/types/api";
import { BASE_URL } from "./endpoints";

const TOKEN_KEY = "la_lanh_token";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data: ApiResponse<T> = await response.json();

  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; Max-Age=0`;
    window.location.href = "/login";
    throw new ApiError(401, data.message || "Phiên đăng nhập đã hết hạn");
  }

  if (response.status === 403 && typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; Max-Age=0`;
    window.dispatchEvent(new Event("auth:logout"));
    let message = data.message || "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
    window.location.href = "/login?reason=" + message;
    throw new ApiError(403, message);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error || data.message || "Đã xảy ra lỗi",
    );
  }

  return data;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestInit) {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestInit) {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};

export { ApiError };
