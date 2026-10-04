import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 20);

  const where = status ? { status } : {};

  const [totalItems, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return ok({
    tickets: tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      category: t.category,
      orderNumber: t.orderNumber,
      status: t.status,
      customerName: `${t.user.firstName} ${t.user.lastName}`,
      customerEmail: t.user.email,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    pagination: { page, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)), totalItems, pageSize },
  });
});