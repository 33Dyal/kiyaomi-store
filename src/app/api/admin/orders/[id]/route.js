import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { notifyCustomer } from "@/lib/notifications";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum([
    "PENDING", "CONFIRMED", "PROCESSING", "READY_FOR_DELIVERY",
    "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED",
  ]).optional(),
  trackingNumber: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

export const GET = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      address: true,
      deliveryMethod: true,
      items: { include: { product: { select: { slug: true } } } },
      payments: true,
      coupon: true,
    },
  });
  if (!order) return apiError("NOT_FOUND", "Order not found", 404);

  return ok({ order });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid update", 422);

  const existing = await prisma.order.findUnique({ where: { id }, include: { user: true } });
  if (!existing) return apiError("NOT_FOUND", "Order not found", 404);

  const order = await prisma.order.update({ where: { id }, data: parsed.data });

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await notifyCustomer({
      userId: existing.userId,
      title: "Order update",
      body: `Your order ${existing.orderNumber} is now ${parsed.data.status.replace(/_/g, " ").toLowerCase()}.`,
      email: existing.user.email,
      subject: `Kiyomi — order ${existing.orderNumber} update`,
      html: `<p>Hi ${existing.user.firstName}, your order <strong>${existing.orderNumber}</strong> is now <strong>${parsed.data.status.replace(/_/g, " ").toLowerCase()}</strong>.</p>`,
    });
  }

  return ok({ order });
});