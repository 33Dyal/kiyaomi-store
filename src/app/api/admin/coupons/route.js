import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { createCouponSchema } from "@/schemas/coupon";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined; // active | expired | inactive
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 20);

  const now = new Date();
  const where = {
    ...(q ? { code: { contains: q, mode: "insensitive" } } : {}),
    ...(status === "active" ? { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } : {}),
    ...(status === "expired" ? { expiresAt: { lt: now } } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
  };

  const [totalItems, coupons] = await Promise.all([
    prisma.coupon.count({ where }),
    prisma.coupon.findMany({
      where,
      include: { _count: { select: { usages: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return ok({
    coupons: coupons.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      percentage: c.percentage,
      fixedAmountCents: c.fixedAmountCents,
      usageLimit: c.usageLimit,
      timesUsed: c._count.usages,
      expiresAt: c.expiresAt,
      isActive: c.isActive,
    })),
    pagination: { page, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)), totalItems, pageSize },
  });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const parsed = createCouponSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid coupon data", 422);
  const data = parsed.data;

  const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
  if (existing) return apiError("CONFLICT", "A coupon with this code already exists", 409);

  const coupon = await prisma.coupon.create({
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

  return ok({ coupon }, 201);
});