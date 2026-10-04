import { prisma } from "@/lib/db/prisma";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async () => {
  const methods = await prisma.deliveryMethod.findMany({ where: { isActive: true }, orderBy: { baseFeeCents: "asc" } });
  return ok({ methods });
});
