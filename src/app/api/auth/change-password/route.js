import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { z } from "zod";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";

const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Invalid input", 422);

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return apiError("INVALID_CREDENTIALS", "Current password is incorrect", 401);

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return ok({ changed: true });
});
