import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { addressSchema } from "@/schemas/checkout";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";

async function assertOwnership(userId, addressId) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    const err = new Error("Address not found");
    err.status = 404;
    throw err;
  }
  return address;
}

export const PUT = withErrorHandling(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await assertOwnership(user.id, id);

  const parsed = addressSchema.partial().safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Invalid address", 422);

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({ where: { id }, data: parsed.data });
  return ok({ address });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await assertOwnership(user.id, id);
  await prisma.address.delete({ where: { id } });
  return ok({ deleted: true });
});
