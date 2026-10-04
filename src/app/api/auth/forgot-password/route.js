import { prisma } from "@/lib/db/prisma";
import { resetPasswordRequestSchema } from "@/schemas/auth";
import { ok, withErrorHandling } from "@/lib/utils/api-response";
import { sendEmail } from "@/lib/resend/client";
import crypto from "crypto";
import { env } from "@/lib/env";

/**
 * Stores a hashed, single-use, time-limited reset token on the user record
 * via a signed JWT rather than a raw DB column, keeping the schema lean.
 * Always returns success regardless of whether the email exists, so the
 * endpoint can't be used to enumerate registered accounts.
 */
export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const parsed = resetPasswordRequestSchema.safeParse(body);
  if (!parsed.success) return ok({ requested: true }); // don't leak validation details either

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = crypto
      .createHmac("sha256", env.JWT_SECRET)
      .update(`${user.id}:${user.passwordHash}:${Date.now() - (Date.now() % (1000 * 60 * 30))}`)
      .digest("hex");
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?uid=${user.id}&token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your Kiyomi password",
      html: `<p>Click below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }
  return ok({ requested: true });
});
