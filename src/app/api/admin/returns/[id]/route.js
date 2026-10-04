import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { notifyCustomer } from "@/lib/notifications";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"]).optional(),
  adminNotes: z.string().optional(),
  refundStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
});

export const GET = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id },
    include: {
      order: { include: { items: true } },
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
    },
  });
  if (!returnRequest) return apiError("NOT_FOUND", "Return request not found", 404);

  return ok({
    returnRequest: {
      id: returnRequest.id,
      reason: returnRequest.reason,
      status: returnRequest.status,
      adminNotes: returnRequest.adminNotes,
      refundStatus: returnRequest.refundStatus,
      requestedAt: returnRequest.requestedAt,
      customerName: `${returnRequest.user.firstName} ${returnRequest.user.lastName}`,
      customerEmail: returnRequest.user.email,
      customerPhone: returnRequest.user.phone,
      order: {
        orderNumber: returnRequest.order.orderNumber,
        totalCents: returnRequest.order.totalCents,
        items: returnRequest.order.items.map((i) => ({
          productName: i.productName, variantLabel: i.variantLabel, quantity: i.quantity, totalCents: i.totalCents,
        })),
      },
    },
  });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid update", 422);

  const existing = await prisma.returnRequest.findUnique({ where: { id }, include: { user: true, order: true } });
  if (!existing) return apiError("NOT_FOUND", "Return request not found", 404);

  const returnRequest = await prisma.returnRequest.update({ where: { id }, data: parsed.data });

  if (parsed.data.status && parsed.data.status !== existing.status) {
    const statusMessages = {
      APPROVED: "Your return request has been approved. Please follow the instructions we've sent to ship the item back.",
      REJECTED: "Your return request has been reviewed and was not approved.",
      RECEIVED: "We've received your returned item and are processing it.",
      REFUNDED: "Your refund has been processed.",
    };
    const body = statusMessages[parsed.data.status];
    if (body) {
      await notifyCustomer({
        userId: existing.userId,
        title: "Return request update",
        body,
        email: existing.user.email,
        subject: `Kiyomi — return update for order ${existing.order.orderNumber}`,
        html: `<p>Hi ${existing.user.firstName}, ${body}</p>`,
      });
    }
  }

  return ok({ returnRequest });
});