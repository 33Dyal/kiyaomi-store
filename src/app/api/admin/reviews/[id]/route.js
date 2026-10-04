import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const updateSchema = z.object({ status: z.enum(["APPROVED", "HIDDEN"]) });

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Invalid status", 422);

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return apiError("NOT_FOUND", "Review not found", 404);

  const review = await prisma.review.update({ where: { id }, data: { status: parsed.data.status } });
  return ok({ review });
});