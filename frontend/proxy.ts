import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const ADMIN_PREFIXES = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("la_lanh_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For admin routes, decode the JWT payload to check role claim (no secret
  // needed for the public base64 payload — actual authorization enforced by BE).
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (isAdminRoute) {
    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(
        Buffer.from(payloadBase64, "base64url").toString("utf-8"),
      ) as { role?: string };
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
