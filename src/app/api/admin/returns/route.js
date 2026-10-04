import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  const returns = await prisma.returnRequest.findMany({
    where: status ? { status } : {},
    include: {
      order: { select: { orderNumber: true, totalCents: true, currency: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return ok({
    returns: returns.map((r) => ({
      id: r.id,
      orderNumber: r.order.orderNumber,
      totalCents: r.order.totalCents,
      customerName: `${r.user.firstName} ${r.user.lastName}`,
      customerEmail: r.user.email,
      reason: r.reason,
      status: r.status,
      refundStatus: r.refundStatus,
      requestedAt: r.requestedAt,
    })),
  });
});