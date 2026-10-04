import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { updateCouponSchema } from "@/schemas/coupon";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (_req, { params }) => {
  await requireRole("ADMIN", "STAFF");

  const coupon = await prisma.coupon.findUnique({
    where: { id: params.id },
    include: { usages: { orderBy: { createdAt: "desc" }, take: 50 }, _count: { select: { usages: true } } },
  });
  if (!coupon) return apiError("NOT_FOUND", "Coupon not found", 404);

  return ok({ coupon });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");

  const parsed = updateCouponSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid coupon data", 422);
  const data = parsed.data;

  const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("NOT_FOUND", "Coupon not found", 404);

  if (data.code !== existing.code) {
    const codeTaken = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (codeTaken) return apiError("CONFLICT", "A coupon with this code already exists", 409);
  }

  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data: {
      code: data.code,
      type: data.type,
      percentage: data.type === "PERCENTAGE" ? data.percentage : null,
      fixedAmountCents: data.type === "FIXED_AMOUNT" ? data.fixedAmountCents : null,
      minOrderAmountCents: data.minOrderAmountCents || null,
      maxDiscountCents: data.maxDiscountCents || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      usageLimit: data.usageLimit || null,
      perCustomerLimit: data.perCustomerLimit || null,
      applicableCategoryIds: data.applicableCategoryIds,
      applicableProductIds: data.applicableProductIds,
      isActive: data.isActive,
    },
  });

  return ok({ coupon });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole("ADMIN", "STAFF");

  const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("NOT_FOUND", "Coupon not found", 404);

  // Soft delete via isActive rather than removing history tied to usages
  await prisma.coupon.update({ where: { id: params.id }, data: { isActive: false } });

  return ok({ success: true });
});