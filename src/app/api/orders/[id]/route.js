import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return ok({
    orders: orders.map((o) => ({
      id: o.id, orderNumber: o.orderNumber, status: o.status, paymentStatus: o.paymentStatus,
      totalCents: o.totalCents, currency: o.currency, itemCount: o.items.length, createdAt: o.createdAt,
    })),
  });
});
