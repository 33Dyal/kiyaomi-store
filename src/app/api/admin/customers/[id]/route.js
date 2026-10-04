import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const updateSchema = z.object({
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export const GET = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!user || user.deletedAt) return apiError("NOT_FOUND", "Customer not found", 404);

  return ok({
    customer: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      addresses: user.addresses,
      orders: user.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalCents: o.totalCents,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
    },
  });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  const admin = await requireRole("ADMIN"); // only full ADMIN can change roles/status, not STAFF
  const { id } = await params;

  if (id === admin.id) return apiError("FORBIDDEN", "You can't change your own account here", 403);

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid update", 422);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return apiError("NOT_FOUND", "Customer not found", 404);

  const user = await prisma.user.update({ where: { id }, data: parsed.data });

  return ok({ user: { id: user.id, role: user.role, isActive: user.isActive } });
});