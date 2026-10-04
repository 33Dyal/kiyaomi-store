import { prisma } from "@/lib/db/prisma";
import { hashRefreshToken } from "@/lib/auth/tokens";
import { ok, withErrorHandling } from "@/lib/utils/api-response";
import { cookieNames } from "@/lib/auth/session";
import { cookies } from "next/headers";

export const POST = withErrorHandling(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(cookieNames.REFRESH_COOKIE)?.value;
  if (raw) {
    const tokenHash = hashRefreshToken(raw);
    await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
  }
  cookieStore.delete(cookieNames.ACCESS_COOKIE);
  cookieStore.delete(cookieNames.REFRESH_COOKIE);
  return ok({ loggedOut: true });
});
