import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const q = searchParams.get("q") || undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 20);

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [totalItems, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return ok({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: `${o.user.firstName} ${o.user.lastName}`,
      customerEmail: o.user.email,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      totalCents: o.totalCents,
      currency: o.currency,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
    })),
    pagination: { page, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)), totalItems, pageSize },
  });
});