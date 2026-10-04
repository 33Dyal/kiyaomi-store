import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search") || undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 20);

  const where = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalItems, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { orders: { select: { totalCents: true, paymentStatus: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return ok({
    customers: users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      orderCount: u.orders.length,
      totalSpentCents: u.orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.totalCents, 0),
      createdAt: u.createdAt,
    })),
    pagination: { page, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)), totalItems, pageSize },
  });
});