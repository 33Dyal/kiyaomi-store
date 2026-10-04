import { prisma } from "@/lib/db/prisma";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (req) => {
  const { searchParams } = new URL(req.url);
  const checkoutRequestId = searchParams.get("checkoutRequestId");
  if (!checkoutRequestId) return apiError("VALIDATION_ERROR", "checkoutRequestId is required", 422);

  const order = await prisma.order.findUnique({
    where: { mpesaCheckoutRequestId: checkoutRequestId },
    select: { orderNumber: true, paymentStatus: true, status: true },
  });
  if (!order) return apiError("NOT_FOUND", "Order not found", 404);

  return ok(order);
});