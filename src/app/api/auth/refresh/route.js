import { prisma } from "@/lib/db/prisma";
import { signAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/auth/tokens";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { cookieNames } from "@/lib/auth/session";
import { cookies } from "next/headers";

/**
 * Refresh-token rotation: the presented token is verified against its
 * stored hash, then immediately revoked and replaced with a new one. If a
 * revoked/unknown token is presented (possible token theft/replay), we
 * reject rather than silently issuing a new access token.
 */
export const POST = withErrorHandling(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(cookieNames.REFRESH_COOKIE)?.value;
  if (!raw) return apiError("UNAUTHORIZED", "No refresh token", 401);

  const tokenHash = hashRefreshToken(raw);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return apiError("UNAUTHORIZED", "Refresh token invalid or expired", 401);
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const accessToken = signAccessToken(stored.user);
  const next = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { userId: stored.user.id, tokenHash: next.tokenHash, expiresAt: next.expiresAt },
  });

  cookieStore.set(cookieNames.ACCESS_COOKIE, accessToken, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 15,
  });
  cookieStore.set(cookieNames.REFRESH_COOKIE, next.raw, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });

  return ok({ refreshed: true });
});
