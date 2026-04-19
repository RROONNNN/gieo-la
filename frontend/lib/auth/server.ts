import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import type { UserRole } from "@/types/enums";
import type { SafeUser } from "@/types/user";
import { BASE_URL, ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";

interface JwtPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

interface ViewerInfo {
  _id: string;
  role: UserRole;
}

/**
 * Reads the JWT stored in the httpOnly cookie server-side.
 * Returns minimal viewer info (id + role) or null if not authenticated.
 * Verification is handled by the backend protect middleware on every API call.
 */
export async function getCurrentUserFromCookie(): Promise<ViewerInfo | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("la_lanh_token")?.value;

  if (!token) return null;

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload?.id) return null;
    return { _id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

/** Returns the raw JWT string for server-side API calls. */
export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("la_lanh_token")?.value ?? null;
}

/**
 * Returns the token for server components inside protected routes.
 * Middleware already guarantees the cookie exists for /admin/* — use ! assertion.
 * For non-admin pages that still need a token guard, this also redirects to /login.
 */
export async function requireToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("la_lanh_token")?.value;
  if (!token) redirect("/login");
  return token;
}

/**
 * Handles ApiError responses from server-side API calls.
 * 401 → redirect /login, 403 → redirect /, 404 → notFound().
 * Re-throws anything else.
 */
export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect("/login");
    if (error.status === 403) redirect("/");
    if (error.status === 404) notFound();
  }
  throw error;
}

/**
 * Fetches the latest user data from the backend API using the cookie token.
 * Use this when you need the current role/verificationStatus from the DB,
 * not the (potentially stale) role encoded in the JWT.
 * Returns null if unauthenticated or request fails.
 */
export async function getFreshUserFromApi(): Promise<SafeUser | null> {
  const token = await getTokenFromCookie();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    return (json.data?.user ?? json.user ?? null) as SafeUser | null;
  } catch {
    return null;
  }
}
