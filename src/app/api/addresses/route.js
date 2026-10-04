import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { addressSchema } from "@/schemas/checkout";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } });
  return ok({ addresses });
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid address", 422);

  const existingCount = await prisma.address.count({ where: { userId: user.id } });
  const address = await prisma.address.create({
    data: { ...parsed.data, userId: user.id, isDefault: existingCount === 0 },
  });
  return ok({ address }, { status: 201 });
});
