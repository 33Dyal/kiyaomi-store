import { cookies } from "next/headers";
import { verifyAccessToken } from "./tokens";
import { prisma } from "@/lib/db/prisma";

const ACCESS_COOKIE = "kiyomi_access_token";
const REFRESH_COOKIE = "kiyomi_refresh_token";

export const cookieNames = { ACCESS_COOKIE, REFRESH_COOKIE };

/**
 * Reads and verifies the current request's access token from an HTTP-only
 * cookie. Returns null (not an error) when unauthenticated — callers decide
 * whether that's acceptable (public route) or not (see requireUser/requireRole).
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || user.deletedAt) return null;
    return user;
  } catch {
    return null; // expired/invalid — caller should hit /api/auth/refresh
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("Authentication required");
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireRole(...roles) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    const err = new Error("Insufficient permissions");
    err.status = 403;
    throw err;
  }
  return user;
}
