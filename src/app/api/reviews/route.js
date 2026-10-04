import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const createSchema = z.object({
  orderItemId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid review", 422);
  const { orderItemId, productId, rating, comment } = parsed.data;

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: true },
  });
  if (!orderItem || orderItem.order.userId !== user.id) {
    return apiError("NOT_FOUND", "Order item not found", 404);
  }
  if (orderItem.order.status !== "DELIVERED") {
    return apiError("FORBIDDEN", "You can only review items from delivered orders", 403);
  }

  const existing = await prisma.review.findUnique({ where: { orderItemId } });
  if (existing) return apiError("CONFLICT", "You've already reviewed this item", 409);

  const review = await prisma.review.create({
    data: {
      productId,
      userId: user.id,
      orderItemId,
      rating,
      comment: comment || null,
      status: "PENDING", // requires admin approval before showing publicly
    },
  });

  return ok({ review }, 201);
});