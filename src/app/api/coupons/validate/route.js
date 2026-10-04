import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { validateCouponSchema } from "@/schemas/coupon";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";

/**
 * Server-side coupon validation (spec section 23) — never trust a discount
 * amount computed on the client. Returns the actual discountCents to apply;
 * checkout re-runs this same logic again at order-creation time rather than
 * trusting whatever this endpoint returned earlier in the session.
 */
export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const parsed = validateCouponSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Invalid request", 422);
  const { code, subtotalCents } = parsed.data;

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) return apiError("INVALID_COUPON", "This coupon code is not valid", 400);
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return apiError("INVALID_COUPON", "This coupon has expired", 400);
  if (coupon.minOrderAmountCents && subtotalCents < coupon.minOrderAmountCents) {
    return apiError("INVALID_COUPON", `Minimum order amount not met for this coupon`, 400);
  }
  if (coupon.usageLimit) {
    const totalUses = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
    if (totalUses >= coupon.usageLimit) return apiError("INVALID_COUPON", "This coupon has reached its usage limit", 400);
  }
  if (coupon.perCustomerLimit) {
    const userUses = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId: user.id } });
    if (userUses >= coupon.perCustomerLimit) return apiError("INVALID_COUPON", "You've already used this coupon", 400);
  }

  let discountCents = coupon.type === "PERCENTAGE"
    ? Math.round((subtotalCents * coupon.percentage) / 100)
    : coupon.fixedAmountCents;
  if (coupon.maxDiscountCents) discountCents = Math.min(discountCents, coupon.maxDiscountCents);
  discountCents = Math.min(discountCents, subtotalCents);

  return ok({ coupon: { id: coupon.id, code: coupon.code }, discountCents });
});
