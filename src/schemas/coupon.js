import { z } from "zod";

export const couponBaseSchema = z.object({
  code: z.string().min(3).max(30).transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  percentage: z.number().int().min(1).max(100).nullable().optional(),
  fixedAmountCents: z.number().int().positive().nullable().optional(),
  minOrderAmountCents: z.number().int().positive().nullable().optional(),
  maxDiscountCents: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perCustomerLimit: z.number().int().positive().nullable().optional(),
  applicableCategoryIds: z.array(z.string()).default([]),
  applicableProductIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.type === "PERCENTAGE" && !data.percentage) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["percentage"], message: "Percentage is required for percentage coupons" });
  }
  if (data.type === "FIXED_AMOUNT" && !data.fixedAmountCents) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fixedAmountCents"], message: "Fixed amount is required for fixed-amount coupons" });
  }
});

export const createCouponSchema = couponBaseSchema;
export const updateCouponSchema = couponBaseSchema;
export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  subtotalCents: z.number().int().nonnegative(),
});