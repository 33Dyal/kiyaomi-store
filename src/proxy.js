import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/tokens";

/**
 * Route guard for /account/* and /admin/*, using Next.js 16's `proxy`
 * convention (the renamed successor to middleware.js — see
 * nextjs.org/docs/messages/middleware-to-proxy). Unlike old Edge
 * middleware, proxy always runs on the Node runtime, so it can reuse the
 * exact same jsonwebtoken-based verifyAccessToken() as every API route
 * instead of a separate Edge-safe JWT library.
 *
 * This is a coarse gate only — every API route still independently
 * re-verifies via lib/auth/session as the real source of truth. A request
 * that slips past proxy for any reason still can't act as another user or
 * as an admin, because nothing downstream trusts proxy's decision alone.
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("kiyomi_access_token")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account") || pathname.startsWith("/checkout");
  if (!isAdminRoute && !isAccountRoute) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
  }

  try {
    const payload = verifyAccessToken(token);
    if (isAdminRoute && payload.role !== "ADMIN" && payload.role !== "STAFF") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
  }
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*"],
};
