import type { ApiResponse } from "@/types/api";
import { BASE_URL, ENDPOINTS } from "./endpoints";

// ── In-memory access token store ─────────────────────────────────────────────
// Never written to localStorage — survives only in the current JS context.
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ── Error class ───────────────────────────────────────────────────────────────
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (_accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // send httpOnly refresh token cookie automatically
  });

  const data: ApiResponse<T> = await response.json();

  // ── 401: attempt silent token refresh then retry once ──────────────────────
  // Skip retry + redirect if THIS request is the refresh token endpoint itself
  // (avoids infinite redirect loop when there is no valid refresh token cookie)
  if (response.status === 401 && endpoint === ENDPOINTS.AUTH.REFRESH_TOKEN) {
    throw new ApiError(401, data.message || "Phiên đăng nhập đã hết hạn");
  }

  if (response.status === 401 && retry && typeof window !== "undefined") {
    const refreshed = await silentRefresh();
    if (refreshed) {
      return request<T>(endpoint, options, false);
    }
    // Refresh also failed — redirect to login
    window.location.href = "/login";
    throw new ApiError(401, data.message || "Phiên đăng nhập đã hết hạn");
  }

  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
    throw new ApiError(401, data.message || "Phiên đăng nhập đã hết hạn");
  }

  if (response.status === 403 && typeof window !== "undefined") {
    setAccessToken(null);
    window.dispatchEvent(new Event("auth:logout"));
    const message =
      data.message ||
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
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

/**
 * Calls POST /auth/refresh-token using the httpOnly cookie.
 * On success, updates the in-memory access token and the SSR mirror cookie.
 * Returns true if refresh succeeded, false otherwise.
 */
async function silentRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return false;

    const data = await res.json();
    const token: string | undefined = data?.data?.token;
    if (!token) return false;

    setAccessToken(token);
    // Mirror short-lived access token to cookie for SSR Server Components (15 min)
    document.cookie = `la_lanh_token=${token}; path=/; SameSite=Lax; Max-Age=900`;
    return true;
  } catch {
    return false;
  }
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
