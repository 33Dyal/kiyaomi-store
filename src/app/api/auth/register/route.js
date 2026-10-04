import { after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, generateRefreshToken } from "@/lib/auth/tokens";
import { registerSchema } from "@/schemas/auth";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { cookieNames } from "@/lib/auth/session";
import { notifyCustomer } from "@/lib/notifications";
import { cookies } from "next/headers";

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid input", 422);
  }
  const { firstName, lastName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return apiError("EMAIL_TAKEN", "An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone: phone || undefined, // blank optional phone is stored as "not provided"
      passwordHash,
      role: "CUSTOMER",
    },
  });

  await prisma.wishlist.create({ data: { userId: user.id } });

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

  // Runs after the response is sent, but the platform keeps the request alive
  // until it finishes (a plain un-awaited promise can be killed on serverless).
  // Never blocks registration, and failures are logged instead of swallowed.
  after(async () => {
    try {
      await notifyCustomer({
        userId: user.id,
        title: "Welcome to Kiyomi",
        body: "Your account has been created.",
        email: user.email,
        subject: "Welcome to Kiyomi Online Store",
        html: `<p>Hi ${firstName}, welcome to Kiyomi. We're glad you're here.</p>`,
      });
    } catch (err) {
      console.error("[register] welcome notification failed:", err);
    }
  });

  return ok({ user: { id: user.id, firstName, lastName, email, role: user.role } }, { status: 201 });
});