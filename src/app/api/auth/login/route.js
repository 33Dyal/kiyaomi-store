import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, generateRefreshToken } from "@/lib/auth/tokens";
import { loginSchema } from "@/schemas/auth";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { cookieNames } from "@/lib/auth/session";
import { cookies } from "next/headers";

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Enter a valid email and password", 422);
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Deliberately identical error for "no such user" and "wrong password" —
  // don't leak which emails are registered.
  if (!user || !user.isActive || user.deletedAt) {
    return apiError("INVALID_CREDENTIALS", "Incorrect email or password", 401);
  }
  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return apiError("INVALID_CREDENTIALS", "Incorrect email or password", 401);
  }

  const accessToken = signAccessToken(user);
  const { raw, tokenHash, expiresAt } = generateRefreshToken();
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(cookieNames.ACCESS_COOKIE, accessToken, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 15,
  });
  cookieStore.set(cookieNames.REFRESH_COOKIE, raw, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });

  return ok({
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
  });
});
