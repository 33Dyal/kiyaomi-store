import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN", "STAFF");

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    pendingOrders,
    revenueAgg,
    todayRevenueAgg,
    lowStockVariants,
    recentOrders,
    totalCustomers,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { totalCents: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
      _sum: { totalCents: true },
    }),
        prisma.inventory.findMany({
      include: { variant: { include: { product: { select: { name: true, slug: true } } } } },
    }).then((all) => all.filter((inv) => inv.quantity <= inv.lowStockThreshold).slice(0, 10)),
    
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return ok({
    totalOrders,
    pendingOrders,
    monthRevenueCents: revenueAgg._sum.totalCents ?? 0,
    todayRevenueCents: todayRevenueAgg._sum.totalCents ?? 0,
    totalCustomers,
    lowStock: lowStockVariants.map((inv) => ({
      productName: inv.variant.product.name,
      productSlug: inv.variant.product.slug,
      variantLabel: [inv.variant.size, inv.variant.color].filter(Boolean).join(" / ") || null,
      quantity: inv.quantity,
      threshold: inv.lowStockThreshold,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: `${o.user.firstName} ${o.user.lastName}`,
      totalCents: o.totalCents,
      status: o.status,
      createdAt: o.createdAt,
    })),
  });
});