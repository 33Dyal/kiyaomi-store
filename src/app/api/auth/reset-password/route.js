import { prisma } from "@/lib/db/prisma";
import { resetPasswordSchema } from "@/schemas/auth";
import { hashPassword } from "@/lib/auth/password";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { env } from "@/lib/env";
import crypto from "crypto";

const BUCKET_MS = 1000 * 60 * 30;

function tokenFor(user, bucket) {
  return crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(`${user.id}:${user.passwordHash}:${bucket}`)
    .digest("hex");
}

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid input", 422);
  }

  const { token, password } = parsed.data;
  const uid = body.uid;
  if (!uid) return apiError("VALIDATION_ERROR", "Missing user reference", 422);

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return apiError("INVALID_TOKEN", "This reset link is invalid or expired", 400);

  // The token is bucketed into 30-minute windows. Accept the current AND the
  // previous window so a link requested near the end of a window still lasts
  // at least 30 minutes (instead of possibly expiring within seconds).
  const now = Date.now();
  const currentBucket = now - (now % BUCKET_MS);
  const valid = [currentBucket, currentBucket - BUCKET_MS].some((bucket) => {
    const expected = tokenFor(user, bucket);
    return (
      expected.length === token.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
    );
  });

  if (!valid) return apiError("INVALID_TOKEN", "This reset link is invalid or expired", 400);

  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } });

  return ok({ reset: true });
});