import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

// Simplified email verification: in production, send a signed link the same
// way forgot-password does, and have this route consume ?token=. Left as a
// direct authenticated confirm endpoint here since Resend delivery is
// optional/unconfigured in this environment — swap in the token flow once
// RESEND_API_KEY is set.
export const POST = withErrorHandling(async () => {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  return ok({ verified: true });
});
