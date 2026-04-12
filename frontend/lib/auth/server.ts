import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import type { UserRole } from "@/types/enums";

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
