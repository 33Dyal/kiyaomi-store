import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN", "STAFF");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return ok({ categories });
});